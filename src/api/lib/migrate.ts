// ─── Startup Migration ───────────────────────────────────────────────────────
// Runs Better Auth schema migration if not yet applied.
// Safe: uses advisory lock + history table for idempotent execution.
// Runs once at startup before the server listens.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from './db.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Creates a per-app login role with its own password (from env) and grants the
// same working privileges the apps need on the public schema. Idempotent.
async function ensureAppRole(
  pool: ReturnType<typeof getPool>,
  role: string,
  password: string | undefined,
): Promise<void> {
  if (!password) {
    console.log(`[migrate] ${role}: AGENTAPI/STATUSPLATE_APP_DB_PASSWORD not set, skipping role creation`);
    return;
  }
  // CREATE/ALTER ROLE ... PASSWORD does not accept a $1 bind in DDL, so we
  // interpolate the password as a safely-escaped SQL string literal. The value
  // comes only from our own env secret (never user input).
  const esc = (s: string): string => s.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const pw = esc(password);
  try {
    const { rows } = await pool.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role]);
    if (rows.length === 0) {
      await pool.query(`CREATE ROLE "${role}" LOGIN PASSWORD '${pw}'`);
      console.log(`[migrate] Created role "${role}"`);
    } else {
      // Rotate password on each deploy so it stays in sync with the env secret.
      await pool.query(`ALTER ROLE "${role}" LOGIN PASSWORD '${pw}'`);
      console.log(`[migrate] Role "${role}" already exists, password synced`);
    }
    await pool.query('GRANT CONNECT ON DATABASE agentapi_kjz2 TO "' + role + '"');
    await pool.query('GRANT USAGE, CREATE ON SCHEMA public TO "' + role + '"');
    await pool.query(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "' + role + '"',
    );
    await pool.query(
      'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "' + role + '"',
    );
    await pool.query(
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "' +
        role +
        '"',
    );
    await pool.query(
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "' +
        role +
        '"',
    );
    console.log(`[migrate] Granted privileges to "${role}"`);
  } catch (e) {
    console.error(`[migrate] Failed to ensure role "${role}":`, e instanceof Error ? e.message : e);
  }
}

export async function runMigration(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.log('[migrate] No DATABASE_URL set, skipping migration');
    return;
  }

  console.log(`[migrate] Connecting to database...`);

  // Shared pool with a single, consistent SSL policy (db.ts).
  const pool = getPool();

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
      { name: '003_rate_limit', file: '003_rate_limit.sql' },
      { name: '004_bonus_credits', file: '004_bonus_credits.sql' },
      { name: '005_two_factor', file: '005_two_factor.sql' },
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

    // ─── Least-privilege per-app DB roles (network segmentation) ───
    // Creates agentapi_app / statusplate_app roles with their own credentials so
    // each app's DB password is independently revocable. Passwords come from env
    // (AGENTAPI_APP_DB_PASSWORD / STATUSPLATE_APP_DB_PASSWORD) — never committed
    // to source. Idempotent via IF NOT EXISTS. Does not alter the shared owner
    // role (agentapi_user). Run after the schema migrations above.
    await ensureAppRole(pool, 'agentapi_app', process.env['AGENTAPI_APP_DB_PASSWORD']);
    await ensureAppRole(pool, 'statusplate_app', process.env['STATUSPLATE_APP_DB_PASSWORD']);
  } catch (err) {
    console.error('[migrate] Migration failed:', err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
      console.error('[migrate] Stack:', err.stack.split('\n').slice(0, 4).join('\n'));
    }
    console.error('[migrate] Continuing despite migration failure');
  }
  // Do NOT pool.end() — the shared pool is reused by the running server.
}
