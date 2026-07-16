// ─── Usage Logging — Direct PostgreSQL (no Supabase) ───

import pg from 'pg';

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function getMonthlyCreditsUsed(userId: string): Promise<number> {
  try {
    const p = getPool();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { rows } = await p.query(
      `SELECT COALESCE(SUM(credits_used), 0) AS total
       FROM usage_logs
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, monthStart.toISOString()],
    );
    return Number(rows[0]?.total ?? 0);
  } catch (err) {
    console.error('[usage-db] getMonthlyCreditsUsed error:', err);
    return 0;
  }
}

export async function logUsage(opts: {
  userId: string;
  apiKeyId?: string;
  endpoint: string;
  schema?: string;
  url?: string;
  cached: boolean;
  latencyMs: number;
  creditsUsed: number;
}): Promise<void> {
  try {
    const p = getPool();
    await p.query(
      `INSERT INTO usage_logs (user_id, api_key_id, endpoint, schema, url, cached, latency_ms, credits_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [opts.userId, opts.apiKeyId ?? null, opts.endpoint, opts.schema ?? null, opts.url ?? null, opts.cached, opts.latencyMs, opts.creditsUsed],
    );
  } catch (err) {
    console.error('[usage-db] logUsage error:', err);
  }
}

export async function getDailyUsage(userId: string, days: number): Promise<Array<{ date: string; count: number }>> {
  try {
    const p = getPool();
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const { rows } = await p.query(
      `SELECT credits_used, created_at
       FROM usage_logs
       WHERE user_id = $1 AND created_at >= $2
       ORDER BY created_at ASC`,
      [userId, since.toISOString()],
    );

    const daily: Record<string, number> = {};
    for (const row of rows) {
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      daily[day] = (daily[day] ?? 0) + Number(row.credits_used ?? 0);
    }

    const result = Object.entries(daily).map(([date, count]) => ({ date, count }));
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  } catch (err) {
    console.error('[usage-db] getDailyUsage error:', err);
    return [];
  }
}
