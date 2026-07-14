import { useState, useEffect } from 'react';

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
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition-all ${
        tier.highlighted
          ? 'border-brand-500/50 bg-brand-600/5 shadow-lg shadow-brand-900/20'
          : 'border-surface-800 bg-surface-900 hover:border-surface-700'
      }`}
    >
      {tier.highlighted && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white">
          Popular
        </span>
      )}

      <h3 className="text-lg font-bold">{tier.name}</h3>
      <p className="mt-1 text-sm text-surface-400">{tier.description}</p>

      <p className="mt-4">
        <span className="text-3xl font-bold">{tier.price}</span>
        {tier.price_monthly > 0 && (
          <span className="ml-1 text-sm text-surface-500">/month</span>
        )}
      </p>

      <ul className="mt-5 flex-1 space-y-2">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={f.included ? 'text-green-400' : 'text-surface-600'}>
              {f.included ? '✓' : '—'}
            </span>
            <span className={f.included ? 'text-surface-200' : 'text-surface-600'}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(tier.id)}
        disabled={isCurrent || isFree || loading}
        className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
          isCurrent
            ? 'border border-surface-700 bg-surface-800 text-surface-400'
            : tier.highlighted
              ? 'bg-brand-600 text-white hover:bg-brand-500'
              : 'border border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700'
        }`}
      >
        {isCurrent ? 'Current Plan' : isFree ? 'Free' : 'Subscribe'}
      </button>
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
          // Seed demo data since backend endpoints may not be wired yet
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
      // Prompt for email if needed — in production use auth user
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

  // ─── Render ───

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-surface-900" />
        ))}
      </div>
    );
  }

  // If no pricing data from backend, show inline message
  if (tiers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-surface-800 bg-surface-900 p-6">
          <h2 className="mb-2 text-lg font-bold">Current Plan</h2>
          {current ? (
            <div className="flex items-center gap-3">
              <span className="rounded bg-brand-600/20 px-2 py-0.5 text-sm font-medium text-brand-400 uppercase">
                {current.tier}
              </span>
              <span className="text-sm text-surface-400">{current.price}</span>
            </div>
          ) : (
            <p className="text-sm text-surface-500">Loading plan info...</p>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-surface-700 p-8 text-center text-sm text-surface-500">
          Pricing data unavailable. Start the API server and ensure Stripe is configured.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Current plan bar */}
      {current && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-surface-800 bg-surface-900 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-400">Current plan:</span>
            <span className="rounded bg-brand-600/20 px-2 py-0.5 text-sm font-medium text-brand-400 uppercase">
              {current.tier}
            </span>
            <span className="text-sm text-surface-500">{current.price}</span>
          </div>
          {current.stripe_customer_id && (
            <button
              onClick={handlePortal}
              className="rounded-lg border border-surface-700 px-3 py-1.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Manage Subscription
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Plan cards */}
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
