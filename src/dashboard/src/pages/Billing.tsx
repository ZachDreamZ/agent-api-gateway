import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Star, ExternalLink } from 'lucide-react';

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-elevated flex flex-col overflow-hidden"
      style={{
        borderColor: tier.highlighted ? 'var(--color-accent-base)' : undefined,
      }}
    >
      {/* Highlighted badge */}
      {tier.highlighted && (
        <div
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold"
          style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
        >
          <Star className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{tier.name}</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{tier.description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{tier.price}</span>
            {tier.price_monthly > 0 && (
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>/month</span>
            )}
          </div>
          {tier.price_monthly > 0 && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              ${(tier.price_monthly * 12).toLocaleString()}/year billed annually
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="mb-6 flex-1 space-y-3">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {f.included ? (
                <Check className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
              ) : (
                <X className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
              )}
              <span style={{ color: f.included ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)' }}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onSelect(tier.id)}
          disabled={isCurrent || isFree || loading}
          className={`btn w-full ${isCurrent ? 'btn-secondary cursor-default' : tier.highlighted ? 'btn-primary' : 'btn-secondary'}`}
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
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="progress-fill"
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
          <div key={i} className="surface skeleton" style={{ height: '24rem' }} />
        ))}
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="surface p-6">
          <h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Current Plan</h2>
          {current ? (
            <div className="flex items-center gap-3">
              <span className="badge badge-active uppercase">{current.tier}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{current.price}</span>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading plan info...</p>
          )}
        </div>

        <div
          className="rounded-xl p-12 text-center"
          style={{ border: '1px dashed var(--color-border-default)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Pricing data unavailable</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>Start the API server and ensure Stripe is configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current plan bar */}
      {current && (
        <div className="surface p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current plan:</span>
            <span className="badge badge-active uppercase">{current.tier}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{current.price}</span>
          </div>
          {current.stripe_customer_id && (
            <button
              onClick={handlePortal}
              className="btn btn-secondary w-full sm:w-auto"
              style={{ fontSize: '0.8125rem' }}
            >
              Manage Subscription
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Usage */}
      <UsageBar
        used={0}
        limit={current?.queries_per_month ?? 0}
        label="Queries this month"
      />

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
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
