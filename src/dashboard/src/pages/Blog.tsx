import { Link, useParams } from 'react-router-dom';
import { BrandLockup, AmbientBg, SectionLabel } from '../components/Brand';
import { BookOpen, Calendar, Clock, ArrowLeft } from 'lucide-react';

const POSTS = [
  {
    slug: 'structured-data-for-ai-agents',
    title: 'Why AI agents need structured data, not HTML',
    excerpt: 'Raw HTML parsing is brittle and expensive. Here\'s how structured extraction APIs solve the reliability problem for agent tool-calling.',
    date: '2026-07-15',
    readTime: '4 min',
    tags: ['agents', 'architecture'],
    content: `AI agents today face a fundamental problem: the web was built for humans, not machines. When an agent needs data from a webpage, the traditional approach is to fetch the HTML, parse the DOM, and extract relevant fields. This works — until the site changes its markup, adds JavaScript rendering, or blocks the scraper.

## The brittle nature of HTML parsing

HTML is a presentation format, not a data format. CSS classes change during redesigns, DOM structure shifts with framework updates, and content moves between elements. An agent that depends on specific selectors breaks silently.

Even worse, modern websites use client-side rendering, A/B testing, and dynamic content loading. A simple fetch often returns an empty shell, requiring a full headless browser — adding seconds of latency and significant compute cost.

## Structured extraction APIs

A structured extraction API inverts the problem. Instead of telling the agent how to find data (selectors, regex patterns), you tell it what you want (schema type) and where to find it (URL). The API handles rendering, parsing, and field extraction.

For example, with the Agent API Gateway:

\`\`\`
POST /v1/extract
{ "url": "https://store.example.com/product", "schema": "product" }
\`\`\`

Returns:
\`\`\`
{
  "name": "Product Name",
  "price": 29.99,
  "currency": "USD",
  "in_stock": true
}
\`\`\`

## Why this matters for agents

1. **Stability** — schemas define a contract. The agent gets the same shape regardless of website changes.
2. **Speed** — extraction takes ~1-2 seconds vs 5-10s for a full browser render.
3. **Cost** — fewer compute resources per query, no browser farm to maintain.
4. **Safety** — the API handles SSRF protection, rate limiting, and IP rotation.

## The shift is happening

As more agents move from prototypes to production, structured data APIs are becoming essential infrastructure. The era of agents scraping HTML directly is ending — not because it doesn't work, but because it doesn't scale.`,
  },
  {
    slug: 'ssrf-protection-for-extraction-apis',
    title: 'SSRF protection for web extraction APIs',
    excerpt: 'How we block private hosts, metadata endpoints, and credentialed URLs at every layer of the extraction pipeline.',
    date: '2026-07-10',
    readTime: '5 min',
    tags: ['security', 'engineering'],
    content: `Server-Side Request Forgery (SSRF) is one of the most critical vulnerabilities in any service that fetches user-supplied URLs. An extraction API is particularly exposed — by design, it takes arbitrary URLs and fetches them. This post covers how we defend against SSRF at every layer.

## The attack surface

A malicious user could submit:
- \`http://localhost:5432\` — internal database
- \`http://169.254.169.254/latest/meta-data/\` — cloud metadata endpoint
- \`http://10.0.0.1/admin\` — private network services
- \`file:///etc/passwd\` — local file read
- \`http://user:pass@internal.service/\` — credentialed internal request

## Defense in depth

We block SSRF at three layers:

### 1. Zod schema validation

Before any business logic runs, the request body is validated with Zod. The URL field includes a \`refine()\` step that calls our SSRF guard:

\`\`\`typescript
const extractBodySchema = z.object({
  url: z.string().url().max(2048).refine(
    (u) => assertSafePublicUrl(u).ok,
    { message: 'URL targets a blocked or private host' }
  ),
  schema: z.enum(['product', 'article', 'company']),
});
\`\`\`

### 2. Route handler enforcement

The guard runs again explicitly in the route handler before any fetch happens. This catches edge cases where the URL might be transformed between validation and execution.

### 3. Scraper-level validation

Inside the scraper, each redirect hop is re-validated. Even if an initial URL is safe, a redirect to \`http://localhost:3000/secret\` gets blocked.

## What we block

Our \`assertSafePublicUrl()\` function checks:

- **Private IPv4 ranges**: 10/8, 172.16/12, 192.168/16, 127/8 (localhost)
- **Cloud metadata**: 169.254/16 (link-local), 100.64/10 (CGNAT)
- **IPv6**: loopback, unique-local (fc00::/7), link-local (fe80::/10)
- **Hostnames**: \`.local\`, \`.internal\`, \`.localhost\`, metadata endpoints
- **Credentials**: URLs with \`user:pass@\` are rejected
- **Ports**: database ports (3306, 5432, 6379, 27017) and internal services (22, 25, 9200, 11211) are blocked
- **Protocols**: only \`http:\` and \`https:\` allowed — no \`file:\`, \`ftp:\`, or \`data:\`

## Why not just block by IP?

IP-based blocking alone is insufficient. DNS rebinding attacks can resolve a domain to 127.0.0.1 after the initial check. A hostname like \`internal.app\` might resolve to a private IP. We validate the resolved IP at fetch time, not just the URL string.

## Regular audits

The SSRF guard is tested against a suite of known bypass techniques, and we run security scans on every deploy. SSRF protection is not a one-time configuration — it requires ongoing vigilance.`,
  },
  {
    slug: 'choosing-extraction-schema',
    title: 'Choosing the right extraction schema: product, article, or company',
    excerpt: 'A guide to the three built-in schemas and when to use each one for your agent workflows.',
    date: '2026-07-05',
    readTime: '3 min',
    tags: ['guides', 'schema'],
    content: `The Agent API Gateway ships with three built-in extraction schemas: \`product\`, \`article\`, and \`company\`. Each schema is optimized for a specific type of webpage and returns a consistent set of typed fields. Here's how to choose the right one.

## Product

Best for: e-commerce product pages, SaaS pricing pages, marketplace listings.

Returns:
\`\`\`json
{
  "name": "Studio Headphones Pro",
  "brand": "Studio",
  "price": 249.99,
  "currency": "USD",
  "in_stock": true,
  "rating": 4.7,
  "review_count": 128,
  "description": "Premium wireless headphones...",
  "image": "https://...",
  "specs": { "driver": "40mm", "battery": "40h" },
  "availability": "in_stock"
}
\`\`\`

Use product schema when you need: pricing data, inventory status, ratings, technical specifications, or feature comparisons.

## Article

Best for: blog posts, news articles, documentation pages, press releases.

Returns:
\`\`\`json
{
  "title": "Shipping agents that scrape less",
  "author": "Maya Chen",
  "date": "2026-03-12",
  "reading_time": 5,
  "excerpt": "Why the next generation of AI agents...",
  "content_summary": "A deep dive into the shift...",
  "topics": ["agents", "data", "AI"]
}
\`\`\`

Use article schema when you need: content analysis, author attribution, publication dates, topic categorization, or reading time estimates.

## Company

Best for: about pages, LinkedIn company profiles, Crunchbase entries, careers pages.

Returns:
\`\`\`json
{
  "name": "Nimbus Labs",
  "description": "Infrastructure for agent workflows...",
  "founded": "2021",
  "size": "5-10 employees",
  "funding_total": null,
  "industry": "Developer tools, AI infrastructure",
  "location": "Remote",
  "competitors": []
}
\`\`\`

Use company schema when you need: company intelligence, lead enrichment, competitor analysis, or market research.

## Quick reference

| Schema   | Best for                     | Key fields                              |
|----------|------------------------------|-----------------------------------------|
| product  | E-commerce, pricing pages    | price, currency, in_stock, rating       |
| article  | Blog posts, news             | title, author, date, topics             |
| company  | About pages, profiles        | description, founded, size, industry    |

## Not sure?

Start with \`product\` — it's the most tested schema and handles the widest variety of pages. If the results don't match, switch to \`article\` for content-heavy pages or \`company\` for organizational profiles.

Custom schemas are available on the Pro plan. Contact support for schema reviews.`,
  },
];

