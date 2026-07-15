import { createAuthClient } from 'better-auth/react';
import { apiKeyClient } from '@better-auth/api-key/client';

// Browser-side Better Auth client. The dashboard is served from the same
// origin as the API, so requests to /api/auth/* are same-origin (in dev the
// Vite proxy forwards /api and /v1 to the API on :3000).
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  plugins: [apiKeyClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
export const apiKey = authClient.apiKey;
