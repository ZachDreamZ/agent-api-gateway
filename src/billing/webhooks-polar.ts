import { Hono } from 'hono';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { getPool } from '../api/lib/db.js';
import { addBonusCredits, findUserIdByEmail } from '../api/lib/usage-db.js';
import type { Tier } from '@shared/types';

// Webhook verification secret from the Polar dashboard (Webhooks → endpoint secret).
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET || '';

const webhookApp = new Hono();

// Persist the purchased tier (and billing customer id) on the user row.
async function grantTier(userId: string, tier: Tier, polarCustomerId: string | null): Promise<void> {
  const pool = getPool();
  const setClauses: string[] = ['tier = $1'];
  const values: unknown[] = [tier];
  if (polarCustomerId) {
    setClauses.push('stripe_customer_id = $2');
    values.push(polarCustomerId);
    values.push(userId);
  } else {
    values.push(userId);
  }
  const idx = values.length;
  const result = await pool.query(
    `UPDATE "user" SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
  if (result.rowCount === 0) {
    console.warn(`[Polar] User ${userId} not found for grantTier`);
    return;
  }
  console.log(`[Polar] Granted tier=${tier} to user=${userId}`);
}

async function revokeTier(userId: string): Promise<void> {
  const pool = getPool();
  const result = await pool.query('UPDATE "user" SET tier = $1 WHERE id = $2', ['free', userId]);
  if (result.rowCount === 0) {
    console.warn(`[Polar] User ${userId} not found for revokeTier`);
    return;
  }
  console.log(`[Polar] Revoked tier to free for user=${userId}`);
}

async function resolveUserId(data: Record<string, any>): Promise<string | null> {
  const fromMeta = data?.metadata?.user_id as string | undefined;
  if (fromMeta) return fromMeta;
  const email =
    (data?.customerEmail as string | undefined) ||
    (data?.customer?.email as string | undefined) ||
    (data?.email as string | undefined);
  if (email) return findUserIdByEmail(email);
  return null;
}

function parseCreditAmount(data: Record<string, any>): number {
  const raw =
    data?.metadata?.credits ??
    data?.metadata?.credit_amount ??
    null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function isCreditSku(data: Record<string, any>): boolean {
  const sku = String(data?.metadata?.sku || '').toLowerCase();
  const kind = String(data?.metadata?.kind || '').toLowerCase();
  if (kind === 'credit_pack') return true;
  return (
    sku === 'credits' ||
    sku === 'starter' ||
    sku === 'starter_pack' ||
    sku === 'credits_1k' ||
    sku === 'credits_5k' ||
    sku === 'credits_25k' ||
    sku.startsWith('credits_')
  );
}

async function maybeGrantCredits(data: Record<string, any>, status: string | undefined): Promise<boolean> {
  if (!(status === 'paid' || status === 'confirmed' || status === 'succeeded')) return false;
  if (!isCreditSku(data) && !data?.metadata?.credits) return false;

  let credits = parseCreditAmount(data);
  if (!credits) {
    // Legacy starter_pack without explicit credits field
    const sku = String(data?.metadata?.sku || '').toLowerCase();
    if (sku === 'starter_pack' || sku === 'credits_1k' || sku === 'starter') credits = 1000;
  }
  if (!credits) return false;

  const userId = await resolveUserId(data);
  if (!userId) {
    console.warn('[Polar] Credit pack paid but no matching user (metadata.user_id or email)');
    return true; // handled (nothing to grant yet)
  }

  const total = await addBonusCredits(userId, credits);
  console.log(`[Polar] Granted ${credits} bonus credits to user=${userId} (bonus_total=${total})`);
  return true;
}

webhookApp.post('/', async (c) => {
  if (!webhookSecret) {
    return c.json({ error: 'Polar webhook secret not configured' }, 500);
  }

  const body = await c.req.text();
  const headers = {
    'webhook-id': c.req.header('webhook-id') || '',
    'webhook-timestamp': c.req.header('webhook-timestamp') || '',
    'webhook-signature': c.req.header('webhook-signature') || '',
  };

  let event: { type: string; data: Record<string, any> };
  try {
    event = validateEvent(body, headers, webhookSecret) as any;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('[Polar] Webhook verification failed:', message);
    const isProd = process.env.NODE_ENV === 'production';
    return c.json({ error: isProd ? 'Webhook signature verification failed' : message }, 400);
  }

  try {
    const type = event.type;
    const data = event.data as Record<string, any>;
    const userId = (data?.metadata?.user_id as string | undefined) ?? null;
    const tier = data?.metadata?.tier as Tier | undefined;
    const customerId = (data?.customerId as string | undefined) ?? null;
    const status = data?.status as string | undefined;

    if (type.startsWith('subscription.')) {
      if (type === 'subscription.canceled' || type === 'subscription.revoked') {
        if (userId) await revokeTier(userId);
      } else if (userId && tier && (status === 'active' || status === 'trialing')) {
        await grantTier(userId, tier, customerId);
      }
    } else if (
      type === 'checkout.updated' ||
      type === 'checkout.created' ||
      type === 'order.created' ||
      type === 'order.paid'
    ) {
      // Credit packs first (do not force tier upgrades for top-ups)
      const credited = await maybeGrantCredits(data, status);
      if (!credited && userId && tier && (status === 'paid' || status === 'confirmed' || status === 'succeeded')) {
        // Subscription-style one-time that maps to a plan
        if (['hobby', 'pro', 'scale'].includes(tier)) {
          await grantTier(userId, tier, customerId);
        }
      }
    } else {
      console.log(`[Polar] Unhandled event: ${type}`);
    }

    return c.json({ received: true });
  } catch (err) {
    console.error('[Polar] Webhook handler error:', err);
    return c.json({ error: 'Webhook handler failed' }, 500);
  }
});

export { webhookApp };
