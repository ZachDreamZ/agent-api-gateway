import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';
import { Resolver } from 'node:dns/promises';

// ─── DNS resolution for Supabase IPv6-only hostname ───
// The host db.iekbgbncsxiwdgrqlpfh.supabase.co only has an AAAA (IPv6) record.
// Node.js built-in DNS on some networks (Render free tier, Windows VPN) cannot
// resolve it. We use Google DNS (8.8.8.8) and connect to the raw IP, keeping
// the original hostname for SSL SNI.

async function resolveHost(host: string): Promise<string> {
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);
  try {
    const v4 = await resolver.resolve4(host);
    if (v4.length > 0) return v4[0];
  } catch { /* fall through to IPv6 */ }
  try {
    const v6 = await resolver.resolve6(host);
    if (v6.length > 0) return v6[0];
  } catch { /* give up */ }
  return host;
}

async function createPool(connectionString: string): Promise<Pool> {
  const url = new URL(connectionString);
  const host = url.hostname;
  const port = parseInt(url.port || '5432', 10);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, '');

  const resolvedHost = await resolveHost(host);
  if (resolvedHost !== host) {
    console.log(`[auth] Resolved ${host} -> ${resolvedHost}`);
  }

  return new Pool({
    host: resolvedHost,
    port, user, password, database,
    ssl: { rejectUnauthorized: false, servername: host },
    max: 5,
    connectionTimeoutMillis: 10000,
  });
}

// ─── Auth instance (lazy init) ───

let _auth: ReturnType<typeof betterAuth> | null = null;
let _initPromise: Promise<void> | null = null;

async function ensureAuth(): Promise<void> {
  if (_auth) return;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const connectionString = process.env.DATABASE_URL;
    const pool = connectionString
      ? await createPool(connectionString)
      : new Pool();

    _auth = betterAuth({
      database: pool,
      appName: 'Agent API Gateway',
      baseURL: process.env.BETTER_AUTH_URL,
      secret: process.env.BETTER_AUTH_SECRET,
      emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
          console.log(`[auth] Password reset link for ${user.email}: ${url}`);
        },
      },
      user: {
        additionalFields: {
          tier: { type: 'string', defaultValue: 'free', required: false },
          stripe_customer_id: { type: 'string', required: false },
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
      },
      trustedOrigins: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://agent-api-gateway.onrender.com',
        'https://agentapigw.dpdns.org',
      ],
      plugins: [
        apiKey({ enableSessionForAPIKeys: true }),
        bearer(),
      ],
    });
    console.log('[auth] Better Auth initialized');
  })();

  return _initPromise;
}

// Background init — the middleware will await if it's not done yet
ensureAuth().catch((err) => {
  console.error('[auth] Initialization failed:', err);
});

// ─── Exports ───

// The middleware calls `auth.handler(c.req.raw)`. Since init is async, we export
// a proxy that awaits init before returning the real handler.
export const auth = {
  get handler() {
    // If _auth is null for the first synchronous access, throw a clear error
    // that tells callers to use async init. The API middleware in index.ts
    // should call ensureAuth() first.
    if (!_auth) throw new Error(
      'Better Auth not initialized yet. Call auth.init() before accessing handler.'
    );
    return _auth.handler;
  },
  get api() {
    if (!_auth) throw new Error('Better Auth not initialized yet.');
    return _auth.api;
  },
  get options() {
    if (!_auth) throw new Error('Better Auth not initialized yet.');
    return _auth.options;
  },
  get $Infer() {
    if (!_auth) throw new Error('Better Auth not initialized yet.');
    return _auth.$Infer;
  },
  // Async init — call this before using auth.handler
  init: ensureAuth,
};

export type Session = Exclude<Awaited<ReturnType<typeof auth.api.getSession>>, null>;
export type AuthUser = Session['user'];
