import Stripe from 'stripe';
import type { Tier } from '@shared/types';
import { TIER_PRICING } from './pricing';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set — billing endpoints will fail');
}

let stripe: Stripe | null = null;
try {
  if (stripeKey) {
    stripe = new Stripe(stripeKey);
  }
} catch {
  console.warn('⚠️ Failed to init Stripe');
}

const DOMAIN = process.env.APP_DOMAIN || 'http://localhost:5173';

// ─── Checkout Session ───

export interface CheckoutResult {
  url: string | null;
  session_id: string;
}

export async function createCheckoutSession(
  customerId: string | null,
  tier: Tier,
  userId: string,
): Promise<CheckoutResult> {
  if (!stripe) throw new Error('Stripe not initialized');

  const pricing = TIER_PRICING[tier];
  if (!pricing.stripe_price_id) {
    throw new Error(`Tier "${tier}" has no Stripe price id`);
  }

  const customerParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: pricing.stripe_price_id, quantity: 1 }],
    success_url: `${DOMAIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}/pricing`,
    metadata: { user_id: userId, tier },
    subscription_data: {
      metadata: { user_id: userId, tier },
    },
  };

  if (customerId) {
    customerParams.customer = customerId;
  } else {
    customerParams.customer_creation = 'always';
  }

  const session = await stripe.checkout.sessions.create(customerParams);

  return { url: session.url, session_id: session.id };
}

// ─── Customer Portal ───

export async function createPortalSession(
  customerId: string,
  returnUrl?: string,
): Promise<string> {
  if (!stripe) throw new Error('Stripe not initialized');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${DOMAIN}/dashboard`,
  });

  return session.url;
}

// ─── Usage Queries ───

export async function getSubscriptionUsage(
  subscriptionId: string,
): Promise<{ used: number; limit: number }> {
  if (!stripe) throw new Error('Stripe not initialized');

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const items = subscription.items.data;
  const limit = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return { used: 0, limit };
}

export async function getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
  if (!stripe) return null;

  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0] || null;
}

export async function getOrCreateCustomer(
  email: string,
  userId: string,
): Promise<Stripe.Customer> {
  if (!stripe) throw new Error('Stripe not initialized');

  const existing = await getCustomerByEmail(email);
  if (existing) return existing;

  return stripe.customers.create({ email, metadata: { user_id: userId } });
}

export { stripe };
