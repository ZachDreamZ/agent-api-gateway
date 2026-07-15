import { Hono } from 'hono';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { getSupabase } from '../api/lib/supabase.js';
import type { Tier } from '@shared/types';

// Webhook verification secret from the Polar dashboard (Webhooks → endpoint secret).
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET || '';

const webhookApp = new Hono();

// Persist the purchased tier (and billing customer id) on the user row.
async function grantTier(userId: string, tier: Tier, polarCustomerId: string | null): Promise<void> {
  const supabase = getSupabase();
  const update: Record<string, unknown> = { tier };
  if (polarCustomerId) update.stripe_customer_id = polarCustomerId;
  const { error } = await supabase.from('user').update(update).eq('id', userId);
  if (error) {
    console.error('[Polar] Failed to grant tier:', error.message);
    throw new Error(error.message);
  }
  console.log(`[Polar] Granted tier=${tier} to user=${userId}`);
}

async function revokeTier(userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('user').update({ tier: 'free' }).eq('id', userId);
  if (error) {
    console.error('[Polar] Failed to revoke tier:', error.message);
    throw new Error(error.message);
  }
  console.log(`[Polar] Revoked tier to free for user=${userId}`);
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
    return c.json({ error: message }, 400);
  }

  try {
    const type = event.type;
    const data = event.data as Record<string, any>;
    const userId = data?.metadata?.user_id as string | undefined;
    const tier = data?.metadata?.tier as Tier | undefined;
    const customerId = (data?.customerId as string | undefined) ?? null;
    const status = data?.status as string | undefined;

    if (type.startsWith('subscription.')) {
      if (type === 'subscription.canceled' || type === 'subscription.revoked') {
        if (userId) await revokeTier(userId);
      } else if (userId && tier && (status === 'active' || status === 'trialing')) {
        await grantTier(userId, tier, customerId);
      }
    } else if (type === 'checkout.updated' || type === 'checkout.created') {
      if (userId && tier && (status === 'paid' || status === 'confirmed')) {
        await grantTier(userId, tier, customerId);
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
