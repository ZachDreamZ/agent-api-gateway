import type { MiddlewareHandler } from 'hono';
import { auth, type AuthUser } from '../../auth/auth.js';
import type { Tier } from '@shared/types';

// Replaces the old API-key lookup. Validates either a Better Auth session
// cookie (dashboard) or a Bearer API key (programmatic clients) and exposes
// the resolved user + tier to downstream routes.
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Validate session via Better Auth. We pass the full Request object so
  // Better Auth can read cookies and the Authorization header (which the
  // apiKey plugin now parses via customAPIKeyGetter).
  let session;
  try {
    session = await auth.api.getSession({
      request: c.req.raw,
      query: { disableCookieCache: true },
    });
  } catch (err) {
    console.error('[auth] getSession error:', err);
    return c.json(
      { error: 'Unauthorized. Send a valid API key as `Authorization: Bearer <key>`.' },
      401,
    );
  }

  if (!session) {
    return c.json(
      { error: 'Unauthorized. Send a valid API key as `Authorization: Bearer <key>`.' },
      401,
    );
  }

  const user = session.user as AuthUser & { tier?: string };
  c.set('userId', user.id);
  c.set('user', user);
  c.set('tier', (user.tier ?? 'free') as Tier);

  await next();
};
