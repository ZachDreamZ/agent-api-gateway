import type { MiddlewareHandler } from 'hono';
import { TIER_LIMITS } from '../../shared/types.js';

// ─── In-Memory Sliding Window ───
// Keyed by API key ID. Each entry is an array of request timestamps (ms).
const windows = new Map<string, number[]>();

// Periodic cleanup every 60s
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, timestamps] of windows) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      windows.delete(key);
    } else {
      windows.set(key, valid);
    }
  }
}, 60_000).unref();

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const tier = c.get('tier');
  const apiKeyId = c.get('apiKey').id;
  const limit = TIER_LIMITS[tier].rate_limit_rpm;

  const now = Date.now();
  const cutoff = now - 60_000;

  let timestamps = windows.get(apiKeyId) ?? [];
  timestamps = timestamps.filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    const retryAfter = Math.ceil((timestamps[0]! - cutoff) / 1000);
    c.header('Retry-After', String(retryAfter));
    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', '0');
    return c.json(
      {
        error: 'Rate limit exceeded',
        retry_after_seconds: retryAfter,
        limit,
      },
      429,
    );
  }

  timestamps.push(now);
  windows.set(apiKeyId, timestamps);

  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(limit - timestamps.length));

  await next();
};
