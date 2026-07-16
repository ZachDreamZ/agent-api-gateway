import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Copy, Check, BookOpen } from 'lucide-react';
import { LogoMark, AmbientBg, SectionLabel } from '../components/Brand';
import { easeOut } from '../lib/motion';

// ─── Copy Button ───

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`btn ${copied ? 'btn-primary' : 'btn-ghost'}`}
      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', gap: '0.25rem' }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

// ─── Code Block ───

function Code({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="group my-3 overflow-hidden rounded-xl code-block">
      {lang && (
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{lang}</span>
          <CopyButton text={children} />
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code style={{ color: 'var(--color-text-secondary)' }}>{children}</code>
      </pre>
    </div>
  );
}

// ─── Section ───

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      id={id}
      className="mb-12 scroll-mt-20"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h2 className="font-display mb-4 text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-base font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{title}</h3>
      {children}
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>;
}

// ─── Sidebar ───

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'auth', label: 'Authentication' },
  { id: 'schemas', label: 'Extraction Schemas' },
  { id: 'extract', label: 'POST /v1/extract' },
  { id: 'usage', label: 'GET /v1/usage' },
  { id: 'pricing', label: 'GET /v1/pricing' },
  { id: 'examples', label: 'Examples' },
  { id: 'errors', label: 'Error Handling' },
  { id: 'limits', label: 'Rate Limits & Quotas' },
];

function DocsSidebar({ activeSection, onNavigate }: { activeSection: string; onNavigate?: () => void }) {
  return (
    <aside className="sidebar-panel flex h-full w-60 flex-col">
      <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-4" onClick={onNavigate}>
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Agent API
        </span>
      </Link>
      <p className="px-5 pb-2 text-eyebrow">Docs</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Documentation">
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={onNavigate}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
            >
              {s.label}
            </a>
          );
        })}
      </nav>
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <Link to="/dashboard" className="flex items-center gap-2 text-xs link" style={{ color: 'var(--color-text-tertiary)' }} onClick={onNavigate}>
          ← Dashboard
        </Link>
      </div>
    </aside>
  );
}

// ─── Mobile Header ───

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="glass-nav fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 lg:hidden">
      <Link to="/" className="flex items-center gap-2">
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Docs</span>
      </Link>
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg interactive"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Mobile Sidebar Overlay ───

