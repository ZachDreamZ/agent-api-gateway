import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  createCheckoutSession,
  createCustomerPortalSession,
  createCustomer,
  createPublicCheckout,
  getStarterProductId,
  getPolarProductId,
} from '../../billing/polar';
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

  // One-time starter pack for low-friction first purchase
  const starter = {
    id: 'starter',
    name: 'Starter Pack',
    description: 'One-time 1,000 extraction credits — no subscription',
    price: '$1',
    price_monthly: 100,
    queries_per_month: 1000,
    rate_limit_rpm: 30,
    concurrent_requests: 2,
    features: [
      { text: '1,000 extraction credits', included: true },
      { text: 'All schemas (product, article, company)', included: true },
      { text: 'One-time payment — no subscription', included: true },
    ],
    highlighted: true,
    one_time: true,
  };

  return c.json({
    tiers,
    starter,
    product: 'Agent API Gateway',
    buy_url: '/buy',
    checkout_enabled: Boolean(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_PRODUCT_STARTER),
    public_url: process.env.APP_DOMAIN || 'https://agentapigw.dpdns.org',
  });
});

// Lightweight IP rate limit for public checkout (abuse / card-testing protection)
const checkoutHits = new Map<string, number[]>();
setInterval(() => checkoutHits.clear(), 60_000).unref?.();

function checkoutRateLimited(ip: string, max = 8): boolean {
  const now = Date.now();
  const cutoff = now - 60_000;
  let hits = (checkoutHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= max) {
    checkoutHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  checkoutHits.set(ip, hits);
  return false;
}

// ─── Public checkout (no auth) — $1 Starter or named tier ───
billingPricing.post('/checkout', async (c) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return c.json({ error: 'Billing not configured. Payment processing is currently unavailable.' }, 503);
  }

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    || c.req.header('cf-connecting-ip')
    || 'unknown';
  if (checkoutRateLimited(ip, 8)) {
    return c.json({ error: 'Too many checkout attempts. Try again in a minute.' }, 429);
  }

  let body: { sku?: string; tier?: string; email?: string } = {};
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  // Basic email shape check when provided (Polar may reject otherwise)
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return c.json({ error: 'Invalid email address' }, 400);
  }

  const sku = (body.sku || 'starter').toLowerCase();
  try {
    if (sku === 'starter') {
      const productId = getStarterProductId();
      if (!productId) {
        return c.json({ error: 'Starter product not configured (set POLAR_PRODUCT_STARTER)' }, 503);
      }
      const result = await createPublicCheckout(
        productId,
        { sku: 'starter_pack', tier: 'hobby' },
        body.email,
      );
      return c.json({ url: result.url, session_id: result.sessionId, amount_cents: 100, currency: 'usd', sku: 'starter' });
    }

    const tier = (body.tier || sku) as Tier;
    if (!['hobby', 'pro', 'scale'].includes(tier)) {
      return c.json({ error: 'Unknown sku/tier. Use starter, hobby, pro, or scale.' }, 400);
    }
    const productId = getPolarProductId(tier);
    if (!productId) {
      return c.json({ error: `Product for ${tier} not configured` }, 503);
    }
    const result = await createPublicCheckout(
      productId,
      { sku: tier, tier },
      body.email,
    );
    const pricing = getPricingByTier(tier);
    return c.json({
      url: result.url,
      session_id: result.sessionId,
      amount_cents: pricing.price_monthly,
      currency: 'usd',
      sku: tier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[Billing] Public checkout error:', message);
    const isProd = process.env.NODE_ENV === 'production';
    return c.json({ error: isProd ? 'Checkout failed. Please try again later.' : message }, 500);
  }
});

// GET /buy → redirect into a fresh Polar checkout (Starter $1 by default)
billingPricing.get('/buy', async (c) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return c.json({ error: 'Billing not configured' }, 503);
  }
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    || c.req.header('cf-connecting-ip')
    || 'unknown';
  if (checkoutRateLimited(ip, 12)) {
    return c.json({ error: 'Too many checkout attempts. Try again in a minute.' }, 429);
  }
  const sku = (c.req.query('sku') || 'starter').toLowerCase();
  try {
    let productId: string | null = null;
    let meta: Record<string, string> = { sku: 'starter_pack', tier: 'hobby' };
    if (sku === 'starter') {
      productId = getStarterProductId();
    } else if (['hobby', 'pro', 'scale'].includes(sku)) {
      productId = getPolarProductId(sku as Tier);
      meta = { sku, tier: sku };
    }
    if (!productId) {
      return c.json({ error: 'Product not configured' }, 503);
    }
    const result = await createPublicCheckout(productId, meta);
    if (!result.url) {
      return c.json({ error: 'Checkout URL missing' }, 500);
    }
    return c.redirect(result.url, 302);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[Billing] /buy error:', message);
    return c.json({ error: 'Could not start checkout' }, 500);
  }
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

    const result = await createCheckoutSession(user.stripe_customer_id ?? null, tier, userId, userEmail);

    return c.json({
      url: result.url,
      session_id: result.sessionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[Billing] Checkout error:', message);
    const isProd = process.env.NODE_ENV === 'production';
    return c.json({ error: isProd ? 'Checkout failed. Please try again later.' : message }, 500);
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
    let customerId: string | null = user.stripe_customer_id ?? null;
    if (!customerId) {
      customerId = await createCustomer(user.email, userId);
      await getSupabase().from('user').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const url = await createCustomerPortalSession(customerId, return_url);
    return c.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal creation failed';
    console.error('[Billing] Portal error:', message);
    const isProd = process.env.NODE_ENV === 'production';
    return c.json({ error: isProd ? 'Could not open billing portal. Please try again later.' : message }, 500);
  }
});

export { billingApp, billingPricing };
