// ─── Access review (OpenVPN checklist: regular access reviews) ───
// Lists every user with data access, their tier, 2FA enrollment, and last
// session time, and flags accounts that have been inactive beyond the
// threshold. Run periodically (e.g. quarterly) to prune stale access.
//
// Usage:  DATABASE_URL=... npx tsx scripts/access-review.ts [--inactive-days=90]

import pg from 'pg';

const { Pool } = pg;

const INACTIVE_DAYS = Number(
  (process.argv.find((a) => a.startsWith('--inactive-days=')) || '--inactive-days=90').split('=')[1],
) || 90;

async function main() {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.email,
        u."emailVerified" AS email_verified,
        u.tier,
        u."twoFactorEnabled" AS two_factor_enabled,
        (SELECT MAX(s."createdAt") FROM "session" s WHERE s."userId" = u.id) AS last_session,
        (SELECT COUNT(*) FROM "session" s WHERE s."userId" = u.id) AS session_count
      FROM "user" u
      ORDER BY last_session NULLS FIRST, u."createdAt" DESC
    `);

    const now = Date.now();
    const inactiveCutoff = now - INACTIVE_DAYS * 24 * 60 * 60 * 1000;
    let inactive = 0;
    let no2fa = 0;

    console.log(`ACCESS REVIEW — ${rows.length} users (inactive threshold: ${INACTIVE_DAYS}d)`);
    console.log('─'.repeat(90));
    for (const r of rows) {
      const last = r.last_session ? new Date(r.last_session).getTime() : 0;
      const isInactive = !last || last < inactiveCutoff;
      if (isInactive) inactive++;
      if (!r.two_factor_enabled) no2fa++;
      const flag = isInactive ? ' [INACTIVE]' : '';
      console.log(
        `${r.email.padEnd(38)} tier=${String(r.tier).padEnd(6)} ` +
          `2fa=${r.two_factor_enabled ? 'Y' : 'N'} ` +
          `verified=${r.email_verified ? 'Y' : 'N'} ` +
          `last=${r.last_session ? String(r.last_session).slice(0, 19) : 'never'}${flag}`,
      );
    }
    console.log('─'.repeat(90));
    console.log(`Total: ${rows.length} | Inactive (>${INACTIVE_DAYS}d): ${inactive} | No 2FA: ${no2fa}`);
    if (inactive > 0) {
      console.log('ACTION: review/disable inactive accounts above.');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('access-review failed:', e);
  process.exit(1);
});
