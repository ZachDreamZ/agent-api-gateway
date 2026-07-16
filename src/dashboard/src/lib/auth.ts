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

/** GitHub OAuth: redirects to GitHub then back to callbackURL */
export async function signInWithGitHub(callbackURL = '/dashboard') {
  return signIn.social({
    provider: 'github',
    callbackURL,
  });
}

/** Resend the verification email (email/password accounts only) */
export async function resendVerificationEmail(email: string, callbackURL = '/dashboard') {
  return authClient.sendVerificationEmail({
    email,
    callbackURL,
  });
}

/** Request a password reset link */
export async function requestPasswordReset(email: string, redirectTo = '/reset-password') {
  return authClient.requestPasswordReset({
    email,
    redirectTo,
  });
}

/** Complete password reset with token from email link */
export async function resetPassword(newPassword: string, token: string) {
  return authClient.resetPassword({
    newPassword,
    token,
  });
}
