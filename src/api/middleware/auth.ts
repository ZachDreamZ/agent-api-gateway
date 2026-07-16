import type { MiddlewareHandler } from 'hono';
import { auth, type AuthUser } from '../../auth/auth.js';
import type { Tier } from '@shared/types';

// Replaces the old API-key lookup. Validates either a Better Auth session
// cookie (dashboard) or a Bearer API key (programmatic clients) and exposes
// the resolved user + tier to downstream routes.
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Direct GET to Better Auth's get-session endpoint
  const req = c.req.raw;
  const baseUrl = new URL(req.url);
  baseUrl.pathname = '/api/auth/get-session';
  const sessionReq = new Request(baseUrl, {
    method: 'GET',
    headers: req.headers,
  });

  let sessionRes: Response;
  try {
    sessionRes = await auth.handler(sessionReq);
  } catch (err) {
    console.error('[auth] handler error:', err);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await sessionRes.clone().text();
  console.log('[auth] get-session status:', sessionRes.status, 'body:', body.substring(0, 200));

  if (!sessionRes.ok) {
    return c.json({ error: 'Unauthorized. Send a valid API key.' }, 401);
  }

  let session: { user: AuthUser; session: any } | null = null;
  try {
    session = JSON.parse(body);
  } catch {
    console.error('[auth] JSON parse failed');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!session || !session.user) {
    return c.json({ error: 'Unauthorized. Send a valid API key.' }, 401);
  }

  const user = session.user as AuthUser & { tier?: string };
  c.set('userId', user.id);
  c.set('user', user);
  c.set('tier', (user.tier ?? 'free') as Tier);

  await next();
};
