import { Link } from 'react-router-dom';

// ─── Code Block ───

function Code({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-surface-800 bg-surface-950">
      {lang && (
        <div className="border-b border-surface-800 px-4 py-1.5 text-xs font-medium text-surface-500">
          {lang}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ─── Section ───

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-10">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-surface-100">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-base font-semibold text-surface-200">{title}</h3>
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
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-surface-800 bg-surface-950 lg:flex">
      <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-4 hover:opacity-80">
        <span className="text-lg">⚡</span>
        <span className="text-xs font-semibold tracking-tight">AgentAPI Docs</span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block rounded px-3 py-1.5 text-sm text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
          >
            {s.label}
          </a>
        ))}
      </nav>
      <div className="border-t border-surface-800 px-5 py-4">
        <Link to="/dashboard" className="block text-xs text-surface-500 hover:text-surface-300">
          ← Dashboard
        </Link>
      </div>
    </aside>
  );
}

// ─── Docs Page ───

export default function Docs() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <DocsSidebar />

      <main className="mx-auto max-w-3xl px-6 py-12 lg:ml-56 lg:px-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-300 lg:hidden">
          ← Home
        </Link>

        <h1 className="mb-8 text-3xl font-bold tracking-tight">API Reference</h1>

        {/* Overview */}
        <Section id="overview" title="Overview">
          <p className="mb-3 leading-relaxed text-surface-400">
            AgentAPI extracts structured data from any public URL. Send a URL and a schema type,
            get clean JSON. Designed for AI agents — no markdown parsing, no raw HTML.
          </p>
          <p className="leading-relaxed text-surface-400">
            <strong className="text-surface-200">Base URL:</strong>{' '}
            <code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-sm text-brand-400">
              https://agent-api-gateway.onrender.com
            </code>
          </p>
        </Section>

        {/* Auth */}
        <Section id="auth" title="Authentication">
          <p className="mb-3 leading-relaxed text-surface-400">
            All API requests require an API key sent via the <code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-sm">Authorization</code> header.
          </p>
          <SubSection title="Header format">
            <Code lang="http">
              Authorization: Bearer sk-your-api-key
            </Code>
          </SubSection>
          <SubSection title="Get your key">
            <p className="leading-relaxed text-surface-400">
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
          <p className="mb-4 leading-relaxed text-surface-400">
            Choose the schema that matches the page you are extracting from.
          </p>

          <div className="mb-4 overflow-hidden rounded-lg border border-surface-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800 bg-surface-900">
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Schema</th>
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Fields</th>
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">product</td>
                  <td className="px-4 py-3 text-surface-400">name, price, currency, description, availability, specs, image_url, rating</td>
                  <td className="px-4 py-3 text-surface-400">E-commerce pages</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">article</td>
                  <td className="px-4 py-3 text-surface-400">title, author, date, reading_time, excerpt, content_summary, topics</td>
                  <td className="px-4 py-3 text-surface-400">Blogs, news, docs</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-brand-400">company</td>
                  <td className="px-4 py-3 text-surface-400">name, description, founded_year, size_range, industry, location, website, linkedin_url</td>
                  <td className="px-4 py-3 text-surface-400">Company pages, Crunchbase, LinkedIn</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Extract Endpoint */}
        <Section id="extract" title="POST /v1/extract">
          <p className="mb-4 leading-relaxed text-surface-400">
            Extract structured data from a URL.
          </p>

          <SubSection title="Request Body">
            <div className="mb-4 overflow-hidden rounded-lg border border-surface-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-900">
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Field</th>
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Type</th>
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Required</th>
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-400">url</td>
                    <td className="px-4 py-3 text-surface-400">string</td>
                    <td className="px-4 py-3 text-yellow-400">Yes</td>
                    <td className="px-4 py-3 text-surface-400">Public URL to extract from</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-400">schema</td>
                    <td className="px-4 py-3 text-surface-400">string</td>
                    <td className="px-4 py-3 text-yellow-400">Yes</td>
                    <td className="px-4 py-3 text-surface-400">One of: <code className="rounded bg-surface-800 px-1">product</code>, <code className="rounded bg-surface-800 px-1">article</code>, <code className="rounded bg-surface-800 px-1">company</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-400">options</td>
                    <td className="px-4 py-3 text-surface-400">object</td>
                    <td className="px-4 py-3 text-surface-500">No</td>
                    <td className="px-4 py-3 text-surface-400">Optional settings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection title="Options">
            <div className="overflow-hidden rounded-lg border border-surface-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-900">
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Field</th>
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Type</th>
                    <th className="px-4 py-2.5 text-left font-medium text-surface-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-400">wait_for</td>
                    <td className="px-4 py-3 text-surface-400">string</td>
                    <td className="px-4 py-3 text-surface-400">CSS selector to wait for before extracting (e.g. <code className="rounded bg-surface-800 px-1">.product-detail</code>)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-400">country</td>
                    <td className="px-4 py-3 text-surface-400">string</td>
                    <td className="px-4 py-3 text-surface-400">ISO country code for geo-specific content</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-400">extract_raw</td>
                    <td className="px-4 py-3 text-surface-400">boolean</td>
                    <td className="px-4 py-3 text-surface-400">Include raw extracted data alongside structured output</td>
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
          <p className="mb-4 leading-relaxed text-surface-400">
            The API uses standard HTTP status codes and always returns a JSON body with details.
          </p>
          <div className="overflow-hidden rounded-lg border border-surface-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800 bg-surface-900">
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                <tr>
                  <td className="px-4 py-3"><code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-green-400">200</code></td>
                  <td className="px-4 py-3 text-surface-400">Success</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-red-400">401</code></td>
                  <td className="px-4 py-3 text-surface-400">Missing or invalid API key</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-red-400">429</code></td>
                  <td className="px-4 py-3 text-surface-400">Rate limit or quota exceeded</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-red-400">502</code></td>
                  <td className="px-4 py-3 text-surface-400">Extraction failed (bad URL, unreachable page, or LLM error)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-red-900/30 bg-red-900/10 px-4 py-3">
            <p className="text-sm text-red-400">
              <strong>Note:</strong> Extraction charges are incurred even when the fetch succeeds but the page
              returns an error status. See the dashboard for usage details.
            </p>
          </div>
        </Section>

        {/* Rate Limits */}
        <Section id="limits" title="Rate Limits">
          <p className="mb-4 leading-relaxed text-surface-400">
            Rate limits depend on your plan tier.
          </p>
          <div className="overflow-hidden rounded-lg border border-surface-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800 bg-surface-900">
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Tier</th>
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Queries / Month</th>
                  <th className="px-4 py-2.5 text-left font-medium text-surface-300">Rate Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                <tr>
                  <td className="px-4 py-3 font-medium text-surface-200">Free</td>
                  <td className="px-4 py-3 text-surface-400">1,500</td>
                  <td className="px-4 py-3 text-surface-400">10 req/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-surface-200">Hobby</td>
                  <td className="px-4 py-3 text-surface-400">20,000</td>
                  <td className="px-4 py-3 text-surface-400">60 req/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-surface-200">Pro</td>
                  <td className="px-4 py-3 text-surface-400">100,000</td>
                  <td className="px-4 py-3 text-surface-400">300 req/min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <div className="mt-12 border-t border-surface-800 pt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}
