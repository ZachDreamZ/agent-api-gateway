import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// ─── SVG Logo Mark ───

function LogoMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// ─── Animated section wrapper ───

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Code Block ───

function Code({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="my-3 overflow-hidden rounded-lg glass-card">
      {lang && (
        <div className="border-b border-white/10 px-4 py-1.5 text-xs font-medium text-white/40">
          {lang}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-white/80">{children}</code>
      </pre>
    </div>
  );
}

// ─── Glass Table ───

function GlassTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg glass-card">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

// ─── Section ───

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <FadeSection>
      <div id={id} className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-white">{title}</h2>
        {children}
      </div>
    </FadeSection>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-base font-semibold text-white/80">{title}</h3>
      {children}
    </div>
  );
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

function DocsSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-white/10 bg-[#0c0c0c] lg:flex">
      <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-4 hover:opacity-80 text-white/60 hover:text-white transition-colors">
        <LogoMark className="w-5 h-5" />
        <span className="text-xs font-semibold tracking-tight">AgentAPI Docs</span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block rounded px-3 py-1.5 text-sm text-white/50 transition-colors glass-card-hover"
          >
            {s.label}
          </a>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <Link to="/dashboard" className="block text-xs text-white/40 hover:text-white/70 transition-colors">
          ← Dashboard
        </Link>
      </div>
    </aside>
  );
}

