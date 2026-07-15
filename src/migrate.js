// ─── Startup Migration Script ───────────────────────────────────────────────
// Runs Better Auth schema migration if tables don't exist yet.
// Executed once at app startup before the server listens.
// Uses DB connection pooling so it's safe even on multi-instance deploys.

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATION_LOCK_TABLE = '_migration_lock';
const MIGRATION_HISTORY_TABLE = '_migration_history';

async function ensureMigrationInfrastructure(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "${MIGRATION_HISTORY_TABLE}" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function isMigrationApplied(pool, name) {
  const result = await pool.query(
    `SELECT 1 FROM "${MIGRATION_HISTORY_TABLE}" WHERE name = $1`,
    [name]
  );
  return result.rows.length > 0;
}

async function markMigrationApplied(pool, name) {
  await pool.query(
    `INSERT INTO "${MIGRATION_HISTORY_TABLE}" (name) VALUES ($1)`,
    [name]
  );
}

async function acquireLock(pool) {
  // Use Postgres advisory lock (no table needed)
  await pool.query("SELECT pg_advisory_xact_lock(123456789)");
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
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
    await acquireLock(pool);
    console.log('[migrate] Lock acquired');

    await ensureMigrationInfrastructure(pool);

    const migrationName = '001_better_auth';
    if (await isMigrationApplied(pool, migrationName)) {
      console.log(`[migrate] Migration "${migrationName}" already applied, skipping`);
      return;
    }

    const sqlPath = path.join(__dirname, '..', 'supabase', 'better-auth.sql');
    if (!fs.existsSync(sqlPath)) {
      console.log(`[migrate] Migration file not found at ${sqlPath}, skipping`);
      return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('[migrate] Running migration...');

    await pool.query(sql);
    await markMigrationApplied(pool, migrationName);

    console.log('[migrate] Migration applied successfully');
  } catch (err) {
    console.error('[migrate] Migration failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

module.exports = { runMigration };
