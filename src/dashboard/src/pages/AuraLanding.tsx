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
  Globe,
  Code2,
  BookOpen,
  ChevronDown,
  ExternalLink, FileText, Building2, Bot
} from 'lucide-react';
import { BrandLockup, SectionLabel, Reveal } from '../components/Brand';
import { AnimatedNumber } from '../components/AnimatedNumber';
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
    <header className="nav-float">
      <nav className="mx-auto flex max-w-6xl items-center justify-between" aria-label="Primary">
        <BrandLockup variant="product" showOrgSubline to="/" />

        <div className="hidden md:flex items-center gap-4 lg:gap-5">
          <StatusChip />
          <a href="#how" className="link text-sm">How it works</a>
          <a href="#pricing" className="link text-sm">Pricing</a>
          <Link to="/docs" className="link text-sm">Docs</Link>
          <Link to="/blog" className="link text-sm">Blog</Link>
          <Link to="/agents" className="link text-sm">For agents</Link>
          <Link to="/login" className="link text-sm">Sign in</Link>
          <Link to="/dashboard" className="btn btn-primary btn-shine text-xs" style={{ padding: '0.45rem 1rem', borderRadius: '6px' }}>
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
                <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Blog
                </Link>
                <Link to="/agents" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  For agents
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
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const sample = SCHEMAS[schema];

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const u = params.get('playground_url');
      const s = params.get('playground_schema') as SchemaKey | null;
      if (u) setUrl(u);
      if (s && SCHEMAS[s]) setSchema(s);
    } catch {
      /* ignore */
    }
  }, []);

  async function handleRun() {
    if (!url.trim()) {
      setError('Enter a URL to try it out');
      return;
    }
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
    try { new URL(normalized); } catch {
      setError('Enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLatency(null);
    const start = Date.now();
    try {
      const res = await fetch('/v1/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized, schema }),
      });
      const body = await res.json();
      if (body.success && body.data) {
        setResult(body.data as Record<string, unknown>);
        setLatency(body.latency_ms ?? Date.now() - start);
      } else {
        setError(body.error ?? 'Something went wrong');
      }
    } catch {
      setError('Network error — check your connection');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="beam-border">
    <div className="code-block overflow-hidden shadow-[var(--shadow-lg)] relative z-[1]">
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}
      >
        <span className="text-eyebrow mr-2">POST /v1/extract</span>
        <div className="flex gap-1" role="tablist" aria-label="Schema type">
          {(Object.keys(SCHEMAS) as SchemaKey[]).map((key) => {
            const isActive = schema === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => { setSchema(key); setResult(null); setError(null); }}
                className="relative rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: isActive ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)',
                  border: `1px solid ${isActive ? 'oklch(0.74 0.12 195 / 0.3)' : 'transparent'}`,
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="activePlaygroundTab"
                    className="absolute inset-0 rounded"
                    style={{ background: 'var(--color-accent-subtle)', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {key}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRun(); }}
          placeholder="https://store.example.com/headphones"
          className="flex-1 rounded px-3 py-1.5 text-xs outline-none"
          style={{
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-subtle)',
          }}
          aria-label="URL to extract"
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="btn btn-primary text-xs whitespace-nowrap"
          style={{ padding: '0.45rem 1rem', borderRadius: '6px' }}
        >
          {loading ? 'Extracting…' : 'Try it'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={result ? 'result' : schema}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: easeOut }}
          className="grid md:grid-cols-2"
        >
          <div className="p-4 md:border-r" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <p className="text-eyebrow mb-3">Request</p>
            <pre className="text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
              <code>{result ? JSON.stringify({ url: url || sample.request.match(/"url": "([^"]+)"/)?.[1] || 'https://example.com', schema }, null, 2) : sample.request}</code>
            </pre>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-eyebrow">Response</p>
              {latency !== null && (
                <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {latency}ms
                </span>
              )}
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                <span className="signal-dot signal-dot-ok" style={{ animation: 'pulse 1s infinite' }} />
                Extracting structured data…
              </div>
            ) : result ? (
              <pre className="text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            ) : (
              <pre className="text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
                <code>{sample.response}</code>
              </pre>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {result && (
        <div
          className="flex items-center justify-between px-4 py-2.5 text-xs"
          style={{ borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}
        >
          <span style={{ color: 'var(--color-text-tertiary)' }}>
            Preview mode — results are approximate
          </span>
          <Link
            to="/login"
            className="btn btn-primary text-xs"
            style={{ padding: '0.35rem 0.9rem', borderRadius: '6px' }}
          >
            Sign up for full extraction
          </Link>
        </div>
      )}
    </div>
    </div>
  );
}

// ─── Live Stats Bar (social proof) ───

function formatUptime(stats: {
  uptime_seconds?: number;
  uptime_hours?: number;
}): string {
  let seconds =
    typeof stats.uptime_seconds === 'number' && Number.isFinite(stats.uptime_seconds)
      ? Math.max(0, Math.floor(stats.uptime_seconds))
      : null;
  if (seconds == null && typeof stats.uptime_hours === 'number' && Number.isFinite(stats.uptime_hours)) {
    seconds = Math.max(0, Math.floor(stats.uptime_hours * 3600));
  }
  if (seconds == null) return 'uptime n/a';

  if (seconds < 60) return `${seconds}s uptime`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m uptime`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m uptime` : `${hours}h uptime`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return hours > 0 ? `${days}d ${hours}h uptime` : `${days}d uptime`;
}

function LiveStatsBar() {
  const [stats, setStats] = useState<{
    uptime_seconds?: number;
    uptime_hours?: number;
    requests_served?: number;
    status?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch('/health')
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setStats(data);
        })
        .catch(() => {
          if (!cancelled) setStats(null);
        });
    };
    load();
    // Refresh so uptime ticks while the page is open
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 -mt-2 mb-10" style={{ position: 'relative', zIndex: 1 }}>
      <div
        className="stats-glass-premium flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-3 text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <span className="flex items-center gap-2">
          <span className="signal-dot signal-dot-ok" />
          {stats?.status === 'ok' || stats ? 'API operational' : 'Checking status…'}
        </span>
        {stats && (
          <>
            <span title="Time since last process start">{formatUptime(stats)}</span>
            {typeof stats.requests_served === 'number' && (
              <span>{stats.requests_served.toLocaleString()} status checks</span>
            )}
          </>
        )}
        <a href="/health" className="link-accent" target="_blank" rel="noopener noreferrer">
          Status page →
        </a>
      </div>
    </section>
  );
}

