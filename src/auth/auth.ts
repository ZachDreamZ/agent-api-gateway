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
        after: async ({ data, ctx }) => {
          console.log(JSON.stringify({
            event: 'session.created',
            userId: data.userId,
            ip: ctx?.request?.headers.get('x-forwarded-for') ?? null,
            userAgent: ctx?.request?.headers.get('user-agent') ?? null,
            timestamp: new Date().toISOString(),
          }));
        },
      },
      delete: {
        before: async ({ data }) => {
          console.log(JSON.stringify({
            event: 'session.revoked',
            sessionId: data.id,
            userId: data.userId,
            timestamp: new Date().toISOString(),
          }));
        },
      },
    },
    user: {
      update: {
        after: async ({ data, oldData }) => {
          if (oldData?.email !== data.email) {
            console.log(JSON.stringify({
              event: 'user.email_changed',
              userId: data.id,
              oldEmail: oldData?.email,
              newEmail: data.email,
              timestamp: new Date().toISOString(),
            }));
          }
        },
      },
    },
    account: {
      create: {
        after: async ({ data }) => {
          console.log(JSON.stringify({
            event: 'account.linked',
            userId: data.userId,
            provider: data.providerId,
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
