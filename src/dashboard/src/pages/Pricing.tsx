import { Link } from 'react-router-dom';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';

const PACKS = [
  { name: '1,000 credits', price: '$1', href: '/buy?sku=credits_1k', note: 'Best first top-up' },
  { name: '5,000 credits', price: '$4', href: '/buy?sku=credits_5k', note: 'Burst capacity' },
  { name: '25,000 credits', price: '$15', href: '/buy?sku=credits_25k', note: 'Heavy agent workloads' },
];

const PLANS = [
  { name: 'Free', price: '$0', note: '100 queries / month · REST + MCP' },
  { name: 'Hobby', price: '$29/mo', note: '5,000 queries / month', href: '/buy?sku=hobby' },
  { name: 'Pro', price: '$99/mo', note: '25,000 queries / month', href: '/buy?sku=pro' },
];

export default function Pricing() {
  useSEO({
    title: 'Pricing',
    description:
      'Agent API Gateway pricing: free tier, credit packs from $1, and Hobby/Pro plans. Structured web extraction for AI agents via REST and MCP.',
    keywords: 'Agent API Gateway pricing, AI agent extraction pricing, credit packs, free tier API',
    canonical: 'https://agentapigw.dpdns.org/pricing',
  });

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16">
        <BrandLockup variant="product" showOrgSubline to="/" />
        <SectionLabel>Pricing</SectionLabel>
        <h1 className="text-display-sm mb-3">Simple pricing for agent extraction</h1>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Start free. Buy credit packs anytime for bursts. Subscribe when you want a higher monthly allowance.
          Live machine-readable pricing: <a href="/v1/billing/pricing" className="link-accent">GET /v1/billing/pricing</a>.
        </p>

        <h2 className="text-title mb-3">Credit packs</h2>
        <div className="grid gap-3 sm:grid-cols-3 mb-10">
          {PACKS.map((p) => (
            <a key={p.name} href={p.href} className="surface p-4 interactive block">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-title mt-2" style={{ color: 'var(--color-accent-base)' }}>
                {p.price}
              </p>
              <p className="text-caption mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                {p.note}
              </p>
            </a>
          ))}
        </div>

        <h2 className="text-title mb-3">Plans</h2>
        <div className="grid gap-3 sm:grid-cols-3 mb-10">
          {PLANS.map((p) => (
            <div key={p.name} className="surface p-4">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-title mt-2">{p.price}</p>
              <p className="text-caption mt-1 mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                {p.note}
              </p>
              {p.href ? (
                <a href={p.href} className="btn btn-secondary text-xs w-full">
                  Subscribe
                </a>
              ) : (
                <Link to="/login" className="btn btn-primary text-xs w-full">
                  Create free account
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/login" className="btn btn-primary text-sm">
            Start free
          </Link>
          <Link to="/docs" className="btn btn-secondary text-sm">
            Docs
          </Link>
          <Link to="/alternatives" className="btn btn-ghost text-sm">
            Compare alternatives
          </Link>
        </div>
      </div>
    </div>
  );
}
