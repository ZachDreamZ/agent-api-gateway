// ─── Shared PostgreSQL pool ──────────────────────────────────────────────────
// Single connection pool reused across the app so we can enforce one global
// statement timeout and a consistent SSL policy. Raw SQL here is always
// parameterized ($1, $2, …); never interpolate user input into query strings.

import pg from 'pg';

const { Pool } = pg;

function buildSsl(): { require: boolean; rejectUnauthorized: boolean } | undefined {
  const url = process.env['DATABASE_URL'] ?? '';
  // Supabase / Render Postgres use managed TLS. We enforce encryption in transit
  // (require: true) but cannot pin a CA bundle (Render does not publish one), so
  // chain verification is relaxed. Connections run over Render's private network
  // between co-located services, which limits MITM exposure.
  if (url.includes('supabase.co') || url.includes('render.com') || url.includes('dpg-')) {
    return { require: true, rejectUnauthorized: false };
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