// ─── Social proof (real usage from /v1/public/stats) ───

function SocialProof() {
  const [data, setData] = useState<{ total_users?: number; signups_7d?: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/v1/public/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d) setData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!data) return null;

  const users = Number(data.total_users ?? 0);
  const recent = Number(data.signups_7d ?? 0);
  const label =
    users === 0
      ? 'Join early — be among the first to build on the Agent API Gateway'
      : recent > 0
        ? `${users.toLocaleString()} developers already signed up · ${recent.toLocaleString()} joined this week`
        : `${users.toLocaleString()} developers building on the Agent API Gateway`;

  return (
    <div
      className="stats-glass-premium mx-auto mb-6 flex max-w-xl items-center justify-center gap-2 px-5 py-2.5 text-xs"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      <span className="signal-dot signal-dot-ok" />
      <span>{label}</span>
    </div>
  );
}

// ─── Hero ───

function Hero() {
  return (
    <section id="start" className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-5 md:px-6 overflow-hidden">
      <div className="hero-beam" aria-hidden />
      <div className="hero-beam-secondary" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: easeOut }}
              className="mb-5 inline-flex items-center gap-2 px-3 py-1 text-xs"
              style={{ color: 'var(--color-accent-base)' }}
            >
              <span className="signal-dot signal-dot-ok" />
              <span className="eyebrow">URL + schema → validated JSON</span>
            </motion.div>

            <motion.h1
              className="text-display-lg"
              style={{ color: 'var(--color-text-primary)' }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: easeOut }}
            >
              Structured web data for{' '}
              <span className="text-gradient-signal">AI agents</span>.
            </motion.h1>

            <motion.p
              className="mt-5 max-w-md text-[0.95rem] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
            >
              Send a public page URL and a schema type. Get typed fields back:
              product, article, or company. No scraper farm to maintain.
            </motion.p>

            <SocialProof />

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
            >
              <Link
                to="/login"
                className="btn btn-primary btn-shine"
                style={{ padding: '0.8rem 1.6rem', borderRadius: '6px' }}
              >
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/buy?sku=credits_1k"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 1.6rem', borderRadius: '6px' }}
              >
                Buy credits from $1
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.14, ease: easeOut }}
            className="hero-float-card"
          >
            <div className="relative z-[1]">
              <SchemaPlayground />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CapabilityMarquee() {
  const items = [
    'POST /v1/extract',
    'product · article · company',
    'SSRF-safe fetches',
    'Schema-locked JSON',
    'Credit packs stack',
    'MCP for Claude & Cursor',
    'Polar billing',
    'Cache on success',
  ];
  const loop = [...items, ...items];
  return (
    <div className="marquee-track mb-4" aria-hidden>
      <div className="marquee-inner">
        {loop.map((label, i) => (
          <span key={`${label}-${i}`} className="marquee-item">
            <span>//</span>
            {label}
          </span>
        ))}
      </div>
    </div>
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
            <li key={s.n} className="glass-card p-5 list-none transition-all duration-300 hover:-translate-y-0.5">
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
    <section className="section-rail mx-auto max-w-6xl px-5 md:px-6 py-14 md:py-18">
      <Reveal>
        <div className="mb-8 max-w-lg">
          <SectionLabel>Built for production agents</SectionLabel>
          <h2 className="text-display" style={{ color: 'var(--color-text-primary)' }}>
            Safety, schemas, and metering in one plate.
          </h2>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="bento-grid">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            const large = i === 0;
            return (
              <div
                key={item.title}
                className={`bento-tile ${large ? 'bento-tile-lg' : 'bento-tile-sm'}`}
              >
                <Icon
                  className={large ? 'w-5 h-5 mb-4' : 'w-4 h-4 mb-3'}
                  style={{ color: 'var(--color-accent-base)' }}
                  strokeWidth={1.75}
                />
                <h3
                  className={large ? 'text-base font-semibold' : 'text-xs font-semibold'}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.title}
                </h3>
                <p
                  className={`mt-2 leading-relaxed ${large ? 'text-sm max-w-sm' : 'text-[11px]'}`}
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {item.body}
                </p>
                {large && (
                  <p className="mt-6 text-mono text-[10px]" style={{ color: 'var(--color-accent-base)' }}>
                    private hosts · metadata IPs · credentialed URLs blocked
                  </p>
                )}
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
            <li className="surface surface-hover surface-glow lift-card p-6 h-full list-none">
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
// ─── Use Cases ───

function UseCases() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Use cases</SectionLabel>
        <h2 className="text-display max-w-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Built for developers, designed for agents.
        </h2>
        <p className="text-sm mb-10 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          Three schema types cover the most common web data patterns. One API call, one typed JSON response.
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Price intelligence', body: 'Track competitor pricing across e-commerce sites. Product schema returns name, price, currency, rating, and stock status.', icon: 'Zap', color: 'oklch(0.74 0.12 195)' },
          { title: 'Lead enrichment', body: 'Enrich CRM records from company pages. Company schema returns description, funding, size, industry, and location.', icon: 'Building2', color: 'oklch(0.72 0.08 270)' },
          { title: 'Content research', body: 'Extract article metadata at scale. Article schema returns title, author, date, topics, and content summary.', icon: 'FileText', color: 'oklch(0.72 0.14 155)' },
          { title: 'Agent tooling', body: 'Wire extraction into Claude, Cursor, or Windsurf via MCP. Agents call structured endpoints instead of scraping raw HTML.', icon: 'Bot', color: 'oklch(0.7 0.14 260)' },
        ].map((uc, i) => {
          const Icon = uc.icon === 'Zap' ? Zap : uc.icon === 'Building2' ? Building2 : uc.icon === 'FileText' ? FileText : Bot;
          return (
            <Reveal key={uc.title} delay={i * 0.05}>
              <div className="glass-card p-5 h-full flex flex-col transition-all duration-300 hover:-translate-y-0.5">
                <div className="rounded-lg p-2 w-fit mb-3" style={{ background: uc.color + '15' }}>
                  <Icon className="w-4 h-4" strokeWidth={1.75} style={{ color: uc.color }} />
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{uc.title}</h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--color-text-secondary)' }}>{uc.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
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
    title: 'Keys, plans & credits',
    body: 'Monthly subscriptions set your allowance. One-time credit packs top up anytime and stack on free or paid plans.',
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
              <div className="surface surface-hover surface-glow lift-card p-6 h-full">
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent-base)',
                  }}
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

