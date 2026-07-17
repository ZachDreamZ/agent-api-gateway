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
    // -1 = custom / contact sales (must not format as "Free")
    price_monthly: -1,
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
  if (cents < 0) return 'Custom';
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}/mo`;
}

/** One-time credit packs — stack on top of subscription monthly limits. */
export interface CreditPack {
  id: string;
  name: string;
  description: string;
  credits: number;
  price_cents: number;
  /** Env var holding Polar product id */
  envKey: string;
  features: PricingFeature[];
  highlighted: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'credits_1k',
    name: '1,000 credits',
    description: 'Top-up pack — works with free or any subscription',
    credits: 1000,
    price_cents: 100,
    envKey: 'POLAR_PRODUCT_STARTER',
    features: [
      { text: '1,000 extraction credits', included: true },
      { text: 'Never expires (until used)', included: true },
      { text: 'Stacks on top of your plan', included: true },
    ],
    highlighted: true,
  },
  {
    id: 'credits_5k',
    name: '5,000 credits',
    description: 'For bursts above your monthly allowance',
    credits: 5000,
    price_cents: 400,
    envKey: 'POLAR_PRODUCT_CREDITS_5K',
    features: [
      { text: '5,000 extraction credits', included: true },
      { text: 'Never expires (until used)', included: true },
      { text: 'Stacks on top of your plan', included: true },
    ],
    highlighted: false,
  },
  {
    id: 'credits_25k',
    name: '25,000 credits',
    description: 'Heavy agent workloads without upgrading plan',
    credits: 25000,
    price_cents: 1500,
    envKey: 'POLAR_PRODUCT_CREDITS_25K',
    features: [
      { text: '25,000 extraction credits', included: true },
      { text: 'Never expires (until used)', included: true },
      { text: 'Stacks on top of your plan', included: true },
    ],
    highlighted: false,
  },
];

export function getCreditPack(id: string): CreditPack | undefined {
  const key = id === 'starter' ? 'credits_1k' : id;
  return CREDIT_PACKS.find((p) => p.id === key);
}

export function getCreditPackProductId(pack: CreditPack): string | null {
  const v = process.env[pack.envKey]?.trim();
  return v || null;
}

export function formatOneTimePrice(cents: number): string {
  if (cents <= 0) return 'Free';
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
