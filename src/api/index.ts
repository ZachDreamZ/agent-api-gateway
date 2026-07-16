import { readFileSync, existsSync } from 'node:fs';
import { runMigration } from './lib/migrate.js';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getConfig, parseCorsOrigins } from './lib/config.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { extractRoutes } from './routes/extract.js';
import { schemasRoutes } from './routes/schemas.js';
import { usageRoutes } from './routes/usage.js';
import { billingApp, billingPricing } from './routes/billing.js';
import { webhookApp } from '../billing/webhooks-polar.js';
import { auth } from '../auth/auth.js';
// app.route('/v1/api-keys', apiKeysApp); — replaced by Better Auth apiKey plugin

// ─── Static file serving (built frontend) ───

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, '..', '..', 'dist');

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function serveStatic(c: any, filePath: string) {
  // Normalize: strip leading slashes so resolve() cannot escape DIST
  // (path.resolve(dist, '/assets/x') would otherwise jump to filesystem root).
  const safeRel = String(filePath || '')
    .replace(/^[/\\]+/, '')
    .replace(/\\/g, '/');
  if (!safeRel || safeRel.includes('..')) return null;

  const distRoot = resolve(DIST);
  const full = resolve(distRoot, safeRel);
  // Path traversal guard — resolved path must stay inside DIST
  if (full !== distRoot && !full.startsWith(distRoot + '\\') && !full.startsWith(distRoot + '/')) {
    return null;
  }
  if (!existsSync(full)) return null;
  const ext = extname(full);
  const content = readFileSync(full);
  const headers: Record<string, string> = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
  };
  // HTML shell must not be cached long — deploys would otherwise leave users on stale SPA
  if (ext === '.html' || safeRel === 'index.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  } else if (safeRel.startsWith('assets/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  }
  return c.body(content, 200, headers);
}

// ─── App ───

const app = new Hono();

// ─── Global IP-based rate limiter (brute-force / abuse protection) ───
const globalReqTimestamps = new Map<string, number[]>();
setInterval(() => globalReqTimestamps.clear(), 60_000).unref();

app.use('/*', async (c, next) => {
  // Skip rate limiting for static assets and health check
  const path = c.req.path;
  if (path === '/health' || path.startsWith('/assets/') || path === '/favicon.ico' || path === '/favicon.svg') {
    await next();
    return;
  }
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const cutoff = now - 60_000;
  let hits = globalReqTimestamps.get(ip) ?? [];
  hits = hits.filter(t => t > cutoff);
  // 120 requests per minute per IP — generous but prevents runaway abuse
  if (hits.length >= 120) {
    return c.json({ error: 'Rate limit exceeded. Slow down.' }, 429);
  }
  hits.push(now);
  globalReqTimestamps.set(ip, hits);
  await next();
});

// CORS scoped to the API surface. The dashboard is served same-origin, so we
// never use a wildcard. Better Auth sets its own CORS on /api/auth/* — applying
// a global cors() there would emit duplicate ACAO headers and break the browser.
const corsOrigins = parseCorsOrigins(getConfig().corsOrigin);
app.use('/v1/*', cors({ origin: corsOrigins, credentials: corsOrigins !== '*' }));

// ─── Security headers (CSP, HSTS, anti-sniff, etc.) ───
app.use('/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('X-XSS-Protection', '0');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
  c.header('Cross-Origin-Opener-Policy', 'same-origin');
  c.header('Cross-Origin-Resource-Policy', 'same-origin');
  c.header('X-DNS-Prefetch-Control', 'off');
  // Remove fingerprinting headers if any upstream set them
  c.header('X-Powered-By', '');

  // HSTS — enabled globally. Safe because:
  // - Local dev (localhost) is HTTP-only; HSTS only matters over HTTPS.
  // - Render/Cloudflare serve all traffic over HTTPS.
  // - Browsers only respect HSTS when received over a trusted HTTPS connection.
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content-Security-Policy
  // The SPA is same-origin. Fonts load from Google Fonts CDN.
  // Tailwind/motion use inline styles, so 'unsafe-inline' for style-src is required.
  // form-action allows Polar hosted checkout redirects from same-origin /buy.
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://polar.sh https://*.polar.sh https://checkout.polar.sh",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
  c.header('Content-Security-Policy', csp);
});

// ─── Health ───

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'agent-api-gateway',
    version: '0.1.0',
    // Public capability flags (no secrets)
    github_oauth: Boolean(process.env['GITHUB_CLIENT_ID'] && process.env['GITHUB_CLIENT_SECRET']),
    email_transport: Boolean(process.env['RESEND_API_KEY']),
    email_verification: true,
  }),
);

