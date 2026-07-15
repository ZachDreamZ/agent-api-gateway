import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { apiKey } from '@better-auth/api-key';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Better Auth manages its own Postgres schema (user, session, account,
// verification, apikey). We point it at the same Supabase Postgres database
// the rest of the app uses.
const pool = connectionString ? new Pool({ connectionString }) : new Pool();

export const auth = betterAuth({
  database: pool,
  appName: 'Agent API Gateway',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    // No email provider wired yet — log the reset link until one is added.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] Password reset link for ${user.email}: ${url}`);
    },
  },
  // Billing state lives on the Better Auth user row.
  user: {
    additionalFields: {
      tier: {
        type: 'string',
        defaultValue: 'free',
        required: false,
      },
      stripe_customer_id: {
        type: 'string',
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh after 1 day
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://agent-api-gateway.onrender.com',
    'https://agentapigw.dpdns.org',
  ],
  plugins: [
    // API keys replace the old custom sk- keys. enableSessionForAPIKeys lets
    // `Authorization: Bearer <key>` populate a session for protected routes.
    apiKey({
      enableSessionForAPIKeys: true,
    }),
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