function MobileSidebar({ open, onClose, activeSection }: { open: boolean; onClose: () => void; activeSection: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: 'oklch(0 0 0 / 0.6)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <DocsSidebar activeSection={activeSection} onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Copy Docs as .md ───

function DocsCopyMdButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const md = generateDocsMd();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost"
      style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem', whiteSpace: 'nowrap' }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
      {copied ? 'Copied as .md' : 'Copy as .md'}
    </button>
  );

  function generateDocsMd(): string {
    return `# AgentAPI — API Reference

Extract structured web data with one API call.

**Base URL:** \`https://agent-api-gateway.onrender.com\`

---

## Overview

AgentAPI extracts structured data from any public URL. Send a URL and a schema type, receive clean JSON. Designed for AI agents — no markdown parsing, no raw HTML.

**Pricing model:** Credit-based. Each successful extraction deducts 1 credit. Failed extractions do not count against your quota. Cached hits are free.

---

## Authentication

Two authentication methods are supported. Both use the \`Authorization\` header.

### API Key (recommended for automated use)

\`\`\`
Authorization: Bearer sk-your-api-key
\`\`\`

Create and manage API keys from the Dashboard → API Keys. API keys are persistent and ideal for server-side integration.

### Session Token (for dashboard use)

\`\`\`
Authorization: Bearer your-session-token
\`\`\`

Sign in to the dashboard to obtain a session token. Tokens expire after 7 days. Use API keys for production integrations.

---

## Extraction Schemas

Each schema returns a structured JSON object matching the page type. Fields are nullable — if a field cannot be extracted, it returns \`null\`.

| Schema | Core Fields | Use Case |
|--------|-------------|----------|
| \`product\` | name, price, currency, description, availability, specs, image_url, rating, variants | E-commerce product pages |
| \`article\` | title, author, date, reading_time, excerpt, content_summary, topics, image_url | Blogs, news articles, documentation |
| \`company\` | name, description, founded_year, size_range, funding_total, industry, location, competitors | Company pages, Crunchbase, LinkedIn profiles |

---

## POST /v1/extract

Extract structured data from any public URL. Returns the schema-matched fields plus usage metadata.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`url\` | string | Yes | Public URL to extract data from |
| \`schema\` | string | Yes | One of: \`product\`, \`article\`, \`company\` |
| \`options.wait_for\` | string | No | CSS selector to wait for before extracting |
| \`options.country\` | string | No | ISO country code for geo-targeted content |
| \`options.extract_raw\` | boolean | No | Include raw extracted text alongside structured output |

### Response — 200 OK

\`\`\`json
{
  "success": true,
  "data": { },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 1499
  },
  "cached": false,
  "latency_ms": 4231
}
\`\`\`

---

## GET /v1/usage

Check your current plan tier, credits used, and remaining quota for the current billing period.

\`\`\`json
{
  "tier": "free",
  "credits_used": 0,
  "credits_limit": 100,
  "credits_remaining": 100
}
\`\`\`

---

## GET /v1/pricing

List available pricing plans and their features. No authentication required.

\`\`\`json
{
  "tiers": [
    { "id": "free", "name": "Free", "price": 0, "queries_per_month": 100, "rate_limit_rpm": 10 }
  ]
}
\`\`\`

---

## Examples

### cURL (article)
\`\`\`bash
curl -X POST https://agent-api-gateway.onrender.com/v1/extract \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://en.wikipedia.org/wiki/Artificial_intelligence", "schema": "article"}'
\`\`\`

### Node.js / TypeScript
\`\`\`typescript
const res = await fetch('https://agent-api-gateway.onrender.com/v1/extract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-your-api-key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: '...', schema: 'article' }),
});
const data = await res.json();
\`\`\`

### Python
\`\`\`python
import requests
resp = requests.post(
    'https://agent-api-gateway.onrender.com/v1/extract',
    headers={'Authorization': 'Bearer sk-your-api-key'},
    json={'url': '...', 'schema': 'article'}
)
data = resp.json()
\`\`\`

---

## Error Handling

| Status | Meaning | Typical Cause |
|--------|---------|---------------|
| 200 | Success | Extraction completed |
| 400 | Bad Request | Missing or invalid url or schema |
| 401 | Unauthorized | Missing or invalid API key |
| 429 | Too Many Requests | Rate limit exceeded or monthly quota exhausted |
| 502 | Bad Gateway | Extraction failed — unreachable URL, timeout, or LLM error |

---

## Rate Limits & Quotas

| Tier | Monthly Credits | Rate Limit | Concurrent | Price |
|------|----------------|------------|------------|-------|
| Free | 100 | 10 req/min | 1 | Free |
| Hobby | 5,000 | 60 req/min | 5 | $29/mo |
| Pro | 100,000 | 300 req/min | 20 | $99/mo |
| Scale | Custom | Custom | Custom | Contact us |

**Cache policy:** Successful extractions are cached for 24 hours. Cache hits do not deduct credits. Bypass the cache by including a unique query parameter.
`;
  }
}

// ─── Docs Page ───