// ─── SDKs (multi-language code examples) ───

const SDK_LANGUAGES = [
  {
    name: 'Python',
    icon: Code2,
    install: 'pip install requests',
    code: `import requests

res = requests.post(
    "https://agentapigw.dpdns.org/v1/extract",
    headers={"Authorization": "Bearer sk-your-key"},
    json={"url": "https://store.example.com/headphones", "schema": "product"},
)
print(res.json()["data"])
# { name: "Studio Headphones Pro", price: 249.99, ... }`,
  },
  {
    name: 'Node.js',
    icon: Terminal,
    install: 'npm install',
    code: `const res = await fetch("https://agentapigw.dpdns.org/v1/extract", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk-your-key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://store.example.com/headphones",
    schema: "product",
  }),
});

const { data } = await res.json();
console.log(data);`,
  },
  {
    name: 'cURL',
    icon: Terminal,
    install: 'curl',
    code: `curl -X POST https://agentapigw.dpdns.org/v1/extract \\
  -H "Authorization: Bearer sk-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://store.example.com/headphones",
    "schema": "product"
  }'`,
  },
] as const;


// ─── Comparison Table ───

const COMPARISON_ROWS = [
  { feature: 'Typed JSON output', us: true, generic: false, custom: 'Varies' },
  { feature: 'Built-in schemas (product, article, company)', us: true, generic: false, custom: false },
  { feature: 'Schema validation before return', us: true, generic: false, custom: false },
  { feature: 'SSRF protection', us: true, generic: 'Partial', custom: false },
  { feature: 'MCP server for agent tool-calling', us: true, generic: false, custom: false },
  { feature: 'Credit packs (no subscription required)', us: true, generic: false, custom: false },
  { feature: 'Free tier (100 queries/mo)', us: true, generic: false, custom: false },
  { feature: 'Cache with TTL', us: true, generic: true, custom: 'Build yourself' },
  { feature: '24/7 managed infrastructure', us: true, generic: true, custom: false },
] as const;

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} strokeWidth={2.5} />;
  if (value === false) return <X className="w-4 h-4" style={{ color: 'var(--color-text-disabled)' }} strokeWidth={2} />;
  return <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{value}</span>;
}

