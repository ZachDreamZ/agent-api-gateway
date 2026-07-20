import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  createCheckoutSession,
  createCreditPackCheckout,
  createCustomerPortalSession,
  createCustomer,
  createPublicCheckout,
  getStarterProductId,
  getPolarProductId,
  listInvoices,
} from '../../billing/polar';
import {
  TIER_ORDER,
  getPricingByTier,
  formatPrice,
  CREDIT_PACKS,
  getCreditPack,
  getCreditPackProductId,
  formatOneTimePrice,
} from '../../billing/pricing';
import { getPool } from '../lib/db.js';
import { getBonusCredits } from '../lib/usage-db.js';
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

  // One-time credit packs — stack on monthly plan allowance
  const credit_packs = CREDIT_PACKS.map((pack) => {
    const productId = getCreditPackProductId(pack);
    return {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      credits: pack.credits,
      price: formatOneTimePrice(pack.price_cents),
      price_cents: pack.price_cents,
      features: pack.features,
      highlighted: pack.highlighted,
      one_time: true,
      available: Boolean(productId),
      buy_url: productId ? `/buy?sku=${pack.id}` : null,
    };
  });

  // Back-compat alias for older clients
  const starter = credit_packs.find((p) => p.id === 'credits_1k') ?? {
    id: 'starter',
    name: 'Starter Pack',
    description: 'One-time 1,000 extraction credits — no subscription',
    credits: 1000,
    price: '$1',
    price_cents: 100,
    features: [],
    highlighted: true,
    one_time: true,
    available: Boolean(process.env.POLAR_PRODUCT_STARTER),
    buy_url: '/buy?sku=starter',
  };

  return c.json({
    tiers,
    credit_packs,
    starter,
    product: 'Agent API Gateway',
    buy_url: '/buy',
    checkout_enabled: Boolean(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_PRODUCT_STARTER),
    public_url: process.env.APP_DOMAIN || 'https://agentapigw.dpdns.org',
    note: 'Subscriptions set monthly limits. Credit packs add bonus credits that stack on top and do not expire until used.',
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
    // Credit packs (including legacy sku=starter)
    const pack = getCreditPack(sku);
    if (pack || sku === 'starter') {
      const creditPack = pack ?? getCreditPack('credits_1k')!;
      const productId = getCreditPackProductId(creditPack) || getStarterProductId();
      if (!productId) {
        return c.json({ error: `Credit pack not configured (${creditPack.envKey})` }, 503);
      }
      const result = await createPublicCheckout(
        productId,
        {
          sku: creditPack.id,
          credits: String(creditPack.credits),
          kind: 'credit_pack',
        },
        body.email,
      );
      return c.json({
        url: result.url,
        session_id: result.sessionId,
        amount_cents: creditPack.price_cents,
        currency: 'usd',
        sku: creditPack.id,
        credits: creditPack.credits,
      });
    }

    const tier = (body.tier || sku) as Tier;
    if (!['hobby', 'pro', 'scale'].includes(tier)) {
      return c.json({
        error: 'Unknown sku. Use credits_1k, credits_5k, credits_25k, starter, hobby, pro, or scale.',
      }, 400);
    }
    const productId = getPolarProductId(tier);
    if (!productId) {
      return c.json({ error: `Product for ${tier} not configured` }, 503);
    }
    const result = await createPublicCheckout(
      productId,
      { sku: tier, tier, kind: 'subscription' },
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
    let meta: Record<string, string> = {
      sku: 'credits_1k',
      credits: '1000',
      kind: 'credit_pack',
    };
    const pack = getCreditPack(sku);
    if (pack || sku === 'starter') {
      const creditPack = pack ?? getCreditPack('credits_1k')!;
      productId = getCreditPackProductId(creditPack) || getStarterProductId();
      meta = {
        sku: creditPack.id,
        credits: String(creditPack.credits),
        kind: 'credit_pack',
      };
    } else if (['hobby', 'pro', 'scale'].includes(sku)) {
      productId = getPolarProductId(sku as Tier);
      meta = { sku, tier: sku, kind: 'subscription' };
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
  let bonus_credits = 0;
  try {
    bonus_credits = await getBonusCredits(user.id);
  } catch {
    bonus_credits = 0;
  }

  return c.json({
    tier,
    queries_per_month: pricing.queries_per_month,
    price: formatPrice(pricing.price_monthly),
    stripe_customer_id: user.stripe_customer_id,
    features: pricing.features,
    bonus_credits,
    credit_balance_note:
      'Remaining credits = monthly plan limit + purchased bonus credits − usage this month. Bonus packs do not expire until used.',
  });
});

billingApp.get('/invoices', async (c) => {
  const user = c.get('user');
  const customerId = user.stripe_customer_id;
  if (!customerId) return c.json({ invoices: [] });
  try {
    const invoices = await listInvoices(customerId);
    return c.json({ invoices });
  } catch (err) {
    console.error('[billing/invoices] error:', err);
    return c.json({ invoices: [], error: 'Could not load invoices' }, 502);
  }
});

// ─── POST /checkout — Create Polar checkout (subscription tier OR credit pack) ───

const checkoutSchema = z
  .object({
    tier: z.enum(['hobby', 'pro', 'scale']).optional(),
    sku: z.string().optional(),
    email: z.string().email().optional(),
  })
  .refine((d) => Boolean(d.tier || d.sku), {
    message: 'Provide tier (subscription) or sku (credit pack)',
  });

billingApp.post('/checkout', zValidator('json', checkoutSchema), async (c) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return c.json({ error: 'Billing not configured. Payment processing is currently unavailable.' }, 503);
  }

  try {
    const { tier, sku, email } = c.req.valid('json');
    const user = c.get('user');
    const userEmail = email || user.email;
    const userId = user.id;
    const customerId = user.stripe_customer_id ?? null;

    // Credit pack top-up (sku preferred over tier)
    const packKey = (sku || '').toLowerCase();
    const pack = packKey ? getCreditPack(packKey) : undefined;
    if (pack) {
      const productId = getCreditPackProductId(pack) || (pack.id === 'credits_1k' ? getStarterProductId() : null);
      if (!productId) {
        return c.json({ error: `Credit pack not configured (${pack.envKey})` }, 503);
      }
      const result = await createCreditPackCheckout(customerId, productId, userId, userEmail, {
        sku: pack.id,
        credits: String(pack.credits),
      });
      return c.json({
        url: result.url,
        session_id: result.sessionId,
        sku: pack.id,
        credits: pack.credits,
        amount_cents: pack.price_cents,
      });
    }

    if (!tier || !['hobby', 'pro', 'scale'].includes(tier)) {
      return c.json({
        error: 'Unknown product. Use sku=credits_1k|credits_5k|credits_25k or tier=hobby|pro|scale.',
      }, 400);
    }

    const result = await createCheckoutSession(customerId, tier, userId, userEmail);

    return c.json({
      url: result.url,
      session_id: result.sessionId,
      sku: tier,
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
      await getPool().query('UPDATE "user" SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
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
