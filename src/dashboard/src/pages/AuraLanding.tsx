import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Agent API Gateway — Landing Page (Hallmark · Workbench genre)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Logo Mark ───

function LogoMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// ─── Section Eyebrow ───

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent-base)' }} />
      <span className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Navbar (centered links pattern) ───

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border-subtle)' }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 link" style={{ color: 'var(--color-text-primary)' }}>
          <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
          <span className="text-sm font-semibold tracking-tight">AgentAPI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="link text-sm" style={{ color: 'var(--color-text-secondary)' }}>Features</a>
          <a href="#pricing" className="link text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pricing</a>
          <Link to="/docs" className="link text-sm" style={{ color: 'var(--color-text-secondary)' }}>Docs</Link>
          <Link to="/dashboard" className="btn btn-primary text-xs" style={{ padding: '0.5rem 1.25rem' }}>
            Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden interactive"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'oklch(0 0 0 / 0.6)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col md:hidden"
              style={{ background: 'var(--color-bg-elevated)', borderLeft: '1px solid var(--color-border-subtle)' }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Menu</span>
                <button onClick={() => setMobileOpen(false)} className="interactive" style={{ color: 'var(--color-text-secondary)' }} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 space-y-1 px-3 pt-3">
                <a href="#features" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Features
                </a>
                <a href="#pricing" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Pricing
                </a>
                <Link to="/docs" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Docs
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium" style={{ color: 'var(--color-accent-base)' }}>
                  Dashboard →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero (solid headline, no gradient) ───

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 text-center relative z-10">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] max-w-4xl mx-auto"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Your API.{' '}
        <span style={{ color: 'var(--color-accent-base)' }}>Revitalized.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-lg mx-auto text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        One endpoint for structured web data. AI agents send a URL and schema type,
        get clean JSON back. No parsing, no markdown — just the fields you need.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <Link to="/dashboard">
          <button className="btn btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
            Get Started Free
          </button>
        </Link>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>1,500 free queries/month · No credit card</span>
      </motion.div>
    </section>
  );
}

// ─── API Demo (replaces InboxMockup + MenuBar — no chrome) ───

function ApiDemo() {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="code-block overflow-hidden"
      >
        {/* Simple header bar — no traffic lights */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>API Playground</span>
          <div className="ml-auto flex gap-2">
            <span className="badge badge-active">200 OK</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-disabled)' }}>2.3s</span>
          </div>
        </div>

        {/* Side-by-side request/response */}
        <div className="grid md:grid-cols-2">
          {/* Request */}
          <div className="p-4" style={{ borderRight: '1px solid var(--color-border-subtle)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-tertiary)' }}>Request</p>
            <pre className="text-xs leading-relaxed text-mono" style={{ color: 'var(--color-text-secondary)' }}>
{`curl -X POST /v1/extract \\
  -H "Authorization: Bearer sk-..." \\
  -d '{
    "url": "https://store.example.com/...",
    "schema": "product"
  }'`}
            </pre>
          </div>

          {/* Response */}
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-tertiary)' }}>Response</p>
            <pre className="text-xs leading-relaxed text-mono" style={{ color: 'var(--color-text-secondary)' }}>
{`{
  "success": true,
  "data": {
    "name": "Studio Headphones Pro",
    "price": 249.99,
    "currency": "USD",
    "rating": 4.7,
    "in_stock": true,
    "variants": [
      "Matte Black",
      "Silver",
      "Midnight"
    ]
  },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 1499
  },
  "latency_ms": 2347
}`}
            </pre>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features ───

