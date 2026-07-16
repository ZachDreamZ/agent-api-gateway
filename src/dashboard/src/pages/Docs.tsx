import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Copy, Check, BookOpen } from 'lucide-react';

// ─── SVG Logo Mark ───

function LogoMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// ─── Copy Button ───

function CopyButton({ text }: { text: string }) {
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
      {copied ? 'Copied' : 'Copy'}
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
    <div id={id} className="mb-12 scroll-mt-20">
      <h2 className="mb-4 text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      {children}
    </div>
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
  { id: 'examples', label: 'Examples' },
  { id: 'errors', label: 'Error Handling' },
  { id: 'limits', label: 'Rate Limits' },
];

function DocsSidebar({ activeSection, onNavigate }: { activeSection: string; onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-56 flex-col" style={{ borderRight: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}>
      <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-4 link" onClick={onNavigate}>
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-xs font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>AgentAPI Docs</span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={onNavigate}
              className="relative block rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                color: isActive ? 'var(--color-accent-base)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--color-bg-hover)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}
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
    <div
      className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b px-4 lg:hidden"
      style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-app)' }}
    >
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

// ─── Docs Page ───

export default function Docs() {
  const location = useLocation();
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
    <div className="min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex">
        <DocsSidebar activeSection={activeSection} />
      </div>

      {/* Mobile header */}
      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} activeSection={activeSection} />

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-12 lg:ml-56 lg:px-10 lg:pt-12">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm link lg:hidden" style={{ color: 'var(--color-text-tertiary)' }}>
          ← Home
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">API Reference</h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Everything you need to integrate with AgentAPI</p>

        {/* Overview */}
        <Section id="overview" title="Overview">
          <Para>
            AgentAPI extracts structured data from any public URL. Send a URL and a schema type,
            get clean JSON. Designed for AI agents — no markdown parsing, no raw HTML.
          </Para>
          <div className="surface p-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Base URL</strong>
            </p>
            <code className="mt-1 block rounded-lg px-3 py-2 font-mono text-sm" style={{ background: 'var(--color-bg-app)', color: 'var(--color-accent-base)' }}>
              https://agent-api-gateway.onrender.com
            </code>
          </div>
        </Section>

        {/* Auth */}
        <Section id="auth" title="Authentication">
          <Para>
            All API requests require an API key sent via the{' '}
            <code className="code-inline">Authorization</code> header.
          </Para>
          <SubSection title="Header format">
            <Code lang="http">Authorization: Bearer sk-your-api-key</Code>
          </SubSection>
          <SubSection title="Get your key">
            <Para>
              Sign in to the{' '}
              <Link to="/dashboard" className="link-accent">Dashboard</Link>{' '}
              to create and manage API keys.
            </Para>
          </SubSection>
        </Section>

        {/* Schemas */}
        <Section id="schemas" title="Extraction Schemas">
          <Para>Choose the schema that matches the page you are extracting from.</Para>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Schema</th>
                  <th>Fields</th>
                  <th>Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>product</code></td>
                  <td>name, price, currency, description, availability, specs, image_url, rating</td>
                  <td>E-commerce pages</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>article</code></td>
                  <td>title, author, date, reading_time, excerpt, content_summary, topics</td>
                  <td>Blogs, news, docs</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>company</code></td>
                  <td>name, description, founded_year, size_range, industry, location, website, linkedin_url</td>
                  <td>Company pages, Crunchbase, LinkedIn</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Extract Endpoint */}
        <Section id="extract" title="POST /v1/extract">
          <Para>Extract structured data from a URL.</Para>

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
                    <td>Public URL to extract from</td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>schema</code></td>
                    <td>string</td>
                    <td style={{ color: 'var(--color-warning)' }}>Yes</td>
                    <td>One of: <code className="code-inline">product</code>, <code className="code-inline">article</code>, <code className="code-inline">company</code></td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>options</code></td>
                    <td>object</td>
                    <td style={{ color: 'var(--color-text-disabled)' }}>No</td>
                    <td>Optional settings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection title="Options">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>wait_for</code></td>
                    <td>string</td>
                    <td>CSS selector to wait for before extracting</td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>country</code></td>
                    <td>string</td>
                    <td>ISO country code for geo-specific content</td>
                  </tr>
                  <tr>
                    <td><code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>extract_raw</code></td>
                    <td>boolean</td>
                    <td>Include raw extracted data alongside structured output</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection title="Response (200)">
            <Code lang="json">
{`{
  "success": true,
  "data": {
    // Schema-specific fields
  },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 1499
  },
  "cached": false,
  "latency_ms": 4231
}`}
            </Code>
          </SubSection>
        </Section>

        {/* Examples */}
        <Section id="examples" title="Examples">
          <SubSection title="Extract an article">
            <Code lang="bash">
{`curl -X POST https://agent-api-gateway.onrender.com/v1/extract \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "schema": "article"
  }'`}
            </Code>
            <Code lang="json">
{`{
  "success": true,
  "data": {
    "title": "Artificial intelligence",
    "topics": ["AI", "machine learning", "deep learning"],
    "excerpt": "Artificial intelligence is intelligence demonstrated by machines..."
  }
}`}
            </Code>
          </SubSection>

          <SubSection title="Extract a product">
            <Code lang="bash">
{`curl -X POST https://agent-api-gateway.onrender.com/v1/extract \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example-store.com/product/123",
    "schema": "product"
  }'`}
            </Code>
          </SubSection>

          <SubSection title="Node.js (fetch)">
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
          <Para>The API uses standard HTTP status codes and always returns a JSON body with details.</Para>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-success)' }}>200</code></td>
                  <td>Success</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>401</code></td>
                  <td>Missing or invalid API key</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>429</code></td>
                  <td>Rate limit or quota exceeded</td>
                </tr>
                <tr>
                  <td><code className="code-inline" style={{ color: 'var(--color-error)' }}>502</code></td>
                  <td>Extraction failed (bad URL, unreachable page, or LLM error)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            className="mt-4 rounded-xl px-4 py-3"
            style={{ background: 'var(--color-warning-subtle)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
              <strong>Note:</strong> Extraction charges are incurred even when the fetch succeeds but the page
              returns an error status. See the dashboard for usage details.
            </p>
          </div>
        </Section>

        {/* Rate Limits */}
        <Section id="limits" title="Rate Limits">
          <Para>Rate limits depend on your plan tier. Exceeding the limit returns a 429 response.</Para>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Queries / month</th>
                  <th>Rate limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-active">Free</span></td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>100</td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>10 req/min</td>
                </tr>
                <tr>
                  <td><span className="badge badge-active">Starter</span></td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>5,000</td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>60 req/min</td>
                </tr>
                <tr>
                  <td><span className="badge badge-active">Pro</span></td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>100,000</td>
                  <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>300 req/min</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center surface p-6">
            <p className="mb-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Ready to start extracting?</p>
            <Link
              to="/dashboard"
              className="btn btn-primary"
              style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}
            >
              Get Started Free
            </Link>
          </div>
        </Section>
      </main>
    </div>
  );
}
