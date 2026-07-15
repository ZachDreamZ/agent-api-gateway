// ─── Startup Migration ───────────────────────────────────────────────────────
// Runs Better Auth schema migration if not yet applied.
// Safe: uses advisory lock + history table for idempotent execution.
// Runs once at startup before the server listens.
//
// DNS issue workaround: the local DNS proxy (127.0.0.1) on this machine and
// Render can't resolve IPv6-only hosts like db.iekbgbncsxiwdgrqlpfh.supabase.co.
// We resolve via an explicit DNS resolver (8.8.8.8 / 1.1.1.1) and connect to
// the raw IP address.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resolver } from 'node:dns/promises';
import pg from 'pg';

const { Pool } = pg;

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function resolveHost(host: string): Promise<string> {
  // Try IPv4 first (faster, wider compatibility)
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  try {
    const v4 = await resolver.resolve4(host);
    if (v4.length > 0) {
      return v4[0];
    }
  } catch {
    // No IPv4 — fall through to IPv6
  }

  try {
    const v6 = await resolver.resolve6(host);
    if (v6.length > 0) {
      return v6[0]; // Return raw IPv6 address
    }
  } catch {
    // No IPv6 either — throw
  }

  throw new Error(`Could not resolve hostname: ${host}`);
}

export async function runMigration(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.log('[migrate] No DATABASE_URL set, skipping migration');
    return;
  }

  // Parse URL to extract connection parts
  const url = new URL(databaseUrl);
  const host = url.hostname;
  const port = parseInt(url.port || '5432', 10);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, '');

  console.log(`[migrate] Resolving database host: ${host}...`);

  let resolvedHost: string;
  try {
    resolvedHost = await resolveHost(host);
    console.log(`[migrate] Resolved ${host} → ${resolvedHost}`);
  } catch (err) {
    console.error(`[migrate] DNS resolution failed for ${host}: ${err instanceof Error ? err.message : String(err)}`);
    console.error('[migrate] Cannot proceed with migration');
    return;
  }

  console.log('[migrate] Acquiring migration lock...');

  const pool = new Pool({
    host: resolvedHost,
    port,
    user,
    password,
    database,
    // For IPv6 literal addresses, wrap in [] for SSL SNI but pass raw to pg
    ssl: {
      rejectUnauthorized: false,
      servername: host, // SNI must use the original hostname, not the resolved IP
    },
    max: 1,
    connectionTimeoutMillis: 20000,
  });

  try {
    // Advisory lock — prevents concurrent migration runs
    await pool.query("SELECT pg_advisory_xact_lock(123456789)");
    console.log('[migrate] Lock acquired');

    // Create migration history table if missing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migration_history (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const migrationName = '001_better_auth';
    const { rows } = await pool.query(
      'SELECT 1 FROM _migration_history WHERE name = $1',
      [migrationName],
    );

    if (rows.length > 0) {
      console.log(`[migrate] "${migrationName}" already applied, skipping`);
      return;
    }

    // Read and execute migration SQL
    const sqlPath = join(__dirname, '..', '..', '..', 'supabase', 'better-auth.sql');
    if (!existsSync(sqlPath)) {
      console.log(`[migrate] Migration file not found at ${sqlPath}, skipping`);
      return;
    }

    const sql = readFileSync(sqlPath, 'utf8');
    console.log('[migrate] Running migration...');

    await pool.query(sql);
    await pool.query(
      'INSERT INTO _migration_history (name) VALUES ($1)',
      [migrationName],
    );

    console.log('[migrate] Migration applied successfully');
  } catch (err) {
    console.error('[migrate] Migration failed:', err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
      console.error('[migrate] Stack:', err.stack.split('\n').slice(0, 4).join('\n'));
    }
    console.error('[migrate] Continuing despite migration failure');
  } finally {
    await pool.end();
  }
}
