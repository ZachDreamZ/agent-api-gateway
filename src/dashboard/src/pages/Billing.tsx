import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// ─── Types ───

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  price_monthly: number;
  queries_per_month: number;
  rate_limit_rpm: number;
  concurrent_requests: number;
  features: { text: string; included: boolean }[];
  highlighted: boolean;
}

interface CurrentPlan {
  tier: string;
  queries_per_month: number;
  price: string;
  stripe_customer_id: string | null;
  features: { text: string; included: boolean }[];
}

// ─── Icons ───

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconStar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconExternalLink({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── Plan Card ───

function PlanCard({
  tier,
  currentTier,
  onSelect,
  loading,
}: {
  tier: PricingTier;
  currentTier: string;
  onSelect: (tierId: string) => void;
  loading: boolean;
}) {
  const isCurrent = tier.id === currentTier;
  const isFree = tier.id === 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col overflow-hidden rounded-2xl glass-card transition-all ${
        tier.highlighted
          ? 'border-brand-500/40 shadow-lg shadow-brand-900/20'
          : 'glass-card-hover'
      }`}
    >
      {/* Highlighted badge */}
      {tier.highlighted && (
        <div className="flex items-center justify-center gap-1.5 bg-brand-600/20 px-4 py-2 text-xs font-semibold text-brand-400">
          <IconStar className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">{tier.name}</h3>
          <p className="mt-1 text-sm text-white/50">{tier.description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
            {tier.price_monthly > 0 && (
              <span className="text-sm text-white/40">/month</span>
            )}
          </div>
          {tier.price_monthly > 0 && (
            <p className="mt-1 text-xs text-white/30">
              ${(tier.price_monthly * 12).toLocaleString()}/year billed annually
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="mb-6 flex-1 space-y-3">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {f.included ? (
                <IconCheck className="mt-0.5 w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <IconX className="mt-0.5 w-4 h-4 flex-shrink-0 text-white/20" />
              )}
              <span className={f.included ? 'text-white/70' : 'text-white/25'}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onSelect(tier.id)}
          disabled={isCurrent || isFree || loading}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 ${
            isCurrent
              ? 'glass-card text-white/50 cursor-default'
              : tier.highlighted
                ? 'bg-brand-600 text-white hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/25'
                : 'glass-card text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          {isCurrent ? 'Current Plan' : isFree ? 'Free Forever' : 'Upgrade'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Usage Bar ───

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="rounded-xl glass-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">{label}</span>
        <span className="text-xs text-white/40">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-brand-500"
        />
      </div>
    </div>
  );
}

// ─── Billing Page ───

export default function Billing() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [current, setCurrent] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [tiersRes, currentRes] = await Promise.all([
          fetch('/v1/billing/pricing'),
          fetch('/v1/billing/current'),
        ]);

        if (!tiersRes.ok) throw new Error(`Pricing HTTP ${tiersRes.status}`);
        if (!currentRes.ok) throw new Error(`Current HTTP ${currentRes.status}`);

        const tiersData = (await tiersRes.json()) as { tiers: PricingTier[] };
        const currentData = (await currentRes.json()) as CurrentPlan;

        if (!cancelled) {
          setTiers(tiersData.tiers);
          setCurrent(currentData);
        }
      } catch (err) {
        if (!cancelled) {
          setTiers([]);
          setCurrent(null);
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function handleSelect(tierId: string) {
    setCheckoutLoading(tierId);
    setError(null);

    try {
      const email = prompt('Enter your email for checkout:');
      if (!email) {
        setCheckoutLoading(null);
        return;
      }

      const res = await fetch('/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId, email }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { url: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setError(null);
    try {
      const res = await fetch('/v1/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: window.location.href }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { url: string };
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portal redirect failed');
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-96 animate-pulse rounded-2xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl glass-card p-6">
          <h2 className="mb-2 text-lg font-bold text-white">Current Plan</h2>
          {current ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-600/20 px-3 py-1 text-sm font-medium text-brand-400 uppercase">
                {current.tier}
              </span>
              <span className="text-sm text-white/40">{current.price}</span>
            </div>
          ) : (
            <p className="text-sm text-white/40">Loading plan info...</p>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-sm text-white/40">Pricing data unavailable</p>
          <p className="mt-1 text-xs text-white/30">Start the API server and ensure Stripe is configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current plan bar */}
      {current && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-xl glass-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">Current plan:</span>
            <span className="rounded-full bg-brand-600/20 px-3 py-1 text-sm font-medium text-brand-400 uppercase">
              {current.tier}
            </span>
            <span className="text-sm text-white/40">{current.price}</span>
          </div>
          {current.stripe_customer_id && (
            <button
              onClick={handlePortal}
              className="inline-flex items-center gap-2 rounded-lg glass-card px-4 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white/80"
            >
              Manage Subscription
              <IconExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      {/* Usage */}
      <UsageBar
        used={0}
        limit={current?.queries_per_month ?? 0}
        label="Queries this month"
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl glass-card border-red-500/20 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier, i) => (
          <PlanCard
            key={tier.id}
            tier={tier}
            currentTier={current?.tier ?? 'free'}
            onSelect={handleSelect}
            loading={checkoutLoading === tier.id}
          />
        ))}
      </div>
    </div>
  );
}
