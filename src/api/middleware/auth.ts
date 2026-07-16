import type { MiddlewareHandler } from 'hono';
import { auth, type AuthUser } from '../../auth/auth.js';
import { Pool } from 'pg';
import type { Tier } from '@shared/types';

// Validates either a Better Auth session (dashboard cookies / Bearer session
// tokens) or a Bearer API key (programmatic clients). API keys are resolved
// via Better Auth's verifyApiKey endpoint + a direct user lookup.
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const raw = c.req.raw;
  const rawHeaders: Record<string, string> = {};
  raw.headers.forEach((v, k) => { rawHeaders[k] = v; });

  // ── 1. Try Better Auth session (cookies / Bearer session tokens) ──
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
  try {
    session = await auth.api.getSession({
      request: raw,
      query: { disableCookieCache: true },
    });
  } catch (err) {
    console.error('[auth] getSession error:', err);
  }

  // ── 2. If that failed, try Authorization: Bearer as an API key ──
  if (!session) {
    const authHeader = rawHeaders['authorization'] || rawHeaders['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const keyValue = authHeader.slice(7).trim();
      if (keyValue) {
        try {
          const result: any = await (auth.api as any).verifyApiKey({
            body: { key: keyValue },
          });
          if (result?.valid && result?.key?.referenceId) {
            const pool = new Pool({
              connectionString: process.env.DATABASE_URL,
              max: 1,
              connectionTimeoutMillis: 5000,
            });
            try {
              const { rows } = await pool.query(
                `SELECT id, name, email, email_verified as "emailVerified",
                        image, created_at as "createdAt", updated_at as "updatedAt",
                        tier, stripe_customer_id
                 FROM "user" WHERE id = $1`,
                [result.key.referenceId],
              );
              if (rows.length > 0) {
                const user = rows[0] as AuthUser & { tier?: string };
                c.set('userId', user.id);
                c.set('user', user);
                c.set('tier', (user.tier ?? 'free') as Tier);
                await next();
                return;
              }
            } finally {
              await pool.end().catch(() => {});
            }
          }
        } catch (e) {
          console.error('[auth] verifyApiKey error:', e);
        }
      }
    }
  }

  // ── 3. Session found from step 1 ──
  if (session) {
    const user = session.user as AuthUser & { tier?: string };
    if (user) {
      c.set('userId', user.id);
      c.set('user', user);
      c.set('tier', (user.tier ?? 'free') as Tier);
      await next();
      return;
    }
  }

  return c.json(
    { error: 'Unauthorized. Send a valid API key as `Authorization: Bearer <key>`.' },
    401,
  );
};
