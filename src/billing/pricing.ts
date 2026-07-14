import type { Tier } from '@shared/types';

// ─── Feature Flags ───

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface TierPricing {
  id: Tier;
  name: string;
  description: string;
  price_monthly: number;       // USD cents (0 = free)
  stripe_price_id: string;     // Stripe recurring price id
  queries_per_month: number;
  rate_limit_rpm: number;
  concurrent_requests: number;
  features: PricingFeature[];
  highlighted: boolean;
}

export const TIER_PRICING: Record<Tier, TierPricing> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Evaluate the API with basic access',
    price_monthly: 0,
    stripe_price_id: '',
    queries_per_month: 100,
    rate_limit_rpm: 10,
    concurrent_requests: 1,
    features: [
      { text: '100 queries / month', included: true },
      { text: 'Product extraction', included: true },
      { text: '1 concurrent request', included: true },
      { text: '10 RPM rate limit', included: true },
      { text: 'API key management', included: true },
      { text: 'No caching', included: false },
      { text: 'Priority support', included: false },
      { text: 'Team members', included: false },
    ],
    highlighted: false,
  },
  hobby: {
    id: 'hobby',
    name: 'Hobby',
    description: 'For solo devs and indie hackers',
    price_monthly: 2900, // $29
    stripe_price_id: 'price_hobby_monthly',
    queries_per_month: 5000,
    rate_limit_rpm: 60,
    concurrent_requests: 5,
    features: [
      { text: '5,000 queries / month', included: true },
      { text: 'All extraction schemas', included: true },
      { text: '5 concurrent requests', included: true },
      { text: '60 RPM rate limit', included: true },
      { text: 'API key management', included: true },
      { text: 'Response caching', included: true },
      { text: 'Priority support', included: false },
      { text: 'Team members', included: false },
    ],
    highlighted: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For teams and agent builders',
    price_monthly: 9900, // $99
    stripe_price_id: 'price_pro_monthly',
    queries_per_month: 25000,
    rate_limit_rpm: 300,
    concurrent_requests: 20,
    features: [
      { text: '25,000 queries / month', included: true },
      { text: 'All extraction schemas', included: true },
      { text: '20 concurrent requests', included: true },
      { text: '300 RPM rate limit', included: true },
      { text: 'API key management', included: true },
      { text: 'Response caching', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Early access to new schemas', included: true },
    ],
    highlighted: true,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    description: 'For companies embedding in product',
    price_monthly: 0, // custom pricing
    stripe_price_id: 'price_scale_monthly',
    queries_per_month: 100000,
    rate_limit_rpm: 1000,
    concurrent_requests: 100,
    features: [
      { text: '100,000+ queries / month', included: true },
      { text: 'All extraction schemas', included: true },
      { text: '100 concurrent requests', included: true },
      { text: '1,000 RPM rate limit', included: true },
      { text: 'Custom extraction schemas', included: true },
      { text: 'Dedicated infrastructure', included: true },
      { text: 'SLAs & phone support', included: true },
      { text: 'Custom invoicing', included: true },
    ],
    highlighted: false,
  },
};

export const TIER_ORDER: Tier[] = ['free', 'hobby', 'pro', 'scale'];

export function getPricingByTier(tier: Tier): TierPricing {
  return TIER_PRICING[tier];
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}/mo`;
}
