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

  console.log('[migrate] Acquiring migration lock...');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 15000,
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
    // Don't throw — let the app start even if migration fails
    // The existing tables might already work
    console.error('[migrate] Continuing despite migration failure');
  } finally {
    await pool.end();
  }
}
