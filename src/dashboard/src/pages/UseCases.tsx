import { Link, useParams } from 'react-router-dom';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';
import { ArrowRight, Bot, Package, Building2, Newspaper } from 'lucide-react';
import { LiveExtractDemo } from '../components/LiveExtractDemo';

type UseCase = {
  slug: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  summary: string;
  audience: string;
  schema: 'product' | 'article' | 'company';
  steps: string[];
  outcomes: string[];
  icon: 'package' | 'news' | 'building' | 'bot';
};

export const USE_CASES: UseCase[] = [
  {
    slug: 'price-intelligence',
    name: 'Price intelligence',
    title: 'Price Intelligence API for AI Agents',
    description:
      'Extract product price, currency, stock, and ratings from public e-commerce pages via REST or MCP. Built for agent price monitoring workflows.',
    keywords: 'price intelligence API, product price extraction, AI agent ecommerce data, product schema API',
    summary:
      'Turn public product URLs into validated price/stock JSON for monitoring, comparison shopping, and agent commerce tools.',
    audience: 'Ecommerce agents, marketplaces, deal finders, procurement bots',
    schema: 'product',
    steps: [
      'Pass a public product URL to POST /v1/extract with schema=product',
      'Receive name, price, currency, rating, and stock fields as validated JSON',
      'Cache results and re-check on a schedule with credit packs for bursts',
    ],
    outcomes: [
      'No brittle CSS selectors to maintain',
      'MCP tools for Cursor/Claude agents',
      'Free tier + $1 credit packs for experiments',
    ],
    icon: 'package',
  },
  {
    slug: 'content-research',
    name: 'Content research',
    title: 'Article Extraction API for Research Agents',
    description:
      'Extract title, author, and article summary from public posts for research agents, news monitors, and content pipelines.',
    keywords: 'article extraction API, content research agent, news monitoring API, article schema',
    summary:
      'Give research agents clean article fields instead of raw HTML dumps.',
    audience: 'Research agents, news digests, content ops tools',
    schema: 'article',
    steps: [
      'Call /v1/extract with schema=article on a public post URL',
      'Use title/author/summary fields in agent memory or RAG pipelines',
      'Combine with MCP tools so agents can fetch sources mid-task',
    ],
    outcomes: [
      'Stable article schema for tools',
      'Lower token cost than stuffing full HTML into an LLM',
      'SSRF-safe public sources only',
    ],
    icon: 'news',
  },
  {
    slug: 'company-enrichment',
    name: 'Company enrichment',
    title: 'Company Enrichment for Agent CRMs',
    description:
      'Extract company profile fields from public about/home pages for lead enrichment agents and GTM workflows.',
    keywords: 'company enrichment API, lead enrichment agent, company schema extraction, GTM agent tools',
    summary:
      'Enrich leads from public company pages without standing up a scraper stack.',
    audience: 'GTM agents, CRM enrichment, prospecting tools',
    schema: 'company',
    steps: [
      'Send a public company URL with schema=company',
      'Store returned org fields in your CRM or agent memory',
      'Use credit packs when enrichment jobs spike',
    ],
    outcomes: [
      'Agent-friendly company schema',
      'REST + MCP install paths',
      'Public-page safety boundaries (no private networks)',
    ],
    icon: 'building',
  },
  {
    slug: 'mcp-agents',
    name: 'MCP agent tools',
    title: 'MCP Tools for Structured Web Extraction',
    description:
      'Install Agent API Gateway MCP in Cursor or Claude Desktop and give agents product/article/company extract tools.',
    keywords: 'MCP web extraction, Cursor MCP tools, Claude Desktop MCP, agent extract tools',
    summary:
      'One package, stdio MCP tools, validated JSON — for agents that need web fields mid-workflow.',
    audience: 'Cursor, Claude Desktop, custom MCP hosts',
    schema: 'product',
    steps: [
      'Install from /mcp (Cursor deeplink or npx package)',
      'Set AGENT_API_KEY from the dashboard',
      'Call extract tools with URL + schema',
    ],
    outcomes: [
      'Published npm package + registry entry',
      'Same schemas as REST',
      'Works for bursty agent workloads with credit packs',
    ],
    icon: 'bot',
  },
];

const ICONS = {
  package: Package,
  news: Newspaper,
  building: Building2,
  bot: Bot,
};

