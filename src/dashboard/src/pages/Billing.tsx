import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, X, Star, ExternalLink, Zap, BadgeCheck } from 'lucide-react';
import { PageHeader, Stagger, StaggerItem } from '../components/Brand';
import { easeOut } from '../lib/motion';
import { useSEO } from '../hooks/useSEO';

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

interface BillingInvoice {
  id: string;
  created_at: string;
  product_name: string | null;
  amount: number | null;
  currency: string;
  status: string;
  receipt_url: string | null;
}

/** Always show packs even if pricing API is slow/partial */
const FALLBACK_CREDIT_PACKS: CreditPack[] = [
  {
    id: 'credits_1k',
    name: '1,000 credits',
    description: 'Top-up pack — works with free or any subscription',
    credits: 1000,
    price: '$1',
    price_cents: 100,
    features: [
      { text: '1,000 extraction credits', included: true },
      { text: 'Never expires (until used)', included: true },
      { text: 'Stacks on top of your plan', included: true },
    ],
    highlighted: true,
    one_time: true,
    available: true,
    buy_url: '/buy?sku=credits_1k',
  },
  {
    id: 'credits_5k',
    name: '5,000 credits',
    description: 'For bursts above your monthly allowance',
    credits: 5000,
    price: '$4',
    price_cents: 400,
    features: [
      { text: '5,000 extraction credits', included: true },
      { text: 'Never expires (until used)', included: true },
      { text: 'Stacks on top of your plan', included: true },
    ],
    highlighted: false,
    one_time: true,
    available: true,
    buy_url: '/buy?sku=credits_5k',
  },
  {
    id: 'credits_25k',
    name: '25,000 credits',
    description: 'Heavy agent workloads without upgrading plan',
    credits: 25000,
    price: '$15',
    price_cents: 1500,
    features: [
      { text: '25,000 extraction credits', included: true },
      { text: 'Never expires (until used)', included: true },
      { text: 'Stacks on top of your plan', included: true },
    ],
    highlighted: false,
    one_time: true,
    available: true,
    buy_url: '/buy?sku=credits_25k',
  },
];

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
          <h3 className="text-heading" style={{ color: 'var(--color-text-primary)' }}>{tier.name}</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{tier.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-title tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{tier.price}</span>
          </div>
          {tier.price_monthly > 0 && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Billed monthly via Polar · buy credit packs anytime
            </p>
          )}
          {isCustom && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Contact support for volume pricing
            </p>
          )}
          {isFree && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Credit packs stack on free
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
          <h3 className="text-heading" style={{ color: 'var(--color-text-primary)' }}>{pack.name}</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{pack.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-title tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
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
      {pct >= 80 && (
        <p className="mt-2 text-xs" style={{ color: 'var(--color-accent-base)' }}>
          Running low — grab a credit pack below without changing your plan.
        </p>
      )}
    </div>
  );
}

