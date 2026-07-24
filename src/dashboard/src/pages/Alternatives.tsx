import { Link, useParams } from 'react-router-dom';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';
import { ArrowRight, Check, X } from 'lucide-react';

type Cell = boolean | string;

export type Alternative = {
  slug: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  summary: string;
  bestFor: string;
  rows: Array<{ feature: string; us: Cell; them: Cell }>;
  whenChooseUs: string[];
  whenChooseThem: string[];
};

export const ALTERNATIVES: Alternative[] = [
  {
    slug: 'firecrawl',
    name: 'Firecrawl',
    title: 'Firecrawl Alternative for AI Agents',
    description:
      'Compare Agent API Gateway vs Firecrawl for structured product, article, and company extraction with REST + MCP, free tier, and credit packs.',
    keywords: 'Firecrawl alternative, Firecrawl vs Agent API Gateway, MCP web scraping, structured extraction API',
    summary:
      'Firecrawl is a strong crawl/scrape platform. Agent API Gateway is a lighter agent-first extract API: URL + schema → validated JSON, with REST and a published MCP package.',
    bestFor: 'AI agents that need typed product/article/company fields without running a full crawl stack.',
    rows: [
      { feature: 'URL → validated JSON schemas', us: true, them: 'Partial / custom' },
      { feature: 'Built-in product / article / company schemas', us: true, them: false },
      { feature: 'MCP package (npm + registry)', us: true, them: true },
      { feature: 'Free tier + credit packs', us: true, them: 'Varies' },
      { feature: 'SSRF-guarded public URLs only', us: true, them: true },
      { feature: 'Full-site crawl orchestration', us: false, them: true },
      { feature: 'Agent-focused pricing from $1 packs', us: true, them: 'Varies' },
    ],
    whenChooseUs: [
      'You want product/article/company JSON with a stable schema contract',
      'You need a simple POST /v1/extract or MCP tools for Claude/Cursor',
      'You want free tier + cheap credit packs for agent bursts',
    ],
    whenChooseThem: [
      'You need large multi-page crawl jobs and site maps as the primary workflow',
      'You already standardized on Firecrawl SDKs and crawlers',
    ],
  },
  {
    slug: 'browse-ai',
    name: 'Browse AI',
    title: 'Browse AI Alternative for Structured Extraction',
    description:
      'Looking for a Browse AI alternative for agents? Agent API Gateway turns public product, article, and company pages into validated JSON via REST or MCP.',
    keywords: 'Browse AI alternative, Browse AI vs Agent API Gateway, web data API for agents',
    summary:
      'Browse AI is robot-builder friendly. Agent API Gateway is API-first for developers and AI agents that already know the URL and schema they need.',
    bestFor: 'Backend agents and apps that call APIs, not no-code robot builders.',
    rows: [
      { feature: 'REST extract API', us: true, them: true },
      { feature: 'MCP for Claude / Cursor', us: true, them: false },
      { feature: 'Schema-validated JSON', us: true, them: 'Varies' },
      { feature: 'No-code robot builder UI', us: false, them: true },
      { feature: 'Developer docs + OpenAPI-style contract', us: true, them: 'Partial' },
      { feature: 'Credit packs from $1', us: true, them: 'Varies' },
    ],
    whenChooseUs: [
      'Your agents call HTTPS endpoints or MCP tools',
      'You want typed schemas instead of training robots per site',
      'You need SSRF-safe public extraction only',
    ],
    whenChooseThem: [
      'Non-technical operators need a visual robot builder',
      'Monitoring UI and robot scheduling are the main product',
    ],
  },
  {
    slug: 'scrapy',
    name: 'Scrapy / custom scrapers',
    title: 'Scrapy Alternative for AI Agent Extraction',
    description:
      'Replace brittle Scrapy/custom scrapers with Agent API Gateway: managed public-page extraction, schema validation, SSRF protection, and MCP tools.',
    keywords: 'Scrapy alternative, custom scraper alternative, managed extraction API, AI agent scraping',
    summary:
      'Custom scrapers give full control and full maintenance. Agent API Gateway trades that for a managed extract path optimized for agents.',
    bestFor: 'Teams that want extraction without owning browser farms, selectors, and anti-bot ops.',
    rows: [
      { feature: 'Managed infrastructure', us: true, them: false },
      { feature: 'Schema contract for agents', us: true, them: 'DIY' },
      { feature: 'SSRF protection built-in', us: true, them: 'DIY' },
      { feature: 'MCP tools for agent hosts', us: true, them: false },
      { feature: 'Full crawl customization', us: false, them: true },
      { feature: 'Time-to-first-extract', us: 'Minutes', them: 'Days–weeks' },
    ],
    whenChooseUs: [
      'You need agent-ready JSON fast',
      'You do not want to maintain Playwright/Scrapy infra',
      'Public pages and fixed schemas cover your use case',
    ],
    whenChooseThem: [
      'You need deep multi-step login flows or private network access',
      'Extraction rules are highly site-specific and constantly changing',
    ],
  },
  {
    slug: 'browserless',
    name: 'Browserless / headless browsers',
    title: 'Browserless Alternative for Structured Data',
    description:
      'Browserless gives you browsers. Agent API Gateway gives agents structured fields from public URLs without running your own extraction pipeline.',
    keywords: 'Browserless alternative, headless browser alternative, structured extraction for agents',
    summary:
      'Headless browser APIs are infrastructure. Agent API Gateway is a productized extract layer on top of scraping + LLM validation.',
    bestFor: 'Teams that want the result JSON, not browser sessions.',
    rows: [
      { feature: 'Raw browser sessions', us: false, them: true },
      { feature: 'Structured extraction schemas', us: true, them: false },
      { feature: 'LLM + validation pipeline', us: true, them: 'DIY' },
      { feature: 'MCP package', us: true, them: false },
      { feature: 'Usage-based credit packs', us: true, them: 'Compute-based' },
    ],
    whenChooseUs: [
      'You want product/article/company JSON, not browser control',
      'Agents should call tools, not drive Chromium',
    ],
    whenChooseThem: [
      'You need full browser automation, screenshots, or interactive sessions',
    ],
  },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return <Check className="w-4 h-4 mx-auto" style={{ color: 'var(--color-success, var(--color-accent-base))' }} strokeWidth={2.5} />;
  }
  if (value === false) {
    return <X className="w-4 h-4 mx-auto" style={{ color: 'var(--color-text-disabled)' }} strokeWidth={2} />;
  }
  return (
    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
      {value}
    </span>
  );
}

