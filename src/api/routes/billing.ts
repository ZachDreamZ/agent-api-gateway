import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createCheckoutSession, createPortalSession, getOrCreateCustomer } from '../../billing/stripe';
import { TIER_PRICING, TIER_ORDER, getPricingByTier, formatPrice } from '../../billing/pricing';
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
  const stripeCustomerId = user.stripe_customer_id;

  const pricing = getPricingByTier(tier);

  return c.json({
    tier,
    queries_per_month: pricing.queries_per_month,
    price: formatPrice(pricing.price_monthly),
    stripe_customer_id: stripeCustomerId,
    features: pricing.features,
  });
});

// ─── POST /checkout — Create Stripe checkout session ───

const checkoutSchema = z.object({
  tier: z.enum(['hobby', 'pro', 'scale']),
  email: z.string().email(),
});

billingApp.post('/checkout', zValidator('json', checkoutSchema), async (c) => {
  try {
    const { tier, email } = c.req.valid('json');
    const user = c.get('user');
    const userId = user.id;

    const customer = await getOrCreateCustomer(email, userId);
    const result = await createCheckoutSession(customer.id, tier, userId);

    return c.json({
      url: result.url,
      session_id: result.session_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('Checkout error:', message);
    return c.json({ error: message }, 500);
  }
});

// ─── POST /portal — Create customer portal session ───

const portalSchema = z.object({
  return_url: z.string().url().optional(),
});

billingApp.post('/portal', zValidator('json', portalSchema), async (c) => {
  try {
    const { return_url } = c.req.valid('json');
    const user = c.get('user');
    const stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      return c.json({ error: 'No Stripe customer found' }, 400);
    }

    const url = await createPortalSession(stripeCustomerId, return_url);
    return c.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal creation failed';
    console.error('Portal error:', message);
    return c.json({ error: message }, 500);
  }
});

export { billingApp, billingPricing };