function BlogListing() {
  return (
    <div
      className="landing-shell relative min-h-screen"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <AmbientBg intensity="strong" />
      <div className="landing-mesh" aria-hidden />
      <div className="relative z-10">
        <header className="nav-float">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <BrandLockup variant="product" showOrgSubline to="/" />
            <Link to="/docs" className="link text-sm">Docs</Link>
          </nav>
        </header>

        <main className="mx-auto max-w-3xl px-5 md:px-6 pt-32 pb-20">
          <SectionLabel>Blog</SectionLabel>
          <h1 className="text-display mt-4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Engineering & updates
          </h1>
          <p className="text-sm mb-12 max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Building structured data extraction for AI agents — architecture, security, and product updates.
          </p>

          <div className="flex flex-col gap-6">
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="surface surface-hover lift-card p-6"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <div className="flex gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: 'var(--color-accent-subtle)',
                            color: 'var(--color-accent-base)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <BookOpen className="w-3 h-3 inline mr-1" />
              More posts coming soon.
            </p>
          </div>
        </main>

        <footer
          className="relative z-10"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <div className="mx-auto max-w-6xl px-5 md:px-6 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <Link to="/" className="link">Home</Link>
            <span className="mx-3">·</span>
            <Link to="/docs" className="link">Docs</Link>
            <span className="mx-3">·</span>
            <span>&copy; {new Date().getFullYear()} NexusCore</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="landing-shell relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
        <AmbientBg intensity="strong" />
        <div className="relative z-10">
          <header className="nav-float">
            <nav className="mx-auto flex max-w-6xl items-center justify-between">
              <BrandLockup variant="product" showOrgSubline to="/" />
              <Link to="/blog" className="link text-sm">Blog</Link>
            </nav>
          </header>
          <main className="mx-auto max-w-3xl px-5 md:px-6 pt-32 pb-20 text-center">
            <h1 className="text-display" style={{ color: 'var(--color-text-primary)' }}>Post not found</h1>
            <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Link to="/blog" className="link">&larr; Back to blog</Link>
            </p>
          </main>
        </div>
      </div>
    );
  }

  const lines = post.content.split('\n');
  const rendered: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let codeLang = '';

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        rendered.push(<pre key={rendered.length} className="overflow-x-auto rounded-lg p-4 text-xs leading-relaxed my-4" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}><code>{codeLines.join('\n')}</code></pre>);
        codeLines = [];
        inCode = false;
      } else {
        codeLang = line.slice(3).trim();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (line.startsWith('## ')) {
      rendered.push(<h2 key={rendered.length} className="text-lg font-semibold mt-8 mb-3" style={{ color: 'var(--color-text-primary)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      rendered.push(<h3 key={rendered.length} className="text-base font-semibold mt-6 mb-2" style={{ color: 'var(--color-text-primary)' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('| ')) {
      if (line.includes('---')) continue;
      const cells = line.split('|').filter(Boolean).map((c) => c.trim());
      const isHeader = rendered.length > 0 && rendered[rendered.length - 1] && typeof rendered[rendered.length - 1] === 'string' ? false : true;
      if (isHeader) {
        rendered.push(
          <div key={rendered.length} className="overflow-x-auto my-4">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  {cells.map((c, i) => <th key={i} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>{c}</th>)}
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        );
      }
    } else if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*(.+)/);
      if (match) {
        rendered.push(<li key={rendered.length} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}><strong style={{ color: 'var(--color-text-primary)' }}>{match[1]}</strong>{match[2]}</li>);
      }
    } else if (line.startsWith('- ')) {
      rendered.push(<li key={rendered.length} className="text-sm leading-relaxed ml-4" style={{ color: 'var(--color-text-secondary)' }}>{line.slice(2)}</li>);
    } else if (line.match(/^\d\. /)) {
      rendered.push(<li key={rendered.length} className="text-sm leading-relaxed ml-4" style={{ color: 'var(--color-text-secondary)' }}>{line.replace(/^\d\.\s*/, '')}</li>);
    } else if (line.trim() === '') {
      rendered.push(<div key={rendered.length} className="h-2" />);
    } else {
      const formatted = line.replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>');
      rendered.push(<p key={rendered.length} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatted }} />);
    }
  }

  return (
    <div
      className="landing-shell relative min-h-screen"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <AmbientBg intensity="strong" />
      <div className="landing-mesh" aria-hidden />
      <div className="relative z-10">
        <header className="nav-float">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <BrandLockup variant="product" showOrgSubline to="/" />
            <div className="flex items-center gap-4">
              <Link to="/blog" className="link text-sm flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Blog
              </Link>
              <Link to="/docs" className="link text-sm">Docs</Link>
            </div>
          </nav>
        </header>

        <article className="mx-auto max-w-3xl px-5 md:px-6 pt-32 pb-20">
          <Link to="/blog" className="link text-xs flex items-center gap-1 mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
            <ArrowLeft className="w-3 h-3" /> Back to blog
          </Link>

          <SectionLabel>{post.tags[0]}</SectionLabel>
          <h1 className="text-display mt-4 mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-8 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <div className="prose-container">
            {rendered}
          </div>
        </article>

        <footer
          className="relative z-10"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <div className="mx-auto max-w-6xl px-5 md:px-6 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <Link to="/" className="link">Home</Link>
            <span className="mx-3">·</span>
            <Link to="/blog" className="link">Blog</Link>
            <span className="mx-3">·</span>
            <Link to="/docs" className="link">Docs</Link>
            <span className="mx-3">·</span>
            <span>&copy; {new Date().getFullYear()} NexusCore</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export { BlogListing, BlogPost };
