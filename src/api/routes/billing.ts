import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createCheckoutSession, createCustomerPortalSession, createCustomer } from '../../billing/polar';
import { TIER_ORDER, getPricingByTier, formatPrice } from '../../billing/pricing';
import { getSupabase } from '../lib/supabase.js';
import type { Tier } from '@shared/types';

const billingApp = new Hono();

// Separate public pricing router (no auth middleware)
const billingPricing = new Hono();

billingPricing.get('/', (c) => {
  const tiers = TIER_ORDER.map((tier) => {
    const p = getPricingByTier(tier);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: formatPrice(p.price_monthly),
      price_monthly: p.price_monthly,
      queries_per_month: p.queries_per_month,
      rate_limit_rpm: p.rate_limit_rpm,
      concurrent_requests: p.concurrent_requests,
      features: p.features,
      highlighted: p.highlighted,
    };
  });

  return c.json({ tiers });
});

// ─── GET /current — Get current subscription for authenticated user ───

billingApp.get('/current', async (c) => {
  const user = c.get('user');
  const tier = c.get('tier');
  const pricing = getPricingByTier(tier);

  return c.json({
    tier,
    queries_per_month: pricing.queries_per_month,
    price: formatPrice(pricing.price_monthly),
    stripe_customer_id: user.stripe_customer_id,
    features: pricing.features,
  });
});

// ─── POST /checkout — Create Polar checkout session ───

const checkoutSchema = z.object({
  tier: z.enum(['hobby', 'pro', 'scale']),
  email: z.string().email().optional(),
});

billingApp.post('/checkout', zValidator('json', checkoutSchema), async (c) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return c.json({ error: 'Billing not configured. Payment processing is currently unavailable.' }, 503);
  }

  try {
    const { tier, email } = c.req.valid('json');
    const user = c.get('user');
    const userEmail = email || user.email;
    const userId = user.id;

    const result = await createCheckoutSession(user.stripe_customer_id, tier, userId, userEmail);

    return c.json({
      url: result.url,
      session_id: result.sessionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[Billing] Checkout error:', message);
    return c.json({ error: message }, 500);
  }
});

// ─── POST /portal — Create customer portal session ───

const portalSchema = z.object({
  return_url: z.string().url().optional(),
});

billingApp.post('/portal', zValidator('json', portalSchema), async (c) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return c.json({ error: 'Billing not configured. Payment processing is currently unavailable.' }, 503);
  }

  try {
    const { return_url } = c.req.valid('json');
    const user = c.get('user');
    const userId = user.id;

    // Get-or-create the Polar customer, persisting the ID on the user row.
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      customerId = await createCustomer(user.email, userId);
      await getSupabase().from('users').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const url = await createCustomerPortalSession(customerId, return_url);
    return c.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal creation failed';
    console.error('[Billing] Portal error:', message);
    return c.json({ error: message }, 500);
  }
});

export { billingApp, billingPricing };
