import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Render PostgreSQL (internal network) — IPv4-reachable, no custom DNS needed.
const pool = connectionString
  ? new Pool({ connectionString, max: 5, connectionTimeoutMillis: 10000 })
  : new Pool();

export const auth = betterAuth({
  database: pool,
  appName: 'Agent API Gateway',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      // Never log reset URLs or full emails in production (token leak risk).
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[auth] Password reset link for ${user.email}: ${url}`);
      } else {
        console.log(JSON.stringify({
          event: 'auth.password_reset_requested',
          userId: user.id,
          timestamp: new Date().toISOString(),
        }));
      }
      // TODO: send via transactional email (SUPPORT_EMAIL / Resend) when configured.
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
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: 'jwe',
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://agent-api-gateway.onrender.com',
    'https://agentapigw.dpdns.org',
  ],

  // ─── Rate limiting (database-backed) ───
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 30,
    customRules: {
      '/api/auth/sign-in/email': { window: 60, max: 5 },
      '/api/auth/sign-up/email': { window: 60, max: 3 },
      '/api/auth/forget-password': { window: 300, max: 3 },
      '/api/auth/reset-password': { window: 300, max: 5 },
      '/api/auth/request-password-reset': { window: 300, max: 3 },
    },
  },

  // ─── Audit logging ───
  databaseHooks: {
    session: {
      create: {
        after: async (session, context) => {
          console.log(JSON.stringify({
            event: 'session.created',
            userId: session.userId,
            ip: context?.request?.headers?.get('x-forwarded-for') ?? null,
            userAgent: context?.request?.headers?.get('user-agent') ?? null,
            timestamp: new Date().toISOString(),
          }));
        },
      },
      delete: {
        before: async (session) => {
          console.log(JSON.stringify({
            event: 'session.revoked',
            sessionId: session.id,
            userId: session.userId,
            timestamp: new Date().toISOString(),
          }));
        },
      },
    },
    user: {
      update: {
        after: async (user) => {
          console.log(JSON.stringify({
            event: 'user.updated',
            userId: user.id,
            email: user.email,
            hasTier: !!user.tier,
            timestamp: new Date().toISOString(),
          }));
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          console.log(JSON.stringify({
            event: 'account.linked',
            userId: account.userId,
            provider: account.providerId,
            timestamp: new Date().toISOString(),
          }));
        },
      },
    },
  },

  // ─── Advanced security ───
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production' || process.env.BETTER_AUTH_URL?.startsWith('https://'),
    defaultCookieAttributes: {
      sameSite: 'lax', // lax allows Polar checkout return navigation to keep session
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.BETTER_AUTH_URL?.startsWith('https://'),
      path: '/',
    },
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'cf-connecting-ip', 'x-real-ip'],
      disableIpTracking: false,
    },
  },

  plugins: [
    apiKey({
      defaultPrefix: 'sk-',
      // Default expiry: 365 days
      keyExpiration: {
        defaultExpiresIn: 365 * 24 * 60 * 60 * 1000,
        disableCustomExpiresTime: false,
        minExpiresIn: 1,
        maxExpiresIn: 365,
      },
      // Per-key rate limiting (separate from endpoint rate limits)
      rateLimit: {
        enabled: true,
        timeWindow: 60_000, // 1 minute window
        maxRequests: 60, // 60 requests per minute per key
      },
    }),
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