const featureList = [
  {
    label: 'Schemas',
    tag: '3 built-in',
    items: ['Product — name, price, rating, variants, availability', 'Article — title, author, date, topics, excerpt', 'Company — name, description, funding, location'],
  },
  {
    label: 'Smart Cache',
    tag: 'sub-10ms hits',
    items: ['24h default TTL on successful extractions', 'Auto-invalidation on schema version change', 'Zero-latency cache reads for repeat queries'],
  },
  {
    label: 'LLM Engine',
    tag: 'Gemini powered',
    items: ['Gemini-powered extraction and validation', 'Auto-retry with backoff on malformed responses', 'Schema-constrained output — no drift'],
  },
  {
    label: 'Integrations',
    tag: 'API + SDK + MCP',
    items: ['REST API with curl, Node.js SDK, Python SDK', 'MCP server for AI agent tool-calling', 'Bearer token auth with per-key rate limiting'],
  },
];

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
      <SectionEyebrow label="Capabilities" />
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.02] mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Extract any page in a single call.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Send a URL and a schema type. The LLM-powered engine reads every page,
            understands its structure, and returns validated JSON. No raw HTML,
            no markdown parsing — just the fields your agent needs.
          </p>
        </div>
        <div className="space-y-3">
          {featureList.map((feat) => (
            <div key={feat.label} className="surface surface-hover p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{feat.label}</span>
                <span className="badge badge-active">{feat.tag}</span>
              </div>
              <ul className="space-y-1">
                {feat.items.map((item) => (
                  <li key={item} className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Placeholder LogoCloud (truncated) ───

const logos = ['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion'];

function LogoCloud() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
      <p className="text-xs uppercase tracking-widest text-center" style={{ color: 'var(--color-text-tertiary)' }}>
        Used by engineering teams shipping structured data products
      </p>
      <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-6">
        {logos.map((name) => (
          <div
            key={name}
            className="text-sm font-bold tracking-tight text-center cursor-default"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ───

const testimonials = [
  {
    quote: 'We replaced three separate scraping scripts with a single API call. The structured output eliminated all our post-processing code.',
    name: 'Engineering Lead',
    role: 'AI Infrastructure',
  },
  {
    quote: 'The schema routing is what sold us. Product pages, articles, company profiles — one endpoint handles all of them correctly.',
    name: 'Senior Developer',
    role: 'Data Pipeline Team',
  },
  {
    quote: 'Cache hits in under 10ms on our repeat queries. Monday morning pipeline failures went from weekly to zero.',
    name: 'Platform Engineer',
    role: 'ML Platform',
  },
];

function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
      <SectionEyebrow label="From the field" />
      <div className="grid md:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <div key={i} className="surface p-6">
            <blockquote className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing (no noise filter, no watermark) ───

const plans = [
  {
    tier: 'Free',
    price: '$0',
    desc: 'For developers testing structured extraction.',
    features: [
      'Up to 1,500 queries / month',
      'Product & article schemas',
      'Basic cache (1h TTL)',
      '1 API key',
      'REST API + MCP access',
    ],
    highlighted: false,
  },
  {
    tier: 'Hobby',
    price: '$29',
    period: '/mo',
    desc: 'For solo builders and side projects.',
    features: [
      'Up to 5,000 queries / month',
      'All schemas (product, article, company)',
      'Smart cache (24h TTL)',
      'Usage analytics + metrics',
      'Email support',
    ],
    highlighted: false,
  },
  {
    tier: 'Pro',
    price: '$99',
    period: '/mo',
    desc: 'For production agent workloads.',
    features: [
      'Up to 25,000 queries / month',
      'Custom schema definitions',
      'Extended cache (72h TTL)',
      'Team API keys + RBAC',
      'Priority support + SLA',
    ],
    highlighted: true,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="max-w-5xl mx-auto px-6 py-24 relative z-10">
      <SectionEyebrow label="Pricing" />
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.02] mb-12" style={{ color: 'var(--color-text-primary)' }}>
        Start free, scale as you grow.
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className="surface-elevated flex flex-col overflow-hidden"
            style={{
              borderColor: plan.highlighted ? 'var(--color-accent-base)' : undefined,
            }}
          >
            {plan.highlighted && (
              <div className="px-4 py-2 text-xs font-semibold text-center" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}>
                Most Popular
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{plan.tier}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{plan.price}</span>
                {plan.period && <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{plan.period}</span>}
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{plan.desc}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-success)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard" className={`btn mt-6 w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.tier === 'Free' ? 'Get Started Free' : 'Upgrade'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ───

function FinalCTA() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 md:py-28 relative z-10">
      <div className="surface-elevated relative overflow-hidden px-8 py-16 md:py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(600px circle at 50% 0%, var(--color-accent-subtle), transparent 70%)',
            opacity: 0.4,
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.02]" style={{ color: 'var(--color-text-primary)' }}>
            Stop parsing HTML.
            <br />
            <span style={{ color: 'var(--color-accent-base)' }}>Just call the API.</span>
          </h2>
          <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Join thousands of developers who ship structured data products
            instead of writing and maintaining scraping pipelines.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/dashboard">
              <button className="btn btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Get Started Free
              </button>
            </Link>
            <Link to="/docs" className="btn btn-secondary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
              Read the docs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───

function Footer() {
  return (
    <footer className="relative z-10" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)' }}>
          <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
          <span className="text-xs font-semibold tracking-wider uppercase">Agent API</span>
        </div>
        <div className="flex items-center gap-5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <Link to="/docs" className="link">Docs</Link>
          <Link to="/dashboard" className="link">Dashboard</Link>
          <a href="https://github.com/ZachDreamZ/agent-api-gateway" className="link" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="text-[10px]" style={{ color: 'var(--color-text-disabled)' }}>© 2026 Agent API</span>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════

export default function Landing() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >

      <Navbar />
      <Hero />
      <ApiDemo />
      <Features />
      <LogoCloud />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
