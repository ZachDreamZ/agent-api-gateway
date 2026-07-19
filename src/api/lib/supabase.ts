import { getPool } from './db.js';

export async function updateUser(userId: string, updates: Record<string, unknown>): Promise<void> {
  if (Object.keys(updates).length === 0) return;
  const pool = getPool();
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(updates)) {
    setClauses.push(`"${key}" = $${idx++}`);
    values.push(value);
  }
  values.push(userId);
  await pool.query(
    `UPDATE "user" SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
}