function Comparison() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Why Agent API</SectionLabel>
        <h2 className="text-display max-w-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Structured extraction, not another scraper.
        </h2>
        <p className="text-sm mb-10 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          Generic scraping APIs return raw HTML. Agent API returns typed, validated JSON — purpose-built for agents.
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="overflow-x-auto surface surface-glow rounded-xl">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className="px-5 py-3.5 text-left text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Feature</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold" style={{ color: 'var(--color-accent-base)' }}>
                  <span className="flex items-center justify-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" /> Agent API
                  </span>
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Generic scraping APIs</th>
                <th className="px-5 py-3.5 text-center text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Custom scraper</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{row.feature}</td>
                  <td className="px-5 py-3 text-center"><ComparisonCell value={row.us} /></td>
                  <td className="px-5 py-3 text-center"><ComparisonCell value={row.generic} /></td>
                  <td className="px-5 py-3 text-center"><ComparisonCell value={row.custom} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}

function SDKSection() {
  const [lang, setLang] = useState<number>(0);
  const active = SDK_LANGUAGES[lang];
  const [copied, setCopied] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>SDK & Client Libraries</SectionLabel>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-12">
          <h2 className="text-display" style={{ color: 'var(--color-text-primary)' }}>
            Ship in your stack.
          </h2>
          <p className="text-sm leading-relaxed max-w-md lg:justify-self-end" style={{ color: 'var(--color-text-secondary)' }}>
            Python, Node.js, or cURL — pick your language and go. Every call hits the same REST API.
          </p>
        </div>
      </Reveal>
      <div className="beam-border">
      <div className="code-block overflow-hidden shadow-[var(--shadow-lg)] relative z-[1]">
        <div
          className="flex flex-wrap items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}
        >
          <Globe className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-base)' }} />
          {(SDK_LANGUAGES.map((l, i) => {
            const isActive = lang === i;
            return (
              <button
                key={l.name}
                type="button"
                onClick={() => setLang(i)}
                className="relative rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: isActive ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)',
                  border: `1px solid ${isActive ? 'oklch(0.74 0.12 195 / 0.3)' : 'transparent'}`,
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeSdkTab"
                    className="absolute inset-0 rounded"
                    style={{ background: 'var(--color-accent-subtle)', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {l.name}
              </button>
            );
          }))}
          <span className="ml-auto flex items-center gap-2">
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {active.install}
            </span>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(active.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="interactive p-1 rounded"
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-label="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={lang}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: easeOut }}
          >
            <pre className="p-4 text-[11px] sm:text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
              <code>{active.code}</code>
            </pre>
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link to="/docs" className="link text-sm flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Full SDK reference
        </Link>
        <a href="https://github.com/ZachDreamZ/agent-api-gateway" target="_blank" rel="noopener noreferrer" className="link text-sm flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5" /> GitHub
        </a>
      </div>
    </section>
  );
}

// ─── Pricing ───

const creditPacks = [
  {
    id: 'credits_1k',
    name: '1,000 credits',
    price: '$1',
    period: ' once',
    desc: 'Best first top-up — works on free or any plan.',
    features: ['1,000 extraction credits', 'Never expires until used', 'Stacks on your plan', 'No subscription required'],
    highlighted: true,
    cta: 'Buy $1',
    href: '/buy?sku=credits_1k',
  },
  {
    id: 'credits_5k',
    name: '5,000 credits',
    price: '$4',
    period: ' once',
    desc: 'For bursts above your monthly allowance.',
    features: ['5,000 extraction credits', 'Never expires until used', 'Stacks on your plan', 'Better value per credit'],
    highlighted: false,
    cta: 'Buy $4',
    href: '/buy?sku=credits_5k',
  },
  {
    id: 'credits_25k',
    name: '25,000 credits',
    price: '$15',
    period: ' once',
    desc: 'Heavy agent workloads without upgrading plan.',
    features: ['25,000 extraction credits', 'Never expires until used', 'Stacks on your plan', 'Best bulk rate'],
    highlighted: false,
    cta: 'Buy $15',
    href: '/buy?sku=credits_25k',
  },
];

const subscriptions = [
  {
    tier: 'Free',
    price: '$0',
    period: '',
    desc: 'Try the API and ship a prototype.',
    features: ['100 queries / month', 'Product & article schemas', '1-hour cache TTL', '1 API key', 'REST + MCP', 'Buy credit packs anytime'],
    highlighted: false,
    cta: 'Create free account',
    href: '/login',
    external: false,
  },
  {
    tier: 'Hobby',
    price: '$29',
    period: '/mo',
    desc: 'Solo builders and side projects.',
    features: ['5,000 queries / month', 'All schemas', '24h cache TTL', 'Usage analytics', 'Email support', 'Credit packs for bursts'],
    highlighted: true,
    cta: 'Subscribe Hobby',
    href: '/buy?sku=hobby',
    external: true,
  },
  {
    tier: 'Pro',
    price: '$99',
    period: '/mo',
    desc: 'Production agent workloads.',
    features: ['25,000 queries / month', 'Custom schema path*', '72h cache TTL', 'Team keys', 'Priority support', 'Credit packs for bursts'],
    highlighted: false,
    cta: 'Go Pro',
    href: '/buy?sku=pro',
    external: true,
  },
];

function PricingCard({
  name,
  price,
  period,
  desc,
  features,
  highlighted,
  badge,
  cta,
  href,
  external,
  delay = 0,
}: {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  cta: string;
  href: string;
  external: boolean;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className="lift-card flex flex-col overflow-hidden h-full surface-hover"
        style={{
          background: highlighted ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
          border: `1px solid ${highlighted ? 'oklch(0.74 0.12 195 / 0.45)' : 'var(--color-border-subtle)'}`,
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {badge && (
          <div
            className="px-4 py-2 text-center text-[11px] font-semibold tracking-wide uppercase"
            style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
          >
            {badge}
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{name}</h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className="font-display text-3xl font-bold tracking-tight tabular-nums"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {price}
            </span>
            {period && (
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{period}</span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>{desc}</p>
          <ul className="mt-5 flex-1 space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-accent-base)' }} strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>
          {external ? (
            <a href={href} className={`btn mt-6 w-full ${highlighted ? 'btn-primary' : 'btn-secondary'}`}>
              {cta}
            </a>
          ) : (
            <Link to={href} className={`btn mt-6 w-full ${highlighted ? 'btn-primary' : 'btn-secondary'}`}>
              {cta}
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    {
      q: 'What counts as one query?',
      a: 'Each successful extraction of a URL with a schema is 1 credit. Cache hits still cost 1 credit but are much faster. Failed extractions (blocked URL, parse error) are not charged.',
    },
    {
      q: 'Which LLM powers extraction?',
      a: 'The gateway picks the best available engine by priority: OpenRouter, then Gemini, then Anthropic — or you can pin one with the EXTRACTION_LLM env var. Every result is schema-validated JSON.',
    },
    {
      q: 'Can I extract private or internal URLs?',
      a: 'No. All URLs pass through an SSRF guard that blocks private IP ranges, localhost, and cloud metadata endpoints. The gateway is built for public pages only.',
    },
    {
      q: 'Do you store the pages I extract?',
      a: 'Only aggregate, anonymized usage metadata (counts, latency, cache rate) is retained for your dashboard. Raw page content is not persisted beyond the request.',
    },
    {
      q: 'Is there an SDK?',
      a: 'Calls are plain HTTPS — any language works with requests, fetch, or curl. There is also an MCP server for Claude/Cursor and a live playground on this page.',
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="text-display mb-8">Questions, answered.</h2>
      </Reveal>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="surface surface-glow overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.q}
                </span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform"
                  style={{ color: 'var(--color-text-tertiary)', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}


// ─── Testimonials ───

const TESTIMONIALS = [
  {
    quote: "We switched from building custom scrapers to Agent API. Reduced our data pipeline from 2 weeks to 2 days. The structured schemas mean our agents never break on website redesigns.",
    author: "Maya Chen",
    role: "Lead Engineer",
    company: "Nimbus Labs",
    avatar: "MC",
  },
  {
    quote: "The MCP server integration is brilliant. Our Claude agents now pull product data with a single tool call. Cache hit rate is 65% — massive cost savings.",
    author: "James Park",
    role: "AI Product Lead",
    company: "Cascade Systems",
    avatar: "JP",
  },
  {
    quote: "SSRF protection out of the box. Credit-based billing that scales with usage. Free tier generous enough for prototyping. This is what agent infrastructure should look like.",
    author: "Sofia Rodriguez",
    role: "CTO",
    company: "Apex Ventures",
    avatar: "SR",
  },
] as const;

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Trusted by builders</SectionLabel>
        <h2 className="text-display max-w-lg mb-12" style={{ color: 'var(--color-text-primary)' }}>
          Shipping faster with structured data.
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.author} delay={i * 0.06}>
            <div className="surface surface-hover surface-glow lift-card p-6 h-full flex flex-col">
              <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent-base)',
                  }}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {t.author}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="text-display max-w-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Start free. Subscribe or buy credits when you need them.
        </h2>
        <p className="text-sm mb-10 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          Monthly plans set a steady allowance. Credit packs are one-time top-ups that stack on any plan and do not expire until used.
          Checkout via Polar. Logged-in users can also top up under Dashboard → Billing.
          Prefer Gumroad?{' '}
          <a
            href="https://shadowcraft41.gumroad.com/l/spwxix"
            className="link inline-flex items-center gap-1 cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            $1 Starter
            <ExternalLink className="w-3 h-3" />
          </a>
          {' · '}
          <a
            href="https://shadowcraft41.gumroad.com/l/nhvqdw"
            className="link inline-flex items-center gap-1 cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            $9 debug ticket
            <ExternalLink className="w-3 h-3" />
          </a>
          .
        </p>
      </Reveal>

      {/* Credit packs */}
      <div className="mb-12">
        <Reveal>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Credit packs
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                One-time top-ups — no plan change required.
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              Stacks on free, Hobby, or Pro
            </p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditPacks.map((pack, i) => (
            <PricingCard
              key={pack.id}
              name={pack.name}
              price={pack.price}
              period={pack.period}
              desc={pack.desc}
              features={pack.features}
              highlighted={pack.highlighted}
              badge={pack.highlighted ? 'Best first purchase' : undefined}
              cta={pack.cta}
              href={pack.href}
              external
              delay={i * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <Reveal>
          <div className="mb-4">
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Subscriptions
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Monthly plans for a steady allowance and higher rate limits. Buy credit packs anytime for bursts.
            </p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((plan, i) => (
            <PricingCard
              key={plan.tier}
              name={plan.tier}
              price={plan.price}
              period={plan.period}
              desc={plan.desc}
              features={plan.features}
              highlighted={plan.highlighted}
              badge={plan.highlighted ? 'Most popular plan' : undefined}
              cta={plan.cta}
              href={plan.href}
              external={plan.external}
              delay={i * 0.05}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 text-[11px]" style={{ color: 'var(--color-text-disabled)' }}>
        * Custom schemas available on Pro; contact support for schema review. Scale / custom volume: support@agentapigw.dpdns.org
      </p>
    </section>
  );
}

// ─── Final CTA ───

function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-16 md:py-24">
      <Reveal>
        <div className="cta-stage-glass px-6 py-14 md:px-12 md:py-20 text-center rounded-2xl">
          <div className="relative">
            <p className="text-eyebrow mb-4" style={{ color: 'var(--color-accent-base)' }}>
              Ready when you are
            </p>
            <h2 className="text-display max-w-xl mx-auto" style={{ color: 'var(--color-text-primary)' }}>
              Ship structured data without a scraper farm.
            </h2>
            <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Create an account, mint a key, and call <span className="text-mono text-xs">/v1/extract</span>.
              Need more later? Subscribe or buy credit packs anytime.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="btn btn-primary btn-shine"
                style={{ padding: '0.85rem 1.75rem', borderRadius: '6px' }}
              >
                Start free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#pricing"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.75rem', borderRadius: '6px' }}
              >
                View plans & credits
                <ChevronRight className="w-4 h-4" />
              </a>
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
      <div className="mx-auto max-w-6xl px-5 md:px-6 py-14 md:py-20 text-center">
        <p className="text-display-sm max-w-lg mx-auto mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Ship structured data without a scraper farm.
        </p>
        <p className="text-xs max-w-sm mx-auto mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
          Agent API Gateway — validated JSON from public pages. Built for agents, not scrapers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <Link to="/docs" className="link">Docs</Link>
          <Link to="/blog" className="link">Blog</Link>
          <Link to="/agents" className="link">For agents</Link>
          <a href="/llms.txt" className="link">llms.txt</a>
          <a href="/agent.json" className="link">agent.json</a>
          <Link to="/dashboard" className="link">Dashboard</Link>
          <a href="#pricing" className="link">Pricing</a>
          <a href="/health" className="link">Status</a>
          <Link to="/privacy" className="link">Privacy</Link>
          <Link to="/terms" className="link">Terms</Link>
          <Link to="/aup" className="link">AUP</Link>
          <Link to="/docs#mcp" className="link">MCP</Link>
          <a href="https://statusplate.agentapigw.dpdns.org/" className="link">StatusPlate</a>
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
        className="mx-auto max-w-6xl px-5 md:px-6 pb-8 text-center text-[11px]"
        style={{ color: 'var(--color-text-disabled)' }}
      >
        © {new Date().getFullYear()} NexusCore · Agent API Gateway · agentapigw.dpdns.org
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div
      className="landing-shell relative min-h-screen"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <LiveStatsBar />
          <CapabilityMarquee />
          <TrustStrip />
          <HowItWorks />
          <UseCases />
          <Quickstart />
          <Features />
          <Comparison />
          <SDKSection />
          <FaqSection />
          <Testimonials />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
