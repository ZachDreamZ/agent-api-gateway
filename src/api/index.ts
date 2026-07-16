import { readFileSync, existsSync } from 'node:fs';
import { runMigration } from './lib/migrate.js';
import { join, extname } from 'node:path';
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
  const full = join(DIST, filePath);
  if (!existsSync(full)) return null;
  const ext = extname(full);
  const content = readFileSync(full);
  return c.body(content, 200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
}

// ─── App ───

const app = new Hono();

// CORS scoped to the API surface. The dashboard is served same-origin, so we
// never use a wildcard. Better Auth sets its own CORS on /api/auth/* — applying
// a global cors() there would emit duplicate ACAO headers and break the browser.
const corsOrigins = parseCorsOrigins(getConfig().corsOrigin);
app.use('/v1/*', cors({ origin: corsOrigins, credentials: corsOrigins !== '*' }));

// ─── Security headers ───
app.use('/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('X-XSS-Protection', '0');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
});

// ─── Health ───

app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'agent-api-gateway', version: '0.1.0' }),
);

// ─── DB health (used for deployment verification) ───
app.get('/api/dbcheck', async (c) => {
  const { default: pg } = await import('pg');
  const connStr = process.env['DATABASE_URL'];
  try {
    const pool = new pg.Pool({
      connectionString: connStr,
      connectionTimeoutMillis: 8000,
      max: 1,
    });
    // Check connectivity
    const r = await pool.query('SELECT 1 as ok');
    const ok = r.rows[0]?.ok === 1;
    // Check Better Auth tables exist
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=ANY($1)`,
      [['user','session','account','verification','apikey','_migration_history']]
    );
    const found = tables.rows.map(row => row.table_name);
    await pool.end();
    return c.json({ connOk: ok, dbUrlSet: !!connStr, tables: found });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ connOk: false, dbUrlSet: !!connStr, error: msg }, 500);
  }
});

// ─── Better Auth (user sessions + API keys) ───

app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

// ─── Serve frontend for non-API routes ───

app.get('/', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/docs', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/dashboard', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/dashboard/*', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/favicon.ico', (c) => serveStatic(c, 'favicon.svg') || serveStatic(c, 'favicon.ico') || c.newResponse(null, 204));
app.get('/favicon.svg', (c) => serveStatic(c, 'favicon.svg') || c.newResponse(null, 204));
app.get('/assets/*', (c) => serveStatic(c, c.req.path) || c.json({ error: 'Not found' }, 404));

// ─── Public routes ───

app.route('/v1/schemas', schemasRoutes);

// ─── Public billing pricing data ───

app.route('/v1/billing/pricing', billingPricing);

// ─── Authenticated routes ───

app.use('/v1/*', authMiddleware, rateLimitMiddleware);

app.route('/v1/extract', extractRoutes);
app.route('/v1/usage', usageRoutes);
app.route('/v1/billing', billingApp);

// ─── Polar webhook (no auth) ───
app.route('/webhooks/polar', webhookApp);

// ─── 404 ───

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
