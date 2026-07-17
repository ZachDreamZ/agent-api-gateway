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

function absoluteAppUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = window.location.origin;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** GitHub OAuth: redirects to GitHub then back to callbackURL */
export async function signInWithGitHub(callbackURL = '/dashboard') {
  return signIn.social({
    provider: 'github',
    callbackURL: absoluteAppUrl(callbackURL),
    errorCallbackURL: absoluteAppUrl('/login'),
  });
}

/** Google OAuth: redirects to Google then back to callbackURL */
export async function signInWithGoogle(callbackURL = '/dashboard') {
  return signIn.social({
    provider: 'google',
    callbackURL: absoluteAppUrl(callbackURL),
    errorCallbackURL: absoluteAppUrl('/login'),
  });
}

/** Human-readable messages for Better Auth OAuth error codes */
export function oauthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  const key = code.toLowerCase().replace(/\s+/g, '_');
  const map: Record<string, string> = {
    account_not_linked:
      'An account with this email already exists. Sign in with email/password first, or use the same provider you signed up with. If you never verified email, check your inbox — then try social sign-in again.',
    unable_to_link_account:
      'Could not link this social account. Sign in with your existing method, then link from settings.',
    email_doesn_t_match:
      'That social account uses a different email than your signed-in user.',
    account_already_linked_to_different_user:
      'This social account is already linked to a different user.',
    email_not_found:
      'The provider did not return an email. Make your email public on GitHub, or use Google/email sign-in.',
    signup_disabled: 'New sign-ups with this provider are disabled.',
    oauth_provider_not_found: 'This sign-in method is not configured yet.',
    access_denied: 'You cancelled the sign-in request.',
    // OAuth CSRF/state cookie or DB verification row missing (deploy mid-flow, expired, or host mismatch)
    state_mismatch:
      'Sign-in timed out or the browser lost the login session mid-redirect. Click GitHub or Google again to retry.',
    state_not_found:
      'Sign-in timed out or the browser lost the login session mid-redirect. Click GitHub or Google again to retry.',
    please_restart_the_process:
      'Please restart sign-in from this site (do not refresh the provider page). Click GitHub or Google again.',
    unable_to_get_user_info:
      'The provider signed you in but did not return a profile. Try again or use email.',
    invalid_callback_request:
      'OAuth callback was incomplete. Start sign-in again from the login page.',
  };
  return map[key] || `Sign-in failed (${code}). Try again or use email.`;
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