export default function Docs() {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} activeSection={activeSection} />

      <div className="hidden lg:block relative z-10">
        <div className="fixed left-0 top-0 z-40 h-screen w-60">
          <DocsSidebar activeSection={activeSection} />
        </div>
      </div>

      <main className="relative z-10 mx-auto min-h-screen px-6 pt-20 pb-16 lg:pl-64 lg:pr-8 lg:pt-12 docs-body" style={{ maxWidth: '72rem' }}>
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm link lg:hidden" style={{ color: 'var(--color-text-tertiary)' }}>
          ← Home
        </Link>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <div>
            <SectionLabel>Reference</SectionLabel>
            <h1 className="font-display mb-2 text-3xl font-bold tracking-tight">API Reference</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Extract structured web data with one API call.
            </p>
          </div>
          <DocsCopyMdButton />
        </motion.div>

        {/* Overview */}
        <Section id="overview" title="Overview">
          <Para>
            AgentAPI extracts structured data from any public URL. Send a URL and a schema type,
            receive clean JSON. Designed for AI agents — no markdown parsing, no raw HTML.
          </Para>

          <div className="surface p-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Base URL</strong>
            </p>
            <code className="mt-1 block rounded-lg px-3 py-2 font-mono text-sm" style={{ background: 'var(--color-bg-app)', color: 'var(--color-accent-base)' }}>
              https://agent-api-gateway.onrender.com
            </code>
          </div>

          <Para className="mt-4">
            <strong style={{ color: 'var(--color-text-primary)' }}>Pricing model:</strong> Credit-based. Each successful extraction deducts 1 credit.
            Failed extractions do not count against your quota. Cached hits are free.
          </Para>
        </Section>

        {/* Auth */}
        <Section id="auth" title="Authentication">
          <Para>
            Two authentication methods are supported. Both use the{' '}
            <code className="code-inline">Authorization</code> header.
          </Para>

          <SubSection title="API Key (recommended for automated use)">
            <Code lang="http">Authorization: Bearer sk-your-api-key</Code>
            <Para>
              Create and manage API keys from the{' '}
              <Link to="/dashboard" className="link-accent">Dashboard &rarr; API Keys</Link>.
              API keys are persistent and ideal for server-side integration.
            </Para>
          </SubSection>

          <SubSection title="Session Token (for dashboard use)">
            <Code lang="http">Authorization: Bearer your-session-token</Code>
            <Para>
              Sign in to the dashboard to obtain a session token. Tokens expire after 7 days.
              Use API keys for production integrations.
            </Para>
          </SubSection>

          <div
            className="rounded-md px-4 py-3"
            style={{ background: 'var(--color-accent-subtle)', border: '1px solid oklch(0.74 0.12 195 / 0.25)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-accent-base)' }}>Tip:</strong> Include your API key in every request.
              Requests without authentication return a <code className="code-inline">401</code> error.
            </p>
          </div>
        </Section>

        {/* Schemas */}
        <Section id="schemas" title="Extraction Schemas">
          <Para>Each schema returns a structured JSON object matching the page type. Fields are nullable — if a field cannot be extracted, it returns <code className="code-inline">null</code>.</Para>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Schema</th>
                  <th>Core Fields</th>
                  <th>Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>product</code></td>
                  <td>name, price, currency, description, availability, specs, image_url, rating, variants</td>
                  <td>E-commerce product pages</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>article</code></td>
                  <td>title, author, date, reading_time, excerpt, content_summary, topics, image_url</td>
                  <td>Blogs, news articles, documentation</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>company</code></td>
                  <td>name, description, founded_year, size_range, funding_total, industry, location, competitors</td>
                  <td>Company pages, Crunchbase, LinkedIn profiles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Extract Endpoint */}
        <Section id="extract" title="POST /v1/extract">
          <Para>Extract structured data from any public URL. Returns the schema-matched fields plus usage metadata.</Para>

          <SubSection title="Request Body">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>url</code></td>
                    <td>string</td>
                    <td style={{ color: 'var(--color-warning)' }}>Yes</td>
                    <td>Public URL to extract data from</td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>schema</code></td>
                    <td>string</td>
                    <td style={{ color: 'var(--color-warning)' }}>Yes</td>
                    <td>One of: <code className="code-inline">product</code>, <code className="code-inline">article</code>, <code className="code-inline">company</code></td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>options.wait_for</code></td>
                    <td>string</td>
                    <td style={{ color: 'var(--color-text-disabled)' }}>No</td>
                    <td>CSS selector to wait for before extracting</td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>options.country</code></td>
                    <td>string</td>
                    <td style={{ color: 'var(--color-text-disabled)' }}>No</td>
                    <td>ISO country code for geo-targeted content</td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>options.extract_raw</code></td>
                    <td>boolean</td>
                    <td style={{ color: 'var(--color-text-disabled)' }}>No</td>
                    <td>Include raw extracted text alongside structured output</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection title="Response — 200 OK">
            <Code lang="json">
{`{
  "success": true,
  "data": {
    "name": "Studio Headphones Pro",
    "price": 249.99,
    "currency": "USD",
    "rating": 4.7,
    "in_stock": true,
    "variants": ["Matte Black", "Silver", "Midnight"]
  },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 1499
  },
  "cached": false,
  "latency_ms": 4231
}`}
            </Code>
            <Para>
              The <code className="code-inline">usage</code> object shows credit consumption.
              <code className="code-inline">cached</code> indicates whether the result was served from cache (no credit deducted).
            </Para>
          </SubSection>
        </Section>

        {/* Usage Endpoint */}
        <Section id="usage" title="GET /v1/usage">
          <Para>Check your current plan tier, credits used, and remaining quota for the current billing period.</Para>

          <SubSection title="Response — 200 OK">
            <Code lang="json">
{`{
  "tier": "free",
  "credits_used": 0,
  "credits_limit": 100,
  "credits_remaining": 100,
  "period_start": "2026-07-01T00:00:00.000Z"
}`}
            </Code>
          </SubSection>
        </Section>

        <Section id="pricing" title="GET /v1/pricing">
          <Para>List available pricing plans and their features. No authentication required.</Para>

          <SubSection title="Response — 200 OK">
            <Code lang="json">
{`{
  "tiers": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "queries_per_month": 100,
      "rate_limit_rpm": 10
    }
  ]
}`}
            </Code>
          </SubSection>
        </Section>

        {/* Examples */}
        <Section id="examples" title="Examples">
          <SubSection title="Extract an article (cURL)">
            <Code lang="bash">
{`curl -X POST https://agent-api-gateway.onrender.com/v1/extract \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Artificial_intelligence", "schema": "article"}'`}
            </Code>
          </SubSection>

          <SubSection title="Extract a product (cURL)">
            <Code lang="bash">
{`curl -X POST https://agent-api-gateway.onrender.com/v1/extract \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example-store.com/product/123", "schema": "product"}'`}
            </Code>
          </SubSection>

          <SubSection title="Node.js / TypeScript">
            <Code lang="javascript">
{`const res = await fetch('https://agent-api-gateway.onrender.com/v1/extract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-your-api-key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    schema: 'article',
  }),
});

const data = await res.json();
console.log(data.data.title);`}
            </Code>
          </SubSection>

          <SubSection title="Python">
            <Code lang="python">
{`import requests

resp = requests.post(
    'https://agent-api-gateway.onrender.com/v1/extract',
    headers={'Authorization': 'Bearer sk-your-api-key'},
    json={'url': 'https://en.wikipedia.org/wiki/Artificial_intelligence', 'schema': 'article'}
)
data = resp.json()
print(data['data']['title'])`}
            </Code>
          </SubSection>
        </Section>

        {/* Errors */}
        <Section id="errors" title="Error Handling">
          <Para>The API uses standard HTTP status codes. Every error response includes a JSON body with an <code className="code-inline">error</code> field.</Para>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Meaning</th>
                  <th>Typical Cause</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-success)' }}>200</code></td>
                  <td>Success</td>
                  <td>Extraction completed</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>400</code></td>
                  <td>Bad Request</td>
                  <td>Missing or invalid <code className="code-inline">url</code> or <code className="code-inline">schema</code></td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>401</code></td>
                  <td>Unauthorized</td>
                  <td>Missing or invalid API key</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>429</code></td>
                  <td>Too Many Requests</td>
                  <td>Rate limit exceeded or monthly quota exhausted</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>502</code></td>
                  <td>Bad Gateway</td>
                  <td>Extraction failed — unreachable URL, timeout, or LLM error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Rate Limits */}
        <Section id="limits" title="Rate Limits &amp; Quotas">
          <Para>Each plan tier has a rate limit (requests per minute) and a monthly credit quota. Exceeding either returns a <code className="code-inline">429</code> response.</Para>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Monthly Credits</th>
                  <th>Rate Limit</th>
                  <th>Concurrent</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-active">Free</span></td>
                  <td className="tabular-nums">100</td>
                  <td className="tabular-nums">10 req/min</td>
                  <td className="tabular-nums">1</td>
                  <td>Free</td>
                </tr>
                <tr>
                  <td><span className="badge" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}>Hobby</span></td>
                  <td className="tabular-nums">5,000</td>
                  <td className="tabular-nums">60 req/min</td>
                  <td className="tabular-nums">5</td>
                  <td>$29/mo</td>
                </tr>
                <tr>
                  <td><span className="badge" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}>Pro</span></td>
                  <td className="tabular-nums">100,000</td>
                  <td className="tabular-nums">300 req/min</td>
                  <td className="tabular-nums">20</td>
                  <td>$99/mo</td>
                </tr>
                <tr>
                  <td><span className="badge badge-accent">Scale</span></td>
                  <td className="tabular-nums">Custom</td>
                  <td className="tabular-nums">Custom</td>
                  <td className="tabular-nums">Custom</td>
                  <td>Contact us</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-xl px-4 py-3 surface" style={{ borderLeft: '3px solid var(--color-accent-base)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Cache policy:</strong> Successful extractions are cached for 24 hours.
              Cache hits do not deduct credits. Bypass the cache by including a unique query parameter.
            </p>
          </div>

          <div className="mt-12 text-center surface surface-glow p-8">
            <p className="mb-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Ready to start extracting?</p>
            <Link
              to="/dashboard"
              className="btn btn-primary"
              style={{ fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}
            >
              Start free
            </Link>
          </div>
        </Section>
      </main>
    </div>
  );
}
