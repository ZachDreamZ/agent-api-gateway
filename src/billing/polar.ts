import { Polar } from '@polar-sh/sdk';
import type { Tier } from '@shared/types';

const accessToken = process.env.POLAR_ACCESS_TOKEN;
const server = (process.env.POLAR_SERVER || 'production') as 'production' | 'sandbox';

if (!accessToken) {
  console.warn('⚠️ POLAR_ACCESS_TOKEN not set — billing endpoints will fail');
}

let polar: Polar | null = null;
try {
  if (accessToken) {
    polar = new Polar({ accessToken, server });
  }
} catch {
  console.warn('⚠️ Failed to initialize Polar client');
}

const APP_DOMAIN = process.env.APP_DOMAIN || 'http://localhost:3000';

export interface CheckoutResult {
  url: string | null;
  sessionId: string;
}

// Resolve the Polar product ID for a tier from environment configuration.
// Products must be created in the Polar dashboard (Products → New → Recurring).
export function getPolarProductId(tier: Tier): string | null {
  switch (tier) {
    case 'hobby': return process.env.POLAR_PRODUCT_HOBBY || null;
    case 'pro': return process.env.POLAR_PRODUCT_PRO || null;
    case 'scale': return process.env.POLAR_PRODUCT_SCALE || null;
    default: return null;
  }
}

/** One-time Starter Pack product ($1) for first-purchase conversion. */
export function getStarterProductId(): string | null {
  return process.env.POLAR_PRODUCT_STARTER || null;
}

/**
 * Create a public checkout session (no login required).
 * Used for the $1 Starter Pack and marketing CTAs.
 */
export async function createPublicCheckout(
  productId: string,
  metadata: Record<string, string> = {},
  customerEmail?: string,
): Promise<CheckoutResult> {
  if (!polar) throw new Error('Polar not initialized');

  const params: Parameters<typeof polar.checkouts.create>[0] = {
    products: [productId],
    successUrl: `${APP_DOMAIN}/?checkout=success&checkout_id={CHECKOUT_ID}`,
    metadata: { product: 'agent-api-gateway', ...metadata },
  };
  if (customerEmail) {
    params.customerEmail = customerEmail;
  }

  const checkout = await polar.checkouts.create(params);
  return { url: checkout.url, sessionId: checkout.id };
}

export async function createCheckoutSession(
  customerId: string | null,
  tier: Tier,
  userId: string,
  userEmail: string,
): Promise<CheckoutResult> {
  if (!polar) throw new Error('Polar not initialized');

  const productId = getPolarProductId(tier);
  if (!productId) {
    throw new Error(
      `Tier "${tier}" has no Polar product configured (set POLAR_PRODUCT_${tier.toUpperCase()})`,
    );
  }

  const params: Parameters<typeof polar.checkouts.create>[0] = {
    products: [productId],
    successUrl: `${APP_DOMAIN}/dashboard?checkout_id={CHECKOUT_ID}`,
    metadata: { user_id: userId, tier },
  };
  if (customerId) {
    params.customerId = customerId;
  } else {
    params.customerEmail = userEmail;
  }

  const checkout = await polar.checkouts.create(params);
  return { url: checkout.url, sessionId: checkout.id };
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string,
): Promise<string> {
  if (!polar) throw new Error('Polar not initialized');
  const session = await polar.customerSessions.create({ customerId });
  return session.customerPortalUrl;
}

export async function createCustomer(email: string, userId: string): Promise<string> {
  if (!polar) throw new Error('Polar not initialized');
  const customer = await polar.customers.create({
    email,
    metadata: { user_id: userId },
  });
  return customer.id;
}

export { polar };
