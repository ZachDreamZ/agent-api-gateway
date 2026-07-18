import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { bearer } from 'better-auth/plugins';
import { twoFactor } from 'better-auth/plugins';
import { getPool } from '../api/lib/db.js';
import {
  isEmailTransportConfigured,
  sendPasswordResetEmailMessage,
  sendVerificationEmailMessage,
} from './email.js';

// Shared PostgreSQL pool (consistent SSL + statement timeout policy).
const pool = getPool();

const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
const githubOAuthEnabled = Boolean(githubClientId && githubClientSecret);

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleOAuthEnabled = Boolean(googleClientId && googleClientSecret);

const trustedOAuthProviders = [
  ...(githubOAuthEnabled ? (['github'] as const) : []),
  ...(googleOAuthEnabled ? (['google'] as const) : []),
];

if (githubOAuthEnabled) {
  console.log('[auth] GitHub OAuth enabled');
} else {
  console.log('[auth] GitHub OAuth disabled (set GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET)');
}

if (googleOAuthEnabled) {
  console.log('[auth] Google OAuth enabled');
} else {
  console.log('[auth] Google OAuth disabled (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)');
}

if (isEmailTransportConfigured()) {
  console.log('[auth] Email transport: Resend');
} else {
  console.log('[auth] Email transport: dev console (set RESEND_API_KEY for production mail)');
}

if (!process.env.BETTER_AUTH_SECRET?.trim()) {
  console.warn('[auth] BETTER_AUTH_SECRET is missing — sessions will not be stable across restarts');
}

/** Canonical public origin (custom domain preferred). */
const PRIMARY_ORIGIN = (
  process.env.BETTER_AUTH_URL
  || process.env.APP_DOMAIN
  || 'https://agentapigw.dpdns.org'
).replace(/\/$/, '');

// Hosts we serve auth from (custom domain + Render hostname).
// Dynamic baseURL keeps OAuth callbacks/state consistent when either host is used.
const AUTH_ALLOWED_HOSTS = [
  'agentapigw.dpdns.org',
  'agent-api-gateway.onrender.com',
  'localhost:3000',
  'localhost:5173',
  '127.0.0.1:3000',
  '127.0.0.1:5173',
];

// Build socialProviders only for configured providers
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (githubOAuthEnabled) {
  socialProviders.github = {
    clientId: githubClientId!,
    clientSecret: githubClientSecret!,
  };
}
if (googleOAuthEnabled) {
  socialProviders.google = {
    clientId: googleClientId!,
    clientSecret: googleClientSecret!,
  };
}

export const auth = betterAuth({
  database: pool,
  appName: 'Agent API Gateway · NexusCore',
  // Prefer request host when allowlisted so OAuth state is written for the
  // same origin the browser returns to (avoids state_mismatch across hosts).
  baseURL: {
    allowedHosts: AUTH_ALLOWED_HOSTS,
    fallback: PRIMARY_ORIGIN,
    protocol: 'https',
  },
  secret: process.env.BETTER_AUTH_SECRET,
  // Cloudflare + Render terminate TLS and set X-Forwarded-* / CF-Connecting-IP
  trustedProxyHeaders: true,

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
    // Enforce email verification at sign-in. The Resend sender domain
    // `agentapigw.dpdns.org` is now verified, so verification emails deliver
    // to arbitrary recipients. GitHub OAuth users are verified automatically.
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
  // Social OAuth. Callbacks: {origin}/api/auth/callback/{github|google}
  socialProviders,
  account: {
    // Persist OAuth state in Postgres (verification table) so deploys/restarts
    // mid-login and multi-instance don't drop the cookie-only state.
    storeStateStrategy: 'database',
    accountLinking: {
      enabled: true,
      // Trusted providers auto-link when the OAuth email matches an existing user.
      trustedProviders: [...trustedOAuthProviders],
      // Default true blocks OAuth if the email/password user never verified —
      // common when Resend was off. OAuth (GitHub/Google) proves the inbox, so
      // allow linking; a verified OAuth email then marks the user verified.
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: true,
    },
  },
  // Send users back to the login page with a readable error (route is /login, not /auth).
  onAPIError: {
    errorURL: `${PRIMARY_ORIGIN}/login`,
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
      '/api/auth/callback/google': { window: 60, max: 20 },
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
    // Secure cookies in production / HTTPS; allow non-secure on local HTTP.
    useSecureCookies:
      process.env.NODE_ENV === 'production'
      || PRIMARY_ORIGIN.startsWith('https://'),
    defaultCookieAttributes: {
      // Lax is correct for top-level OAuth GET callbacks (GitHub/Google redirect).
      // Do not use SameSite=None unless frontend and API are on different sites.
      sameSite: 'lax',
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production'
        || PRIMARY_ORIGIN.startsWith('https://'),
      path: '/',
    },
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'],
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
    // Opt-in TOTP 2FA (OpenVPN checklist: MFA). Not enforced at sign-in;
    // users enable it voluntarily from the dashboard.
    twoFactor({
      issuer: 'Agent API Gateway',
      // Verify the TOTP on enable (default). Account lockout on repeated
      // failed 2FA attempts is enabled by default (10 tries / 15 min).
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
