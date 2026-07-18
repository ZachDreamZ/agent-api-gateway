// ─── Threat monitoring / security alerting (OpenVPN checklist: threat monitoring) ───
// Opt-in: set ALERT_WEBHOOK_URL (Slack/Discord incoming-webhook compatible) to
// receive security alerts. When unset, alerts are logged only (no external call).
// Safe to call from any request path; never throws into the request flow.

const ALERT_WEBHOOK_URL = process.env['ALERT_WEBHOOK_URL']?.trim() || '';

// In-memory burst counters for cheap anomaly detection (per process).
const authFailures = new Map<string, number[]>();
const RESET_MS = 10 * 60_000; // 10 min window
const BURST_THRESHOLD = 10; // >=10 failed auth events per window → alert

function recordAndCheckBurst(key: string): boolean {
  const now = Date.now();
  const arr = (authFailures.get(key) ?? []).filter((t) => now - t < RESET_MS);
  arr.push(now);
  authFailures.set(key, arr);
  return arr.length >= BURST_THRESHOLD;
}

async function send(section: string, detail: Record<string, unknown>): Promise<void> {
  const payload = {
    text:
      `:rotating_light: [${section}] ${JSON.stringify(detail).slice(0, 800)}` +
      ` @ ${new Date().toISOString()}`,
  };
  console.warn(`[alert:${section}] ${JSON.stringify(detail)}`);
  if (!ALERT_WEBHOOK_URL) return;
  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[alert] webhook dispatch failed:', e instanceof Error ? e.message : e);
  }
}

/** Call on a failed login / 2FA / password attempt. */
export function alertAuthFailure(opts: {
  email?: string;
  userId?: string;
  reason: string;
  ip?: string | null;
}): void {
  const key = `auth:${opts.email ?? opts.userId ?? 'unknown'}`;
  const detail = { reason: opts.reason, email: opts.email, userId: opts.userId, ip: opts.ip };
  void send('auth_failure', detail);
  if (recordAndCheckBurst(key)) {
    void send('auth_failure_burst', { ...detail, window: '10m', threshold: BURST_THRESHOLD });
  }
}

/** Call when an API key is used from an unusual volume (reuse usage_logs signal). */
export function alertSuspiciousUsage(opts: {
  userId: string;
  endpoint: string;
  creditsUsed: number;
  ip?: string | null;
}): void {
  void send('suspicious_usage', opts);
}

/** Generic security event. */
export function alertSecurityEvent(section: string, detail: Record<string, unknown>): void {
  void send(section, detail);
}
