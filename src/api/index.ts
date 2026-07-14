import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getConfig } from './lib/config.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { extractRoutes } from './routes/extract.js';
import { schemasRoutes } from './routes/schemas.js';
import { usageRoutes } from './routes/usage.js';
import { billingApp, billingPricing } from './routes/billing.js';
import { webhookApp } from '../billing/webhooks-polar.js';
import { apiKeysApp } from './routes/api-keys.js';

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

app.use('/*', cors({ origin: getConfig().corsOrigin }));

// ─── Health ───

app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'agent-api-gateway', version: '0.1.0' }),
);

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
app.route('/v1/api-keys', apiKeysApp);
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
  return c.json({ error: 'Internal server error' }, 500);
});

// ─── Start ───

const cfg = getConfig();

export default app;

if (process.env['NODE_ENV'] !== 'test') {
  const serve = async () => {
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
