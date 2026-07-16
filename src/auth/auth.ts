import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';
import {
  isEmailTransportConfigured,
  sendPasswordResetEmailMessage,
  sendVerificationEmailMessage,
} from './email.js';

const connectionString = process.env.DATABASE_URL;

// Render PostgreSQL (internal network) — IPv4-reachable, no custom DNS needed.
const pool = connectionString
  ? new Pool({ connectionString, max: 5, connectionTimeoutMillis: 10000 })
  : new Pool();

const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
const githubOAuthEnabled = Boolean(githubClientId && githubClientSecret);

if (githubOAuthEnabled) {
  console.log('[auth] GitHub OAuth enabled');
} else {
  console.log('[auth] GitHub OAuth disabled (set GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET)');
}

if (isEmailTransportConfigured()) {
  console.log('[auth] Email transport: Resend');
} else {
  console.log('[auth] Email transport: dev console (set RESEND_API_KEY for production mail)');
}

export const auth = betterAuth({
  database: pool,
  appName: 'Agent API Gateway',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  // ─── Email verification (email/password accounts) ───
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1 hour
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmailMessage({
        email: user.email,
        name: user.name,
        url,
      });
      console.log(JSON.stringify({
        event: 'auth.verification_email_queued',
        userId: user.id,
        timestamp: new Date().toISOString(),
      }));
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    // Block sessions until the address is confirmed (email/password only).
    // GitHub OAuth users are verified via the provider.
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmailMessage({
        email: user.email,
        name: user.name,
        url,
      });
      console.log(JSON.stringify({
        event: 'auth.password_reset_requested',
        userId: user.id,
        timestamp: new Date().toISOString(),
      }));
    },
  },
  // GitHub OAuth (developers). Callback: {BETTER_AUTH_URL}/api/auth/callback/github
  socialProviders: githubOAuthEnabled
    ? {
        github: {
          clientId: githubClientId!,
          clientSecret: githubClientSecret!,
          // user:email is requested by Better Auth for GitHub by default
        },
      }
    : {},
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: githubOAuthEnabled ? ['github'] : [],
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
      '/api/auth/sign-in/social': { window: 60, max: 10 },
      '/api/auth/callback/github': { window: 60, max: 20 },
      '/api/auth/forget-password': { window: 300, max: 3 },
      '/api/auth/reset-password': { window: 300, max: 5 },
      '/api/auth/request-password-reset': { window: 300, max: 3 },
      '/api/auth/send-verification-email': { window: 300, max: 3 },
      '/api/auth/verify-email': { window: 60, max: 20 },
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
