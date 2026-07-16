// ─── Startup Migration ───────────────────────────────────────────────────────
// Runs Better Auth schema migration if not yet applied.
// Safe: uses advisory lock + history table for idempotent execution.
// Runs once at startup before the server listens.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function runMigration(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.log('[migrate] No DATABASE_URL set, skipping migration');
    return;
  }

  console.log(`[migrate] Connecting to database...`);

  // Connect using the raw connection string — system DNS handles resolution.
  // Custom DNS is only needed for IPv6-only Supabase hosts; Render PostgreSQL
  // uses IPv4 and Resolver's internal DNS.
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.co')
      ? { rejectUnauthorized: false }
      : databaseUrl.includes('render.com') || databaseUrl.includes('dpg-')
        ? { rejectUnauthorized: false }
        : undefined,
    max: 1,
    connectionTimeoutMillis: 15000,
  });

  try {
    // Test connectivity
    await pool.query('SELECT 1');
    console.log('[migrate] Connected');

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

    const MIGRATIONS = [
      { name: '001_better_auth', file: 'better-auth.sql' },
      { name: '002_usage_logs', file: '002_usage_logs.sql' },
    ];

    for (const m of MIGRATIONS) {
      const { rows } = await pool.query(
        'SELECT 1 FROM _migration_history WHERE name = $1',
        [m.name],
      );

      if (rows.length > 0) {
        console.log(`[migrate] "${m.name}" already applied, skipping`);
        continue;
      }

      const sqlPath = join(__dirname, '..', '..', '..', 'supabase', m.file);
      if (!existsSync(sqlPath)) {
        console.log(`[migrate] Migration file not found at ${sqlPath}, skipping`);
        continue;
      }

      const sql = readFileSync(sqlPath, 'utf8');
      console.log(`[migrate] Running "${m.name}"...`);

      await pool.query(sql);
      await pool.query(
        'INSERT INTO _migration_history (name) VALUES ($1)',
        [m.name],
      );

      console.log(`[migrate] "${m.name}" applied successfully`);
    }
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
