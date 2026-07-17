import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Check,
  Box,
  Layers,
  Zap,
  Shield,
  Copy,
  Terminal,
  Lock,
} from 'lucide-react';
import { BrandLockup, AmbientBg, SectionLabel, Reveal } from '../components/Brand';
import { easeOut } from '../lib/motion';

// ═══════════════════════════════════════════════════════════════════════════
// Agent API Gateway — Landing
// Signature: interactive schema playground (request → typed JSON)
// ═══════════════════════════════════════════════════════════════════════════

function StatusChip() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/health')
      .then((r) => r.ok)
      .then((v) => { if (!cancelled) setOk(v); })
      .catch(() => { if (!cancelled) setOk(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <span className="status-chip" title="Live /health probe">
      <span className={ok === false ? 'signal-dot' : 'signal-dot signal-dot-ok'} style={ok === false ? { background: 'var(--color-error)' } : undefined} />
      {ok === null ? 'Checking…' : ok ? 'API operational' : 'API degraded'}
    </span>
  );
}

// ─── Navbar ───

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-6" aria-label="Primary">
        <BrandLockup variant="product" showOrgSubline to="/" />

        <div className="hidden md:flex items-center gap-6">
          <StatusChip />
          <a href="#how" className="link text-sm">How it works</a>
          <a href="#quickstart" className="link text-sm">Quickstart</a>
          <a href="#pricing" className="link text-sm">Pricing</a>
          <Link to="/docs" className="link text-sm">Docs</Link>
          <Link to="/login" className="link text-sm">Sign in</Link>
          <Link to="/dashboard" className="btn btn-primary btn-shine text-xs" style={{ padding: '0.45rem 1rem' }}>
            Open dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md md:hidden interactive"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'oklch(0 0 0 / 0.55)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col md:hidden"
              style={{ background: 'var(--color-bg-elevated)', borderLeft: '1px solid var(--color-border-subtle)' }}
              role="dialog"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span className="text-sm font-semibold">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} className="interactive p-1" aria-label="Close menu">
                  <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>
              <div className="flex flex-col gap-1 p-3">
                {[
                  { href: '#how', label: 'How it works' },
                  { href: '#features', label: 'Features' },
                  { href: '#pricing', label: 'Pricing' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm link"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.label}
                  </a>
                ))}
                <Link to="/docs" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Docs
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Sign in
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-primary mt-3 w-full">
                  Open dashboard
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Schema playground (signature) ───

const SCHEMAS = {
  product: {
    label: 'product',
    request: `{
  "url": "https://store.example.com/headphones",
  "schema": "product"
}`,
    response: `{
  "success": true,
  "data": {
    "name": "Studio Headphones Pro",
    "price": 249.99,
    "currency": "USD",
    "rating": 4.7,
    "in_stock": true
  },
  "latency_ms": 1842
}`,
  },
  article: {
    label: 'article',
    request: `{
  "url": "https://news.example.com/post/42",
  "schema": "article"
}`,
    response: `{
  "success": true,
  "data": {
    "title": "Shipping agents that scrape less",
    "author": "Maya Chen",
    "published_at": "2026-03-12",
    "topics": ["agents", "data"]
  },
  "latency_ms": 1621
}`,
  },
  company: {
    label: 'company',
    request: `{
  "url": "https://example.com/about",
  "schema": "company"
}`,
    response: `{
  "success": true,
  "data": {
    "name": "Nimbus Labs",
    "description": "Infrastructure for agent workflows",
    "location": "Remote",
    "founded": 2021
  },
  "latency_ms": 2014
}`,
  },
} as const;

type SchemaKey = keyof typeof SCHEMAS;