// ─── Billing Page ───

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>(FALLBACK_CREDIT_PACKS);
  const [current, setCurrent] = useState<CurrentPlan | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; bonus: number } | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useSEO({ title: 'Billing & Plans', description: 'Manage your subscription, view pricing tiers, and purchase credit packs.' });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      setSuccessMsg('Payment received. Credit packs land as bonus credits within a minute — refresh if the balance looks unchanged.');
      searchParams.delete('checkout');
      searchParams.delete('checkout_id');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [tiersRes, currentRes, usageRes, invoicesRes] = await Promise.all([
          fetch('/v1/billing/pricing'),
          fetch('/v1/billing/current', { credentials: 'include' }),
          fetch('/v1/usage', { credentials: 'include' }),
          fetch('/v1/billing/invoices', { credentials: 'include' }),
        ]);

        if (tiersRes.ok) {
          const tiersData = (await tiersRes.json()) as {
            tiers: PricingTier[];
            credit_packs?: CreditPack[];
          };
          if (!cancelled) {
            setTiers(tiersData.tiers ?? []);
            if (tiersData.credit_packs && tiersData.credit_packs.length > 0) {
              setCreditPacks(tiersData.credit_packs);
            }
          }
        }

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
          setCurrent(currentData);
          setUsage(usageData);
          if (invoicesRes.ok) {
            const inv = (await invoicesRes.json()) as { invoices: BillingInvoice[] };
            setInvoices(inv.invoices ?? []);
          }
        }
      } catch {
        if (!cancelled) {
          setCreditPacks(FALLBACK_CREDIT_PACKS);
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
      <div className="space-y-6">
        <div className="surface skeleton" style={{ height: '5rem' }} />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface skeleton" style={{ height: '20rem' }} />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface skeleton" style={{ height: '24rem' }} />
          ))}
        </div>
      </div>
    );
  }

  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? current?.queries_per_month ?? 0;
  const bonus = usage?.bonus ?? current?.bonus_credits ?? 0;
  const packs = creditPacks.length > 0 ? creditPacks : FALLBACK_CREDIT_PACKS;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Plans & credits"
        description="Subscribe for a monthly allowance, or buy credit packs anytime — they stack on top of your plan and don’t expire until used."
      />

      {successMsg && (
        <div
          className="rounded-md px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ background: 'var(--color-success-subtle, oklch(0.9 0.05 145 / 0.25))', color: 'var(--color-success, oklch(0.65 0.15 145))', border: '1px solid oklch(0.7 0.1 145 / 0.35)' }}
        >
          <span>{successMsg}</span>
          <button type="button" className="btn btn-secondary text-xs shrink-0" onClick={() => window.location.reload()}>
            Refresh balance
          </button>
        </div>
      )}

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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <a href="#credit-packs" className="btn btn-primary w-full sm:w-auto" style={{ fontSize: '0.8125rem' }}>
              <Zap className="w-3.5 h-3.5" />
              Buy credits
            </a>
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
          </div>
        </motion.div>
      )}

      <UsageBar
        used={used}
        limit={limit}
        label={bonus > 0 ? `Credits this month (incl. ${bonus.toLocaleString()} bonus)` : 'Credits this month'}
      />

      <section className="space-y-3">
        <h2 className="text-heading" style={{ color: 'var(--color-text-primary)' }}>
          Billing history
        </h2>
        {invoices.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No invoices yet. Your first purchase will appear here.
          </p>
        ) : (
        <div className="surface surface-hover surface-glow divide-y" style={{ border: '1px solid var(--color-border-default)' }}>
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {inv.product_name || 'Order'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                    {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    {inv.status ? ` · ${inv.status}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {inv.amount != null ? `${inv.currency.toUpperCase()} ${(inv.amount / 100).toLocaleString()}` : '—'}
                  </span>
                  {inv.receipt_url && (
                    <a href={inv.receipt_url} target="_blank" rel="noreferrer" className="btn btn-ghost text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Receipt
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-md px-4 py-3 text-sm" style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <section id="credit-packs" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="text-heading" style={{ color: 'var(--color-text-primary)' }}>
            Credit packs
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            One-time top-ups when you hit your limit — no plan change required. Credits stack on free or any subscription.
          </p>
        </div>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {packs.map((pack) => (
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

      <section className="space-y-4">
        <div>
          <h2 className="text-heading" style={{ color: 'var(--color-text-primary)' }}>
            Subscriptions
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Monthly plans for a steady allowance and higher rate limits. You can still buy credit packs on top.
          </p>
        </div>
        {tiers.length > 0 ? (
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
        ) : (
          <div
            className="rounded-xl p-8 text-center"
            style={{ border: '1px dashed var(--color-border-default)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Subscription pricing temporarily unavailable.
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Credit packs above still work via Polar checkout.
            </p>
            <Link to="/" className="btn btn-secondary mt-4 text-xs">
              View public pricing
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
