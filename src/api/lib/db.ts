// ─── Shared PostgreSQL pool ──────────────────────────────────────────────────
// Single connection pool reused across the app so we can enforce one global
// statement timeout and a consistent SSL policy. Raw SQL here is always
// parameterized ($1, $2, …); never interpolate user input into query strings.

import pg from 'pg';

const { Pool } = pg;

function buildSsl(): { rejectUnauthorized: boolean } | undefined {
  const url = process.env['DATABASE_URL'] ?? '';
  // Supabase / Render Postgres present valid certs — verify them.
  if (url.includes('supabase.co') || url.includes('render.com') || url.includes('dpg-')) {
    return { rejectUnauthorized: true };
  }
  // Local / unknown — leave default (no SSL) for dev convenience.
  return undefined;
}

let pool: InstanceType<typeof Pool> | null = null;

export function getPool(): InstanceType<typeof Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env['DATABASE_URL'],
      max: 10,
      connectionTimeoutMillis: 10000,
      // Hard cap so a bad query can never tie up connections forever.
      statement_timeout: 5000,
      ssl: buildSsl(),
    });
  }
  return pool;
}