function SchemaPlayground() {
  const [schema, setSchema] = useState<SchemaKey>('product');
  const sample = SCHEMAS[schema];

  return (
    <div className="beam-border">
    <div className="code-block overflow-hidden shadow-[var(--shadow-lg)] relative z-[1]">
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}
      >
        <span className="text-eyebrow mr-2">POST /v1/extract</span>
        <div className="flex gap-1" role="tablist" aria-label="Schema type">
          {(Object.keys(SCHEMAS) as SchemaKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={schema === key}
              onClick={() => setSchema(key)}
              className="relative rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: schema === key ? 'var(--color-accent-subtle)' : 'transparent',
                color: schema === key ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)',
                border: `1px solid ${schema === key ? 'oklch(0.74 0.12 195 / 0.3)' : 'transparent'}`,
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-2">
          <span className="signal-dot" />
          <span className="badge badge-active">200</span>
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={schema}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: easeOut }}
          className="grid md:grid-cols-2"
        >
          <div className="p-4 md:border-r" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <p className="text-eyebrow mb-3">Request</p>
            <pre className="text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
              <code>{sample.request}</code>
            </pre>
          </div>
          <div className="p-4">
            <p className="text-eyebrow mb-3">Response</p>
            <pre className="text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
              <code>{sample.response}</code>
            </pre>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    </div>
  );
}

// ─── Live Stats Bar (social proof) ───