function AlternativeDetail({ item }: { item: Alternative }) {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16">
        <BrandLockup variant="product" showOrgSubline to="/" />
        <SectionLabel>Comparisons</SectionLabel>
        <h1 className="text-display-sm mb-3">{item.name} alternative for AI agents</h1>
        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {item.summary}
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
          Best for: {item.bestFor}
        </p>

        <div className="table-wrap mb-8 overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className="py-2 pr-3 font-medium">Feature</th>
                <th className="py-2 px-2 font-medium text-center">Agent API Gateway</th>
                <th className="py-2 pl-2 font-medium text-center">{item.name}</th>
              </tr>
            </thead>
            <tbody>
              {item.rows.map((row) => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td className="py-2.5 pr-3" style={{ color: 'var(--color-text-secondary)' }}>{row.feature}</td>
                  <td className="py-2.5 px-2 text-center">
                    <CellValue value={row.us} />
                  </td>
                  <td className="py-2.5 pl-2 text-center">
                    <CellValue value={row.them} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-10">
          <div className="surface p-5">
            <h2 className="text-heading mb-3">Choose Agent API Gateway when</h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {item.whenChooseUs.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent-base)' }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface p-5">
            <h2 className="text-heading mb-3">Choose {item.name} when</h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {item.whenChooseThem.map((line) => (
                <li key={line} className="flex gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-text-disabled)' }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface surface-glow p-6 text-center mb-8">
          <h2 className="text-title mb-2">Try the agent-first extract path</h2>
          <p className="text-body mb-5" style={{ color: 'var(--color-text-secondary)' }}>
            Free tier, credit packs from $1, REST + MCP. Public URLs only.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/login" className="btn btn-primary text-sm">Start free</Link>
            <Link to="/mcp" className="btn btn-secondary text-sm">Install MCP</Link>
            <Link to="/docs" className="btn btn-ghost text-sm">Read docs</Link>
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
          <Link to="/alternatives" className="link-accent">All alternatives</Link>
          {' · '}
          <Link to="/" className="link-accent">Home</Link>
          {' · '}
          <Link to="/pricing" className="link-accent">Pricing</Link>
        </p>
      </div>
    </div>
  );
}

export default function Alternatives() {
  const { slug } = useParams<{ slug?: string }>();
  const item = slug ? ALTERNATIVES.find((a) => a.slug === slug) : undefined;

  useSEO({
    title: item ? item.title : slug ? 'Comparison not found' : 'Alternatives',
    description: item
      ? item.description
      : 'Compare Agent API Gateway with Firecrawl, Browse AI, Scrapy, and headless browser APIs. Structured extraction for AI agents via REST and MCP.',
    keywords: item
      ? item.keywords
      : 'Firecrawl alternative, Browse AI alternative, Scrapy alternative, AI agent extraction API',
    canonical: item
      ? `https://agentapigw.dpdns.org/alternatives/${item.slug}`
      : 'https://agentapigw.dpdns.org/alternatives',
  });

  if (slug && !item) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--color-bg-app)' }}>
        <div className="text-center">
          <h1 className="text-display-sm mb-3">Comparison not found</h1>
          <Link to="/alternatives" className="btn btn-primary text-sm">View all alternatives</Link>
        </div>
      </div>
    );
  }

  if (item) return <AlternativeDetail item={item} />;

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16">
        <BrandLockup variant="product" showOrgSubline to="/" />
        <SectionLabel>Comparisons</SectionLabel>
        <h1 className="text-display-sm mb-3">Agent API Gateway alternatives & comparisons</h1>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          High-intent pages for teams evaluating extraction stacks. Honest tradeoffs — when we win and when another tool is a better fit.
        </p>

        <ul className="space-y-3 mb-10">
          {ALTERNATIVES.map((alt) => (
            <li key={alt.slug} className="surface p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <Link to={`/alternatives/${alt.slug}`} className="link-accent text-sm font-medium">{alt.name} alternative</Link>
                <p className="text-caption mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{alt.bestFor}</p>
              </div>
              <Link to={`/alternatives/${alt.slug}`} className="text-xs link shrink-0">Compare →</Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <Link to="/login" className="btn btn-primary text-sm">Start free</Link>
          <Link to="/mcp" className="btn btn-secondary text-sm">MCP install</Link>
          <Link to="/pricing" className="btn btn-ghost text-sm">Pricing</Link>
          <Link to="/docs" className="btn btn-ghost text-sm">Docs</Link>
        </div>
      </div>
    </div>
  );
}