// ─── Docs Page ───

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-brand-aura/30">
      <DocsSidebar />

      <main className="mx-auto max-w-3xl px-6 py-12 lg:ml-56 lg:px-10">
        <FadeSection>
          <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors lg:hidden">
            ← Home
          </Link>

          <h1 className="mb-8 text-3xl font-bold tracking-tight">API Reference</h1>
        </FadeSection>

        {/* Overview */}
        <Section id="overview" title="Overview">
          <p className="mb-3 leading-relaxed text-white/60">
            AgentAPI extracts structured data from any public URL. Send a URL and a schema type,
            get clean JSON. Designed for AI agents — no markdown parsing, no raw HTML.
          </p>
          <p className="leading-relaxed text-white/60">
            <strong className="text-white/80">Base URL:</strong>{' '}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-brand-400">
              https://agent-api-gateway.onrender.com
            </code>
          </p>
        </Section>

        {/* Auth */}
        <Section id="auth" title="Authentication">
          <p className="mb-3 leading-relaxed text-white/60">
            All API requests require an API key sent via the <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm">Authorization</code> header.
          </p>
          <SubSection title="Header format">
            <Code lang="http">
              Authorization: Bearer sk-your-api-key
            </Code>
          </SubSection>
          <SubSection title="Get your key">
            <p className="leading-relaxed text-white/60">
              Sign in to the{' '}
              <Link to="/dashboard" className="text-brand-400 hover:underline">
                Dashboard
              </Link>{' '}
              to create and manage API keys.
            </p>
          </SubSection>
        </Section>

        {/* Schemas */}
        <Section id="schemas" title="Extraction Schemas">
          <p className="mb-4 leading-relaxed text-white/60">
            Choose the schema that matches the page you are extracting from.
          </p>

          <GlassTable>
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Schema</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Fields</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="px-4 py-3 font-mono text-brand-400">product</td>
                <td className="px-4 py-3 text-white/60">name, price, currency, description, availability, specs, image_url, rating</td>
                <td className="px-4 py-3 text-white/60">E-commerce pages</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-brand-400">article</td>
                <td className="px-4 py-3 text-white/60">title, author, date, reading_time, excerpt, content_summary, topics</td>
                <td className="px-4 py-3 text-white/60">Blogs, news, docs</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-brand-400">company</td>
                <td className="px-4 py-3 text-white/60">name, description, founded_year, size_range, industry, location, website, linkedin_url</td>
                <td className="px-4 py-3 text-white/60">Company pages, Crunchbase, LinkedIn</td>
              </tr>
            </tbody>
          </GlassTable>
        </Section>

        {/* Extract Endpoint */}
        <Section id="extract" title="POST /v1/extract">
          <p className="mb-4 leading-relaxed text-white/60">
            Extract structured data from a URL.
          </p>

          <SubSection title="Request Body">
            <GlassTable>
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Field</th>
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Required</th>
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">url</td>
                  <td className="px-4 py-3 text-white/60">string</td>
                  <td className="px-4 py-3 text-yellow-400">Yes</td>
                  <td className="px-4 py-3 text-white/60">Public URL to extract from</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">schema</td>
                  <td className="px-4 py-3 text-white/60">string</td>
                  <td className="px-4 py-3 text-yellow-400">Yes</td>
                  <td className="px-4 py-3 text-white/60">One of: <code className="rounded bg-white/5 px-1">product</code>, <code className="rounded bg-white/5 px-1">article</code>, <code className="rounded bg-white/5 px-1">company</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">options</td>
                  <td className="px-4 py-3 text-white/60">object</td>
                  <td className="px-4 py-3 text-white/50">No</td>
                  <td className="px-4 py-3 text-white/60">Optional settings</td>
                </tr>
              </tbody>
            </GlassTable>
          </SubSection>

          <SubSection title="Options">
            <GlassTable>
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Field</th>
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-white/70">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">wait_for</td>
                  <td className="px-4 py-3 text-white/60">string</td>
                  <td className="px-4 py-3 text-white/60">CSS selector to wait for before extracting (e.g. <code className="rounded bg-white/5 px-1">.product-detail</code>)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">country</td>
                  <td className="px-4 py-3 text-white/60">string</td>
                  <td className="px-4 py-3 text-white/60">ISO country code for geo-specific content</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">extract_raw</td>
                  <td className="px-4 py-3 text-white/60">boolean</td>
                  <td className="px-4 py-3 text-white/60">Include raw extracted data alongside structured output</td>
                </tr>
              </tbody>
            </GlassTable>
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
          <p className="mb-4 leading-relaxed text-white/60">
            The API uses standard HTTP status codes and always returns a JSON body with details.
          </p>
          <GlassTable>
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="px-4 py-3"><code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-green-400">200</code></td>
                <td className="px-4 py-3 text-white/60">Success</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-red-400">401</code></td>
                <td className="px-4 py-3 text-white/60">Missing or invalid API key</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-red-400">429</code></td>
                <td className="px-4 py-3 text-white/60">Rate limit or quota exceeded</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-red-400">502</code></td>
                <td className="px-4 py-3 text-white/60">Extraction failed (bad URL, unreachable page, or LLM error)</td>
              </tr>
            </tbody>
          </GlassTable>
          <div className="mt-4 rounded-lg glass-card px-4 py-3 border-red-500/20">
            <p className="text-sm text-red-400">
              <strong>Note:</strong> Extraction charges are incurred even when the fetch succeeds but the page
              returns an error status. See the dashboard for usage details.
            </p>
          </div>
        </Section>

        {/* Rate Limits */}
        <Section id="limits" title="Rate Limits">
          <p className="mb-4 leading-relaxed text-white/60">
            Rate limits depend on your plan tier.
          </p>
          <GlassTable>
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Tier</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Queries / Month</th>
                <th className="px-4 py-2.5 text-left font-medium text-white/70">Rate Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="px-4 py-3 font-medium text-white">Free</td>
                <td className="px-4 py-3 text-white/60">1,500</td>
                <td className="px-4 py-3 text-white/60">10 req/min</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-white">Hobby</td>
                <td className="px-4 py-3 text-white/60">20,000</td>
                <td className="px-4 py-3 text-white/60">60 req/min</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-white">Pro</td>
                <td className="px-4 py-3 text-white/60">100,000</td>
                <td className="px-4 py-3 text-white/60">300 req/min</td>
              </tr>
            </tbody>
          </GlassTable>
        </Section>

        <FadeSection delay={0.3}>
          <div className="mt-12 border-t border-white/10 pt-6 text-center">
            <Link
              to="/dashboard"
              className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Get Started Free
            </Link>
          </div>
        </FadeSection>
      </main>
    </div>
  );
}