// ─── DB health (gated — never public without ADMIN_HEALTH_TOKEN) ───
app.get('/api/dbcheck', async (c) => {
  const adminToken = process.env['ADMIN_HEALTH_TOKEN'];
  // Always require a shared secret. Without it, the endpoint does not exist.
  if (!adminToken) {
    return c.json({ error: 'Not found' }, 404);
  }
  const provided = c.req.header('x-admin-token') || '';
  // Constant-time-ish compare length then equality (good enough for admin probe token)
  if (provided.length !== adminToken.length || provided !== adminToken) {
    return c.json({ error: 'Not found' }, 404);
  }

  const { default: pg } = await import('pg');
  const connStr = process.env['DATABASE_URL'];
  try {
    const pool = new pg.Pool({
      connectionString: connStr,
      connectionTimeoutMillis: 8000,
      max: 1,
    });
    const r = await pool.query('SELECT 1 as ok');
    const ok = r.rows[0]?.ok === 1;
    await pool.end();
    return c.json({ connOk: ok, dbUrlSet: !!connStr });
  } catch {
    return c.json({ connOk: false, dbUrlSet: !!connStr, error: 'Database check failed' }, 500);
  }
});

// ─── Better Auth (user sessions + API keys) ───

// Better Auth handles its own routing internally.
// Mount both standard prefixes so API-key management routes work.
app.all('/api/auth/*', (c) => auth.handler(c.req.raw));
// API-key routes are handled by Better Auth's internal router through auth.handler().
app.all('/api-key/*', (c) => auth.handler(c.req.raw));

// ─── Serve frontend for non-API routes ───

app.get('/', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/docs', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/login', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/verify-email', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/reset-password', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/privacy', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/terms', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/dashboard', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/dashboard/*', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/favicon.ico', (c) => serveStatic(c, 'favicon.svg') || serveStatic(c, 'favicon.ico') || c.newResponse(null, 204));
app.get('/favicon.svg', (c) => serveStatic(c, 'favicon.svg') || c.newResponse(null, 204));
app.get('/assets/*', (c) => serveStatic(c, c.req.path) || c.json({ error: 'Not found' }, 404));

// ─── Public routes ───

app.route('/v1/schemas', schemasRoutes);

// ─── Public billing pricing + public checkout (no auth) ───
// Mounted only under /v1/billing/pricing so authenticated /v1/billing/* still works.
app.route('/v1/billing/pricing', billingPricing);

// Short /buy path → Polar hosted checkout ($1 Starter by default)
app.get('/buy', async (c) => {
  const url = new URL(c.req.url);
  const sku = url.searchParams.get('sku') || 'starter';
  url.pathname = '/v1/billing/pricing/buy';
  url.search = `sku=${encodeURIComponent(sku)}`;
  return app.fetch(new Request(url.toString(), { method: 'GET', headers: c.req.raw.headers }));
});

// ─── Authenticated routes ───

app.use('/v1/*', authMiddleware, rateLimitMiddleware);

app.route('/v1/extract', extractRoutes);
app.route('/v1/usage', usageRoutes);
app.route('/v1/billing', billingApp);

// ─── Polar webhook (no auth, but rate-limited) ───
// Simple IP-based rate limiter for webhook (60 req/min per IP — Polar sends at most a few per event)
const webhookTimestamps = new Map<string, number[]>();
app.use('/webhooks/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const cutoff = now - 60_000;
  let hits = webhookTimestamps.get(ip) ?? [];
  hits = hits.filter(t => t > cutoff);
  if (hits.length >= 60) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  hits.push(now);
  webhookTimestamps.set(ip, hits);
  await next();
});
app.route('/webhooks/polar', webhookApp);

// ─── SPA fallback: serve index.html for any unmatched browser route ───
// Must come after all API routes but before JSON 404, so deep-links like
// /docs/overview return the SPA shell. API routes still get proper 404 JSON.
app.get('/*', (c) =>
  serveStatic(c, 'index.html') || c.json({ error: `Not found: GET ${c.req.path}` }, 404),
);

// ─── 404 (non-GET methods) ───
app.notFound((c) =>
  c.json({ error: `Not found: ${c.req.method} ${c.req.path}` }, 404),
);

// ─── Error handler ───

app.onError((err, c) => {
  console.error('[unhandled]', err);
  const isProd = process.env['NODE_ENV'] === 'production';
  return c.json({ error: 'Internal server error', detail: isProd ? undefined : err.message }, 500);
});

// ─── Start ───

const cfg = getConfig();

export default app;

if (process.env['NODE_ENV'] !== 'test') {
  const serve = async () => {
    // Run DB migration before accepting requests
    await runMigration();

    // Better Auth initializes synchronously with Render Postgres (IPv4)

    const { serve: honoServe } = await import('@hono/node-server');
    honoServe(
      { fetch: app.fetch, port: cfg.port },
      (info) => {
        console.log(`[api] listening on http://localhost:${info.port}`);
      },
    );
  };
  serve().catch((err) => {
    console.error('[api] failed to start:', err);
    process.exit(1);
  });
}
