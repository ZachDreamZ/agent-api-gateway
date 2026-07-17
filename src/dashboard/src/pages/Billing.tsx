import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Star, ExternalLink, Zap } from 'lucide-react';
import { PageHeader, Stagger, StaggerItem } from '../components/Brand';
import { easeOut } from '../lib/motion';

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

interface CreditPack {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: string;
  price_cents: number;
  features: { text: string; included: boolean }[];
  highlighted: boolean;
  one_time: boolean;
  available: boolean;
  buy_url: string | null;
}

interface CurrentPlan {
  tier: string;
  queries_per_month: number;
  price: string;
  stripe_customer_id: string | null;
  features: { text: string; included: boolean }[];
  bonus_credits?: number;
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
  const isCustom = tier.price_monthly < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="surface-elevated surface-hover surface-glow flex flex-col overflow-hidden h-full"
      style={{
        borderColor: tier.highlighted ? 'oklch(0.74 0.12 195 / 0.45)' : undefined,
        boxShadow: tier.highlighted ? 'var(--shadow-glow)' : undefined,
      }}
    >
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

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{tier.price}</span>
            {tier.price_monthly > 0 && (
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>/month</span>
            )}
          </div>
          {tier.price_monthly > 0 && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Billed monthly via Polar
            </p>
          )}
          {isCustom && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Contact support for volume pricing
            </p>
          )}
        </div>

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

        <button
          type="button"
          onClick={() => onSelect(tier.id)}
          disabled={isCurrent || isFree || isCustom || loading}
          className={`btn w-full ${isCurrent ? 'btn-secondary cursor-default' : tier.highlighted ? 'btn-primary' : 'btn-secondary'}`}
        >
          {isCurrent ? 'Current Plan' : isFree ? 'Free Forever' : isCustom ? 'Contact sales' : loading ? 'Redirecting…' : 'Upgrade'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Credit Pack Card ───

function CreditPackCard({
  pack,
  onBuy,
  loading,
}: {
  pack: CreditPack;
  onBuy: (sku: string) => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="surface-elevated surface-hover flex flex-col overflow-hidden h-full"
      style={{
        borderColor: pack.highlighted ? 'oklch(0.74 0.12 195 / 0.45)' : undefined,
        boxShadow: pack.highlighted ? 'var(--shadow-glow)' : undefined,
      }}
    >
      {pack.highlighted && (
        <div
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold"
          style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
        >
          <Zap className="w-3 h-3" />
          Best first top-up
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{pack.name}</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{pack.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
              {pack.price}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>one-time</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
            {pack.credits.toLocaleString()} credits · stacks on your plan
          </p>
        </div>

        <ul className="mb-6 flex-1 space-y-3">
          {pack.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{f.text}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onBuy(pack.id)}
          disabled={!pack.available || loading}
          className={`btn w-full ${pack.highlighted ? 'btn-primary' : 'btn-secondary'}`}
        >
          {!pack.available ? 'Coming soon' : loading ? 'Redirecting…' : `Buy ${pack.price}`}
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
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [current, setCurrent] = useState<CurrentPlan | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; bonus: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [tiersRes, currentRes, usageRes] = await Promise.all([
          fetch('/v1/billing/pricing'),
          fetch('/v1/billing/current'),
          fetch('/v1/usage'),
        ]);

        if (!tiersRes.ok) throw new Error(`Pricing HTTP ${tiersRes.status}`);

        const tiersData = (await tiersRes.json()) as {
          tiers: PricingTier[];
          credit_packs?: CreditPack[];
        };
        const currentData = currentRes.ok ? ((await currentRes.json()) as CurrentPlan) : null;
        let usageData: { used: number; limit: number; bonus: number } | null = null;
        if (usageRes.ok) {
          const u = (await usageRes.json()) as {
            credits_used?: number;
            credits_limit?: number;
            bonus_credits?: number;
          };
          usageData = {
            used: u.credits_used ?? 0,
            limit: u.credits_limit ?? currentData?.queries_per_month ?? 0,
            bonus: u.bonus_credits ?? currentData?.bonus_credits ?? 0,
          };
        }

        if (!cancelled) {
          setTiers(tiersData.tiers ?? []);
          setCreditPacks(tiersData.credit_packs ?? []);
          setCurrent(currentData);
          setUsage(usageData);
        }
      } catch {
        if (!cancelled) {
          setTiers([]);
          setCreditPacks([]);
          setCurrent(null);
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelect(tierId: string) {
    if (tierId === 'free' || tierId === 'scale') return;
    setCheckoutLoading(tierId);
    setError(null);

    try {
      const res = await fetch('/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
        credentials: 'include',
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

  async function handleBuyCredits(sku: string) {
    setCheckoutLoading(sku);
    setError(null);

    try {
      // Authenticated checkout attaches user_id so webhook grants bonus credits
      const res = await fetch('/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku }),
        credentials: 'include',
      });

      if (res.ok) {
        const data = (await res.json()) as { url: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Fallback: public /buy redirect (email match on webhook)
      window.location.href = `/buy?sku=${encodeURIComponent(sku)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
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
        credentials: 'include',
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
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>Start the API server and ensure billing is configured</p>
        </div>
      </div>
    );
  }

  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? current?.queries_per_month ?? 0;
  const bonus = usage?.bonus ?? current?.bonus_credits ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Plans & credits"
        description="Subscribe for a monthly allowance, or buy credit packs anytime — they stack on top of your plan and don’t expire until used."
      />

      {current && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface surface-glow p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current plan</span>
            <span className="badge badge-active uppercase">{current.tier}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{current.price}</span>
            {bonus > 0 && (
              <span className="badge" style={{ color: 'var(--color-accent-base)' }}>
                +{bonus.toLocaleString()} bonus credits
              </span>
            )}
          </div>
          {current.stripe_customer_id && (
            <button
              type="button"
              onClick={handlePortal}
              className="btn btn-secondary w-full sm:w-auto"
              style={{ fontSize: '0.8125rem' }}
            >
              Manage subscription
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      <UsageBar
        used={used}
        limit={limit}
        label={bonus > 0 ? `Credits this month (incl. ${bonus.toLocaleString()} bonus)` : 'Credits this month'}
      />

      {error && (
        <div className="rounded-md px-4 py-3 text-sm" style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      {creditPacks.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Credit packs
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              One-time top-ups when you hit your limit — no plan change required.
            </p>
          </div>
          <Stagger className="grid gap-4 md:grid-cols-3">
            {creditPacks.map((pack) => (
              <StaggerItem key={pack.id}>
                <CreditPackCard
                  pack={pack}
                  onBuy={handleBuyCredits}
                  loading={checkoutLoading === pack.id}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Subscriptions
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Monthly plans for a steady allowance and higher rate limits.
          </p>
        </div>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <StaggerItem key={tier.id}>
              <PlanCard
                tier={tier}
                currentTier={current?.tier ?? 'free'}
                onSelect={handleSelect}
                loading={checkoutLoading === tier.id}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
