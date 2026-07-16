/**
 * Redact secrets and connection strings before logging or client-facing errors.
 */

export function redactSecrets(input: string): string {
  let out = String(input);

  out = out.replace(/\bBearer\s+[A-Za-z0-9._\-+=/]{8,}/gi, 'Bearer ***');
  out = out.replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, 'sk-***');
  out = out.replace(/\bre_[A-Za-z0-9]{10,}\b/g, 're_***');
  out = out.replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, 'AIza***');
  out = out.replace(/\bghp_[A-Za-z0-9]{20,}\b/g, 'ghp_***');
  out = out.replace(/\bgho_[A-Za-z0-9]{20,}\b/g, 'gho_***');
  out = out.replace(/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, 'xox-***');

  // scheme://user:pass@host
  out = out.replace(
    /\b((?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/)([^:@/\s]+):([^@/\s]+)@/gi,
    '$1$2:***@',
  );

  out = out.replace(
    /\b((?:PASSWORD|SECRET|TOKEN|API_KEY|DATABASE_URL|PRIVATE_KEY|BETTER_AUTH_SECRET|POLAR_ACCESS_TOKEN|POLAR_WEBHOOK_SECRET|RESEND_API_KEY|GITHUB_CLIENT_SECRET)\s*[=:]\s*)([^\s"',}]+)/gi,
    '$1***',
  );

  return out;
}

export function safeErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err instanceof Error) {
    return redactSecrets(err.message) || fallback;
  }
  return redactSecrets(String(err)) || fallback;
}
