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
  const { Resolver } = await import('node:dns/promises');
  const url = new URL(process.env['DATABASE_URL'] || '');
  const host = url.hostname;
  const port = parseInt(url.port || '5432', 10);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, '');

  // DNS test
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8']);
  let dnsV4 = false, dnsV6 = false, resolved = '';
  try {
    const v4 = await resolver.resolve4(host);
    if (v4.length > 0) { dnsV4 = true; resolved = v4[0]; }
  } catch { /* IPv4 not available */ }
  try {
    const v6 = await resolver.resolve6(host);
    if (v6.length > 0) { dnsV6 = true; if (!resolved) resolved = v6[0]; }
  } catch { /* IPv6 not available */ }

  // Connection test — try different strategies
  let connOk = false, connError = '';
  
  // Strategy 1: native DNS (let pg resolve)
  let nativePool = null;
  try {
    nativePool = new pg.Pool({
      connectionString: process.env['DATABASE_URL'],
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
      max: 1,
    });
    const r = await nativePool.query('SELECT 1 as ok');
    connOk = true;
    await nativePool.end();
    const tables = await nativePool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema=$1 AND table_name=ANY($2)',
      ['public', ['user','session','account','_migration_history','usage_logs']]
    );
    const found = tables.rows.map(r => r.table_name);
    return c.json({ host, strategy: 'native', dnsV4, dnsV6, resolved, connOk, tables: found });
  } catch (e) {
    connError = e.message;
    if (nativePool) await nativePool.end().catch(() => {});
  }
  
  // Strategy 2: resolved IPv6 via pooler or direct resolution
  // Use resolved IP directly (the existing strategy)
  try {
    const pool = new pg.Pool({
      host: resolved || host,
      port, user, password, database,
      ssl: { rejectUnauthorized: false, servername: host },
      connectionTimeoutMillis: 8000,
      max: 1,
    });
    const r = await pool.query('SELECT 1 as ok');
    connOk = true;
    await pool.end();
    return c.json({ host, strategy: 'resolved', dnsV4, dnsV6, resolved, connOk, connError: undefined });
  } catch (e) {
    connError = connError + ' | resolved: ' + e.message;
    await pool.end().catch(() => {});
  }

  return c.json({ host, strategy: 'both_failed', dnsV4, dnsV6, resolved, connOk, connError, dbUrlSet: !!process.env['DATABASE_URL'] });
  try {
    const r = await pool.query('SELECT 1 as ok');
    connOk = true;
    // Check tables
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('user','session','account','_migration_history','usage_logs')`
    );
    const found = tables.rows.map(r => r.table_name);
    await pool.end();
    return c.json({ host, resolved, dnsV4, dnsV6, connOk, tables: found });
  } catch (e) {
    connError = e.message;
    await pool.end().catch(() => {});
    return c.json({ host, resolved, dnsV4, dnsV6, connOk, connError, dbUrlSet: !!process.env['DATABASE_URL'] });
  }
});

// ─── Better Auth (user sessions + API keys) ───

app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

// ─── Serve frontend for non-API routes ───

app.get('/', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/docs', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/dashboard', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
app.get('/dashboard/*', (c) => serveStatic(c, 'index.html') || c.json({ error: 'Frontend not built' }, 503));
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
