/**
 * Transactional email helper for auth flows (verify, reset).
 * Prefer Resend when RESEND_API_KEY is set; otherwise log in non-production.
 */

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const FROM =
  process.env.EMAIL_FROM?.trim() ||
  process.env.SUPPORT_EMAIL?.trim() ||
  'Agent API <onboarding@resend.dev>';

export function isEmailTransportConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(msg: OutboundEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html ?? plainToHtml(msg.text),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(JSON.stringify({
        event: 'email.send_failed',
        provider: 'resend',
        status: res.status,
        // never log recipient body content with tokens in full
        detail: body.slice(0, 200),
        timestamp: new Date().toISOString(),
      }));
      // Do NOT throw: a failed transactional email must not break sign-up /
      // password-reset. The app already does not enforce email verification,
      // so a non-delivered message should degrade gracefully (logged above).
      return;
    }
    console.log(JSON.stringify({
      event: 'email.sent',
      provider: 'resend',
      toDomain: msg.to.split('@')[1] ?? 'unknown',
      subject: msg.subject,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Dev / missing transport: surface the link so local testing still works.
  // Production without RESEND_API_KEY should not silently "succeed".
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    console.error(JSON.stringify({
      event: 'email.transport_missing',
      message: 'Set RESEND_API_KEY to send verification and reset emails',
      timestamp: new Date().toISOString(),
    }));
    throw new Error('Email transport is not configured');
  }

  console.log('[email:dev]', {
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
  });
}

function plainToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Auto-link URLs for verify/reset buttons
  const withLinks = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color:#5eead4;word-break:break-all">$1</a>',
  );
  return `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;background:#0a0e18;color:#e8eef8;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#121722;border:1px solid #2a3344;border-radius:8px;padding:24px">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5eead4">NexusCore · Agent API</p>
    <div style="font-size:14px;line-height:1.6;color:#c5cdd9;white-space:pre-wrap">${withLinks}</div>
  </div>
</body></html>`;
}

export async function sendVerificationEmailMessage(opts: {
  email: string;
  name?: string | null;
  url: string;
}): Promise<void> {
  const name = opts.name?.trim() || 'there';
  const text = [
    `Hi ${name},`,
    '',
    'Confirm your email for Agent API Gateway.',
    '',
    'Open this link (expires soon):',
    opts.url,
    '',
    'If you did not create an account, ignore this message.',
    '',
    '— Agent API',
  ].join('\n');

  await sendEmail({
    to: opts.email,
    subject: 'Verify your Agent API email',
    text,
  });
}

export async function sendPasswordResetEmailMessage(opts: {
  email: string;
  name?: string | null;
  url: string;
}): Promise<void> {
  const name = opts.name?.trim() || 'there';
  const text = [
    `Hi ${name},`,
    '',
    'Reset your Agent API password with this link:',
    opts.url,
    '',
    'If you did not request a reset, ignore this message.',
    '',
    '— Agent API',
  ].join('\n');

  await sendEmail({
    to: opts.email,
    subject: 'Reset your Agent API password',
    text,
  });
}
