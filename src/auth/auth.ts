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
    customRules: {
      '/api/auth/sign-in/email': { window: 60, max: 5 },
      '/api/auth/sign-up/email': { window: 60, max: 3 },
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
    useSecureCookies: true,
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for'],
      disableIpTracking: false,
    },
  },

  plugins: [
    apiKey({
      defaultPrefix: 'sk-',
    }),
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