function LiveStatsBar() {
  const [stats, setStats] = useState<{uptime_hours: number; requests_served: number} | null>(null);
  useEffect(() => {
    fetch('/v1/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 -mt-4 mb-8" style={{ position: 'relative', zIndex: 1 }}>
      <div
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl px-5 py-3 text-xs"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span className="flex items-center gap-2">
          <span className="signal-dot signal-dot-ok" />
          API operational
        </span>
        {stats && (
          <>
            <span>{stats.uptime_hours.toFixed(1)}h uptime</span>
            <span>{stats.requests_served.toLocaleString()} requests handled</span>
          </>
        )}
        <a href="/health" className="link-accent" target="_blank" rel="noopener noreferrer">
          Status page →
        </a>
      </div>
    </section>
  );
}

// ─── Hero ───

function Hero() {
  return (
    <section id="start" className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-5 md:px-6 overflow-hidden">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-accent-base)',
                border: '1px solid oklch(0.74 0.12 195 / 0.25)',
              }}
            >
              <span className="signal-dot" />
              URL + schema → validated JSON
            </div>
            <h1 className="text-display-lg" style={{ color: 'var(--color-text-primary)' }}>
              Structured web data for AI agents.
            </h1>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Send a public page URL and a schema type. Get typed fields back:
              product, article, or company. No scraper farm to maintain.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/login" className="btn btn-primary btn-shine" style={{ padding: '0.75rem 1.5rem' }}>
                Sign in with GitHub
              </Link>
              <a href="/buy" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                Buy starter $1
              </a>
            </div>
            <p className="mt-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Free tier · 1,000 credits for $1 one-time · Email signup also available
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
            className="surface-glow"
          >
            <SchemaPlayground />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Quickstart (Stripe/Resend-style first call) ───

const CURL_SNIPPET = `curl -X POST https://agentapigw.dpdns.org/v1/extract \\
  -H "Authorization: Bearer sk-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/product","schema":"product"}'`;

function Quickstart() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(CURL_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  }

  return (
    <section id="quickstart" className="mx-auto max-w-6xl px-5 md:px-6 py-16 md:py-20">
      <Reveal>
        <SectionLabel>Quickstart</SectionLabel>
        <h2 className="text-display max-w-xl mb-3" style={{ color: 'var(--color-text-primary)' }}>
          First call in under a minute.
        </h2>
        <p className="text-sm max-w-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Create an account, mint a key in the dashboard, then hit <span className="text-mono text-xs">POST /v1/extract</span>.
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <ol className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { n: '1', t: 'Create account', d: 'GitHub, Google, or email. Free tier starts with 100 queries/month.' },
            { n: '2', t: 'Mint an API key', d: 'Dashboard → API Keys. Secrets are shown once; store them safely.' },
            { n: '3', t: 'Call /v1/extract', d: 'Pass a public URL and schema. Credits only move on success paths you use.' },
          ].map((s) => (
            <li key={s.n} className="surface surface-hover p-5 list-none">
              <span className="text-mono text-xs" style={{ color: 'var(--color-accent-base)' }}>{s.n}</span>
              <h3 className="mt-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{s.t}</h3>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{s.d}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="code-block overflow-hidden">
          <div
            className="flex items-center justify-between gap-3 px-4 py-2.5"
            style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}
          >
            <span className="flex items-center gap-2 text-eyebrow">
              <Terminal className="w-3.5 h-3.5" />
              cURL
            </span>
            <button
              type="button"
              onClick={copy}
              className={`btn btn-ghost text-xs ${copied ? 'copy-flash' : ''}`}
              style={{ padding: '0.25rem 0.6rem' }}
            >
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
            <code>{CURL_SNIPPET}</code>
          </pre>
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Full field maps and error codes live in the <Link to="/docs" className="link-accent">API docs</Link>.
        </p>
      </Reveal>
    </section>
  );
}

// ─── Trust strip (what good API products surface) ───

const trustItems = [
  { icon: Shield, title: 'SSRF-safe fetches', body: 'Private hosts, metadata endpoints, and credentialed URLs are blocked before scrape.' },
  { icon: Lock, title: 'Keys + rate limits', body: 'Bearer keys, per-key RPM caps, and monthly quotas by plan.' },
  { icon: Zap, title: 'Cache on success', body: 'Repeat lookups hit a short TTL so you do not pay twice for the same page.' },
  { icon: Layers, title: 'Schema-locked JSON', body: 'product, article, company. Stable shapes for agents to parse.' },
];

function TrustStrip() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-12 md:py-16">
      <Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="surface p-4"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Icon className="w-4 h-4 mb-3" style={{ color: 'var(--color-accent-base)' }} strokeWidth={1.75} />
                <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>{item.body}</p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

// ─── How it works ───

const steps = [
  { n: '01', title: 'Call the API', body: 'POST a URL and one of three schemas with your API key.' },
  { n: '02', title: 'We extract & validate', body: 'The page is read, structured against the schema, and checked before return.' },
  { n: '03', title: 'Cache & meter usage', body: 'Successful results are cached; credits and rate limits apply per plan.' },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>How it works</SectionLabel>
        <h2 className="text-display max-w-xl mb-12" style={{ color: 'var(--color-text-primary)' }}>
          Three steps from URL to usable fields.
        </h2>
      </Reveal>
      <ol className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <li className="surface surface-hover surface-glow p-6 h-full list-none">
              <span className="text-mono text-xs font-medium tabular-nums" style={{ color: 'var(--color-accent-base)' }}>
                {s.n}
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {s.body}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

// ─── Features ───

const features = [
  {
    icon: Layers,
    title: 'Built-in schemas',
    body: 'Product, article, and company out of the box. Fields stay consistent so agents can depend on shape.',
  },
  {
    icon: Zap,
    title: 'Smart cache',
    body: 'Successful extractions cache with a TTL. Repeat lookups skip the full pipeline when still fresh.',
  },
  {
    icon: Box,
    title: 'REST + MCP',
    body: 'Call via HTTPS with a bearer key, or wire the MCP server into agent tool-calling stacks.',
  },
  {
    icon: Shield,
    title: 'Keys & limits',
    body: 'Per-key rate limits, monthly quotas by tier, and signed Polar billing for paid plans.',
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Capabilities</SectionLabel>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-12">
          <h2 className="text-display" style={{ color: 'var(--color-text-primary)' }}>
            Built for agents that need fields, not HTML.
          </h2>
          <p className="text-sm leading-relaxed max-w-md lg:justify-self-end" style={{ color: 'var(--color-text-secondary)' }}>
            One extraction endpoint. You choose the schema; we return validated JSON and usage metadata.
          </p>
        </div>
      </Reveal>
      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="surface surface-hover surface-glow p-6 h-full">
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-md"
                  style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {f.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── Pricing ───

const plans = [
  {
    tier: 'Free',
    price: '$0',
    period: '',
    desc: 'Try the API and ship a prototype.',
    features: ['100 queries / month', 'Product & article schemas', '1-hour cache TTL', '1 API key', 'REST + MCP'],
    highlighted: false,
    cta: 'Create free account',
    href: '/dashboard',
    external: false,
  },
  {
    tier: 'Starter Pack',
    price: '$1',
    period: ' once',
    desc: 'One-time credits — no subscription.',
    features: ['1,000 extraction credits', 'All schemas', 'Instant checkout', 'No monthly commitment'],
    highlighted: true,
    cta: 'Buy for $1',
    href: '/buy',
    external: true,
  },
  {
    tier: 'Hobby',
    price: '$29',
    period: '/mo',
    desc: 'Solo builders and side projects.',
    features: ['5,000 queries / month', 'All schemas', '24h cache TTL', 'Usage analytics', 'Email support'],
    highlighted: false,
    cta: 'Subscribe',
    href: '/buy?sku=hobby',
    external: true,
  },
  {
    tier: 'Pro',
    price: '$99',
    period: '/mo',
    desc: 'Production agent workloads.',
    features: ['25,000 queries / month', 'Custom schema path*', '72h cache TTL', 'Team keys', 'Priority support'],
    highlighted: false,
    cta: 'Go Pro',
    href: '/buy?sku=pro',
    external: true,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="text-display max-w-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Start free. Buy credits when you need them.
        </h2>
        <p className="text-sm mb-12 max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Checkout runs on Polar. Starter is a one-time $1 pack; Hobby and Pro are monthly subscriptions.
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginTop: '-0.75rem', marginBottom: '1rem' }}>
          Also on{' '}
          <a href="https://shadowcraft41.gumroad.com/l/spwxix" target="_blank" rel="noopener noreferrer" className="link-accent">Gumroad ($1 Starter)</a>
          {' · '}
          <a href="https://shadowcraft41.gumroad.com/" target="_blank" rel="noopener noreferrer" className="link-accent">full shop</a>
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <Reveal key={plan.tier} delay={i * 0.05}>
          <div
            className="flex flex-col overflow-hidden h-full surface-hover"
            style={{
              background: plan.highlighted ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
              border: `1px solid ${plan.highlighted ? 'oklch(0.74 0.12 195 / 0.45)' : 'var(--color-border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: plan.highlighted ? 'var(--shadow-glow)' : undefined,
            }}
          >
            {plan.highlighted && (
              <div
                className="px-4 py-2 text-center text-[11px] font-semibold tracking-wide uppercase"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
              >
                Best first purchase
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{plan.tier}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className="font-display text-3xl font-bold tracking-tight tabular-nums"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>{plan.desc}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-accent-base)' }} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.external ? (
                <a href={plan.href} className={`btn mt-6 w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </a>
              ) : (
                <Link to={plan.href} className={`btn mt-6 w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </Link>
              )}
            </div>
          </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-[11px]" style={{ color: 'var(--color-text-disabled)' }}>
        * Custom schemas available on Pro; contact support for schema review.
      </p>
    </section>
  );
}

// ─── Final CTA ───

function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-16 md:py-20">
      <Reveal>
      <div
        className="relative overflow-hidden px-6 py-14 md:px-12 md:py-16 text-center surface-glow"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: 'radial-gradient(500px circle at 50% 0%, var(--color-accent-subtle), transparent 70%)' }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-display max-w-lg mx-auto" style={{ color: 'var(--color-text-primary)' }}>
            Ship structured data without a scraper farm.
          </h2>
          <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Create an account, mint a key, and call <span className="text-mono text-xs">/v1/extract</span>.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              Start free
            </Link>
            <Link to="/docs" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              Read the docs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ───

function Footer() {
  return (
    <footer className="relative z-10" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
      <div className="mx-auto max-w-6xl px-5 md:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <BrandLockup variant="org" markClassName="w-4 h-4" to="/" />
          <p className="mt-2 text-xs max-w-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Agent API Gateway — structured extraction for agents. Validated JSON from public pages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <Link to="/docs" className="link">Docs</Link>
          <Link to="/dashboard" className="link">Dashboard</Link>
          <a href="/buy" className="link">Pricing</a>
          <a href="/health" className="link">Status</a>
          <Link to="/privacy" className="link">Privacy</Link>
          <Link to="/terms" className="link">Terms</Link>
          <Link to="/aup" className="link">AUP</Link>
          <Link to="/docs#mcp" className="link">MCP</Link>
          <a href="mailto:support@agentapigw.dpdns.org" className="link">Support</a>
          <a
            href="https://github.com/ZachDreamZ/agent-api-gateway"
            className="link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <div
        className="mx-auto max-w-6xl px-5 md:px-6 pb-8 text-[11px]"
        style={{ color: 'var(--color-text-disabled)' }}
      >
        © {new Date().getFullYear()} NexusCore · Agent API Gateway · agentapigw.dpdns.org
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="default" />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <LiveStatsBar />
          <TrustStrip />
          <HowItWorks />
          <Quickstart />
          <Features />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
