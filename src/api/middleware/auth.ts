import type { MiddlewareHandler } from 'hono';
import { auth, type AuthUser } from '../../auth/auth.js';
import type { Tier } from '@shared/types';

// Replaces the old API-key lookup. Validates either a Better Auth session
// cookie (dashboard) or a Bearer API key (programmatic clients) and exposes
// the resolved user + tier to downstream routes.
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Validate session by dispatching through Better Auth's own handler.
  // We copy the request URL to point at /api/auth/get-session so auth.handler
  // processes it through the full plugin pipeline (including API key hooks).
  const req = c.req.raw;
  const url = new URL(req.url);
  url.pathname = '/api/auth/get-session';
  const sessionReq = new Request(url, {
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

  if (!sessionRes.ok) {
    return c.json({ error: 'Unauthorized. Send a valid API key.' }, 401);
  }

  let session: { user: AuthUser; session: any } | null = null;
  try {
    session = await sessionRes.json();
  } catch {
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
