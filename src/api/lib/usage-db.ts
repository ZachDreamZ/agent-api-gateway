// ─── Usage Logging — Direct PostgreSQL (no Supabase) ───

import { getPool } from './db.js';

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

/** Purchased credit packs (bonus) stack on top of the monthly tier allowance. */
export async function getBonusCredits(userId: string): Promise<number> {
  try {
    const p = getPool();
    const { rows } = await p.query(
      `SELECT COALESCE(bonus_credits, 0) AS bonus_credits FROM "user" WHERE id = $1`,
      [userId],
    );
    return Number(rows[0]?.bonus_credits ?? 0);
  } catch (err) {
    // Column may not exist until migration 004_bonus_credits.sql is applied
    console.error('[usage-db] getBonusCredits error:', err);
    return 0;
  }
}

export async function addBonusCredits(userId: string, amount: number): Promise<number> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('bonus credit amount must be positive');
  }
  const p = getPool();
  const { rows } = await p.query(
    `UPDATE "user"
     SET bonus_credits = COALESCE(bonus_credits, 0) + $2
     WHERE id = $1
     RETURNING bonus_credits`,
    [userId, Math.floor(amount)],
  );
  if (!rows[0]) throw new Error(`user not found: ${userId}`);
  return Number(rows[0].bonus_credits);
}

export async function findUserIdByEmail(email: string): Promise<string | null> {
  try {
    const p = getPool();
    const { rows } = await p.query(
      `SELECT id FROM "user" WHERE lower(email) = lower($1) LIMIT 1`,
      [email.trim()],
    );
    return (rows[0]?.id as string | undefined) ?? null;
  } catch (err) {
    console.error('[usage-db] findUserIdByEmail error:', err);
    return null;
  }
}

/**
 * Remaining = monthly tier allowance + purchased bonus credits − usage this month.
 */
export async function getCreditBalance(
  userId: string,
  monthlyLimit: number,
): Promise<{ used: number; bonus: number; remaining: number; limit: number }> {
  const [used, bonus] = await Promise.all([
    getMonthlyCreditsUsed(userId),
    getBonusCredits(userId),
  ]);
  const limit = monthlyLimit + bonus;
  return {
    used,
    bonus,
    remaining: Math.max(0, limit - used),
    limit,
  };
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
