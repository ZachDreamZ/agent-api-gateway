import { Link } from 'react-router-dom';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';
import { ArrowRight, Zap } from 'lucide-react';

const PACKS = [
  {
    name: '1,000 credits',
    price: '$1',
    href: '/buy?sku=credits_1k',
    note: 'Best first purchase',
    detail: '≈ $0.001 / extract · stacks on free',
    highlighted: true,
  },
  {
    name: '5,000 credits',
    price: '$4',
    href: '/buy?sku=credits_5k',
    note: 'Burst capacity',
    detail: '≈ $0.0008 / extract',
    highlighted: false,
  },
  {
    name: '25,000 credits',
    price: '$15',
    href: '/buy?sku=credits_25k',
    note: 'Heavy agent workloads',
    detail: '≈ $0.0006 / extract',
    highlighted: false,
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    note: '500 queries / month · REST + MCP',
    detail: 'Enough to integrate a real agent loop',
    href: undefined as string | undefined,
  },
  {
    name: 'Hobby',
    price: '$29/mo',
    note: '5,000 queries · 60 RPM · 5 concurrent',
    detail: 'Always-on allowance + response caching',
    href: '/buy?sku=hobby',
  },
  {
    name: 'Pro',
    price: '$99/mo',
    note: '25,000 queries · 300 RPM · 20 concurrent',
    detail: 'Production agents + priority support',
    href: '/buy?sku=pro',
  },
];

export default function Pricing() {
  useSEO({
    title: 'Pricing',
    description:
      'Agent API Gateway pricing: free tier with 500 queries/month, credit packs from $1, and Hobby/Pro plans for higher RPM. Structured web extraction for AI agents via REST and MCP.',
    keywords: 'Agent API Gateway pricing, AI agent extraction pricing, credit packs, free tier API',
    canonical: 'https://agentapigw.dpdns.org/pricing',
  });

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16">
        <BrandLockup variant="product" showOrgSubline to="/" />
        <SectionLabel>Pricing</SectionLabel>
        <h1 className="text-display-sm mb-3">Start free. Buy credits when agents get busy.</h1>
        <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Most builders start with the free tier, then buy a <strong style={{ color: 'var(--color-text-primary)' }}>$1 pack</strong> for bursts.
          Subscribe only when you want a higher monthly allowance, RPM, and concurrency.
        </p>
        <p className="text-caption mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
          Live machine-readable pricing:{' '}
          <a href="/v1/billing/pricing" className="link-accent">
            GET /v1/billing/pricing
          </a>
          .
        </p>

        <div className="surface surface-glow p-5 mb-10" style={{ borderColor: 'oklch(0.74 0.12 195 / 0.35)' }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-eyebrow mb-2" style={{ color: 'var(--color-accent-base)' }}>
                Fastest path to value
              </p>
              <h2 className="text-title mb-1">Buy 1,000 credits for $1</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Works on free or any plan. Credits never expire until used.
              </p>
            </div>
            <a href="/buy?sku=credits_1k" className="btn btn-primary shrink-0">
              <Zap className="w-4 h-4" />
              Buy $1 credits
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <h2 className="text-title mb-2">Credit packs</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
          One-time top-ups for agent bursts. Stack on free or paid plans.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 mb-10">
          {PACKS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              className="surface p-4 interactive block"
              style={p.highlighted ? { borderColor: 'oklch(0.74 0.12 195 / 0.4)' } : undefined}
            >
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-title mt-2" style={{ color: 'var(--color-accent-base)' }}>
                {p.price}
              </p>
              <p className="text-caption mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {p.note}
              </p>
              <p className="text-caption mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                {p.detail}
              </p>
            </a>
          ))}
        </div>

        <h2 className="text-title mb-2">Monthly plans</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
          Choose a plan when you need a steady allowance, higher rate limits, and concurrency — not just more credits.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 mb-10">
          {PLANS.map((p) => (
            <div key={p.name} className="surface p-4">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-title mt-2">{p.price}</p>
              <p className="text-caption mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {p.note}
              </p>
              <p className="text-caption mt-1 mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                {p.detail}
              </p>
              {p.href ? (
                <a href={p.href} className="btn btn-secondary text-xs w-full">
                  Subscribe
                </a>
              ) : (
                <Link to="/login" className="btn btn-secondary text-xs w-full">
                  Create free account
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="surface p-5 mb-10">
          <h2 className="text-heading mb-3">Packs vs plans</h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Buy packs</strong> when usage is bursty or you are still validating an agent workflow.
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Subscribe</strong> when you need higher RPM/concurrency, caching, and a predictable monthly allowance.
            </li>
            <li>
              Packs always stack on top of free or paid plans and do not expire until used.
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="/buy?sku=credits_1k" className="btn btn-primary text-sm">
            Buy $1 credits
          </a>
          <Link to="/login" className="btn btn-secondary text-sm">
            Start free
          </Link>
          <Link to="/use-cases/price-intelligence" className="btn btn-ghost text-sm">
            See a use case
          </Link>
          <Link to="/alternatives" className="btn btn-ghost text-sm">
            Compare alternatives
          </Link>
        </div>
      </div>
    </div>
  );
}
