import type { MiddlewareHandler } from 'hono';
import { auth, type AuthUser } from '../../auth/auth.js';
import { Pool } from 'pg';
import type { Tier } from '@shared/types';

async function findUserById(userId: string): Promise<(AuthUser & { tier?: string }) | null> {
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
      [userId],
    );
    return rows.length > 0 ? (rows[0] as AuthUser & { tier?: string }) : null;
  } finally {
    await pool.end().catch(() => {});
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const raw = c.req.raw;
  const rawHeaders: Record<string, string> = {};
  raw.headers.forEach((v, k) => { rawHeaders[k] = v; });

  // ── 1. Try session via auth.handler (proper HTTP context with getSignedCookie) ──
  const authHeader = rawHeaders['authorization'] || rawHeaders['Authorization'];
  const cookie = rawHeaders['cookie'];

  if (cookie || (authHeader && authHeader.startsWith('Bearer '))) {
    try {
      // Clone the request, rewrite to get-session, dispatch through Better Auth's
      // full HTTP pipeline so cookie parsing + bearer plugin work correctly.
      const url = new URL(raw.url);
      url.pathname = '/api/auth/get-session';
      const sessionReq = new Request(url, {
        method: 'GET',
        headers: raw.headers,
      });
      const sessionRes = await auth.handler(sessionReq);
      if (sessionRes && sessionRes.ok) {
        const body = await sessionRes.json();
        if (body && body.user) {
          const user = body.user as AuthUser & { tier?: string };
          c.set('userId', user.id);
          c.set('user', user);
          c.set('tier', (user.tier ?? 'free') as Tier);
          await next();
          return;
        }
      }
    } catch (e) {
      console.error('[auth] handler session error:', e);
    }
  }

  // ── 2. Fallback: try Bearer as API key ──
  if (!cookie && authHeader && authHeader.startsWith('Bearer ')) {
    const keyValue = authHeader.slice(7).trim();
    if (keyValue) {
      try {
        const result: any = await (auth.api as any).verifyApiKey({
          body: { key: keyValue },
        });
        if (result?.valid && result?.key?.referenceId) {
          const user = await findUserById(result.key.referenceId);
          if (user) {
            c.set('userId', user.id);
            c.set('user', user);
            c.set('tier', (user.tier ?? 'free') as Tier);
            await next();
            return;
          }
        }
      } catch (e) {
        console.error('[auth] verifyApiKey error:', e);
      }
    }
  }

  return c.json(
    { error: 'Unauthorized. Send a valid API key as `Authorization: Bearer <key>`.' },
    401,
  );
};