function UseCaseDetail({ item }: { item: UseCase }) {
  const Icon = ICONS[item.icon];
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16">
        <BrandLockup variant="product" showOrgSubline to="/" />
        <SectionLabel>Use cases</SectionLabel>
        <div className="mb-3 flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
          <h1 className="text-display-sm">{item.name}</h1>
        </div>
        <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>{item.summary}</p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-tertiary)' }}>Best for: {item.audience}</p>

        <div className="surface p-5 mb-6">
          <h2 className="text-heading mb-3">How it works</h2>
          <ol className="space-y-2 text-sm list-decimal pl-5" style={{ color: 'var(--color-text-secondary)' }}>
            {item.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <p className="text-caption mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Primary schema: <code>{item.schema}</code>
          </p>
        </div>

        <div className="surface p-5 mb-8">
          <h2 className="text-heading mb-3">Outcomes</h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {item.outcomes.map((o) => (
              <li key={o} className="flex gap-2">
                <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-base)' }} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>

        {item.slug === 'price-intelligence' && (
          <>
            <section className="surface p-5 mb-8" aria-labelledby="live-demo-heading">
              <h2 id="live-demo-heading" className="text-heading mb-4">Live demo — extract a product</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Paste any public product URL and hit Extract. The API returns validated JSON in ~1–2s.
              </p>
              <LiveExtractDemo schema="product" />
            </section>

            <section className="surface p-5 mb-8" aria-labelledby="example-output-heading">
              <h2 id="example-output-heading" className="text-heading mb-3">Example output</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Request: <code>POST /v1/extract</code> with <code>{`{"url": "https://example.com/product", "schema": "product"}`}</code>
              </p>
              <pre className="code-block rounded-lg p-4 text-xs leading-relaxed overflow-x-auto" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-mono)' }}>
{`{
  "name": "Wireless Noise-Cancelling Headphones Pro",
  "brand": "Sony",
  "price": 349.99,
  "currency": "USD",
  "in_stock": true,
  "rating": 4.7,
  "review_count": 2847,
  "description": "Industry-leading noise cancellation with 30-hour battery life...",
  "image": "https://example.com/images/headphones-pro.jpg",
  "specs": { "driver": "30mm", "battery": "30h", "weight": "254g" },
  "availability": "in_stock"
}`}
              </pre>
            </section>

            <section className="surface p-5 mb-8" aria-labelledby="agent-prompt-heading">
              <h2 id="agent-prompt-heading" className="text-heading mb-3">Agent prompt template</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Drop this into your agent system prompt to give it price-extraction capability:
              </p>
              <pre className="code-block rounded-lg p-4 text-xs leading-relaxed overflow-x-auto" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-mono)' }}>
{`You have access to a structured extraction tool. When the user asks for product details from a URL:
1. Call the \`extract_product\` tool with the product URL
2. The tool returns validated JSON with: name, brand, price, currency, in_stock, rating, review_count, description, image, specs, availability
3. Present the key fields to the user in a clean summary
4. If the user wants to track price changes, suggest setting up a scheduled job with credit packs`}
              </pre>
            </section>

            <section className="surface p-5 mb-8" aria-labelledby="quick-start-heading">
              <h2 id="quick-start-heading" className="text-heading mb-3">Quick start</h2>
              <div className="flex flex-wrap gap-3">
                <Link to="/login" className="btn btn-primary text-sm">Create free account (500 queries/mo)</Link>
                <Link to="/pricing#credit-packs" className="btn btn-secondary text-sm">Buy 1,000 credits for $1</Link>
                <Link to="/mcp" className="btn btn-ghost text-sm">Install MCP for Cursor/Claude</Link>
                <Link to="/docs#extraction-api" className="btn btn-ghost text-sm">Read API docs</Link>
              </div>
            </section>
          </>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/login" className="btn btn-primary text-sm">Start free</Link>
          <Link to="/mcp" className="btn btn-secondary text-sm">Install MCP</Link>
          <Link to="/pricing" className="btn btn-ghost text-sm">Pricing</Link>
          <Link to="/docs" className="btn btn-ghost text-sm">Docs</Link>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
          <Link to="/use-cases" className="link-accent">All use cases</Link>
          {' · '}
          <Link to="/alternatives" className="link-accent">Alternatives</Link>
          {' · '}
          <Link to="/" className="link-accent">Home</Link>
        </p>
      </div>
    </div>
  );
}

export default function UseCases() {
  const { slug } = useParams<{ slug?: string }>();
  const item = slug ? USE_CASES.find((u) => u.slug === slug) : undefined;

  useSEO({
    title: item ? item.title : slug ? 'Use case not found' : 'Use cases',
    description: item
      ? item.description
      : 'Agent API Gateway use cases: price intelligence, content research, company enrichment, and MCP agent tools.',
    keywords: item
      ? item.keywords
      : 'AI agent use cases, price intelligence API, article extraction, company enrichment, MCP tools',
    canonical: item
      ? `https://agentapigw.dpdns.org/use-cases/${item.slug}`
      : 'https://agentapigw.dpdns.org/use-cases',
  });

  if (slug && !item) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--color-bg-app)' }}>
        <div className="text-center">
          <h1 className="text-display-sm mb-3">Use case not found</h1>
          <Link to="/use-cases" className="btn btn-primary text-sm">View use cases</Link>
        </div>
      </div>
    );
  }

  if (item) return <UseCaseDetail item={item} />;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16">
        <BrandLockup variant="product" showOrgSubline to="/" />
        <SectionLabel>Use cases</SectionLabel>
        <h1 className="text-display-sm mb-3">What agents use Agent API Gateway for</h1>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          High-intent workflows where URL + schema → validated JSON beats raw HTML parsing.
        </p>
        <ul className="space-y-3 mb-6">
          {USE_CASES.map((uc) => {
            const Icon = ICONS[uc.icon];
            const highlighted = uc.slug === 'price-intelligence';
            return (
              <li key={uc.slug} className={`surface p-4 flex gap-3 items-start ${highlighted ? 'border-l-3' : ''}`} style={{ borderLeftColor: highlighted ? 'var(--color-accent-base)' : 'transparent' }}>
                <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-accent-base)' }} />
                <div className="min-w-0 flex-1">
                  <Link to={`/use-cases/${uc.slug}`} className="link-accent text-sm font-medium">{uc.name}</Link>
                  <p className="text-caption mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{uc.summary}</p>
                </div>
                <Link to={`/use-cases/${uc.slug}`} className="text-xs link shrink-0">Open →</Link>
              </li>
            );
          })}
        </ul>
        <p className="text-caption mb-6" style={{ color: 'var(--color-text-tertiary)' }}>⚡ Price intelligence is our highest-converting use case — start there.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/login" className="btn btn-primary text-sm">Start free</Link>
          <Link to="/alternatives" className="btn btn-secondary text-sm">Compare alternatives</Link>
          <Link to="/mcp" className="btn btn-ghost text-sm">MCP</Link>
        </div>
      </div>
    </div>
  );
}

