import { Hono } from 'hono';
import { stripe } from './stripe';
import type { Tier } from '@shared/types';

// ─── Webhook Handler ───

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const webhookApp = new Hono();

webhookApp.post('/', async (c) => {
  if (!stripe) {
    return c.json({ error: 'Stripe not initialized' }, 500);
  }

  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    const body = await c.req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('Stripe webhook verification failed:', message);
    return c.json({ error: message }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier as Tier | undefined;
        if (userId && tier) {
          console.log(`[Stripe] Checkout completed: user=${userId} tier=${tier}`);
          // In production: update user.tier in Supabase here
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        const status = subscription.status;
        if (userId) {
          const tier = status === 'active' || status === 'trialing'
            ? 'pro'
            : 'free';
          console.log(`[Stripe] Subscription ${status}: user=${userId} tier=${tier}`);
          // In production: update user.tier in Supabase here
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const email = invoice.customer_email || invoice.customer_name || 'unknown';
        console.warn(`[Stripe] Payment failed for ${email}`);
        // In production: flag user, send email
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return c.json({ error: 'Webhook handler failed' }, 500);
  }
});

export { webhookApp };
