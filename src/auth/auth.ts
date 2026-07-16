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
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://agent-api-gateway.onrender.com',
    'https://agentapigw.dpdns.org',
  ],
  plugins: [
    apiKey({
      enableSessionForAPIKeys: true,
      // Allow clients to send API key as Authorization: Bearer <key>
      apiKeyHeaders: ['authorization'],
      customAPIKeyGetter: (ctx) => {
        const auth = ctx.headers?.get('authorization');
        if (!auth) return null;
        return auth.startsWith('Bearer ') ? auth.slice(7) : null;
      },
    }),
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
