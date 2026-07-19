import type { MiddlewareHandler } from 'hono';
import { auth, type AuthUser } from '../../auth/auth.js';
import { getPool } from '../lib/db.js';
import type { Tier } from '@shared/types';

async function findUserById(userId: string): Promise<(AuthUser & { tier?: string }) | null> {
  const { rows } = await getPool().query(
    `SELECT id, name, email, "emailVerified",
            image, "createdAt", "updatedAt",
            tier, stripe_customer_id
     FROM "user" WHERE id = $1`,
    [userId],
  );
  return rows.length > 0 ? (rows[0] as AuthUser & { tier?: string }) : null;
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
          c.set('apiKey', { id: 'session' });
          await next();
          return;
        }
      }
    } catch (e) {
      console.error('[auth] handler session error:', e);
    }
  }

  // ── 2. Fallback: try Bearer as API key ──
  // Check API key even if an expired session cookie exists (line 26 path
  // returned without calling next() meaning auth failed).
  if (authHeader && authHeader.startsWith('Bearer ')) {
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
            c.set('apiKey', { id: result.key.id });
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
