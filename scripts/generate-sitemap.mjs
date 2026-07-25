import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://agentapigw.dpdns.org';

// ─── All public routes ─────────────────────────────────────────────────

const STATIC_ROUTES = [
  { path: '/',                    priority: 1.0, changefreq: 'weekly' },
  { path: '/docs',               priority: 0.9, changefreq: 'weekly' },
  { path: '/mcp',                priority: 0.9, changefreq: 'weekly' },
  { path: '/pricing',            priority: 0.9, changefreq: 'weekly' },
  { path: '/blog',               priority: 0.8, changefreq: 'weekly' },
  { path: '/agents',             priority: 0.85, changefreq: 'monthly' },
  { path: '/for-agents',         priority: 0.7, changefreq: 'monthly' },
  { path: '/alternatives',       priority: 0.9, changefreq: 'weekly' },
  { path: '/use-cases',          priority: 0.85, changefreq: 'weekly' },
  { path: '/terms',              priority: 0.3, changefreq: 'yearly' },
  { path: '/privacy',            priority: 0.3, changefreq: 'yearly' },
  { path: '/aup',                priority: 0.3, changefreq: 'yearly' },
];

const SUB_PAGES = [
  // Alternatives comparison pages
  { path: '/alternatives/firecrawl',   priority: 0.85, changefreq: 'monthly' },
  { path: '/alternatives/browse-ai',   priority: 0.85, changefreq: 'monthly' },
  { path: '/alternatives/scrapy',      priority: 0.8, changefreq: 'monthly' },
  { path: '/alternatives/browserless', priority: 0.8, changefreq: 'monthly' },

  // Use case pages
  { path: '/use-cases/price-intelligence',   priority: 0.8, changefreq: 'monthly' },
  { path: '/use-cases/content-research',      priority: 0.8, changefreq: 'monthly' },
  { path: '/use-cases/company-enrichment',    priority: 0.8, changefreq: 'monthly' },
  { path: '/use-cases/mcp-agents',           priority: 0.8, changefreq: 'monthly' },
];

const BLOG_POSTS = [
  { slug: 'structured-data-for-ai-agents',                        lastmod: '2026-07-15' },
  { slug: 'ssrf-protection-for-extraction-apis',                  lastmod: '2026-07-10' },
  { slug: 'choosing-extraction-schema',                           lastmod: '2026-07-05' },
  { slug: 'agent-api-gateway-gets-premium-ui-code-splitting-and-seo', lastmod: '2026-07-22' },
  { slug: 'install-agent-api-gateway-mcp-in-cursor',              lastmod: '2026-07-24' },
  { slug: 'rate-limiting-strategies-for-ai-agents',               lastmod: '2026-07-23' },
];

function buildUrl(loc, priority, changefreq, lastmod) {
  return [
    '  <url>',
    '    <loc>' + loc + '</loc>',
    '    <lastmod>' + lastmod + '</lastmod>',
    '    <changefreq>' + changefreq + '</changefreq>',
    '    <priority>' + priority + '</priority>',
    '  </url>',
  ].join('\n');
}

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  // Static pages — use today as lastmod
  for (const r of STATIC_ROUTES) {
    lines.push(buildUrl(BASE_URL + r.path, r.priority, r.changefreq, today));
  }

  // Sub-pages — use today as lastmod
  for (const r of SUB_PAGES) {
    lines.push(buildUrl(BASE_URL + r.path, r.priority, r.changefreq, today));
  }

  // Blog posts — use their publication date as lastmod
  for (const post of BLOG_POSTS) {
    lines.push(buildUrl(
      BASE_URL + '/blog/' + post.slug,
      0.7,
      'monthly',
      post.lastmod,
    ));
  }

  lines.push('</urlset>');
  
  const outputPath = path.join(__dirname, '..', 'dist', 'sitemap.xml');
  fs.writeFileSync(outputPath, lines.join('\n') + '\n');
  console.log('Sitemap generated at ' + outputPath + ' (' + (STATIC_ROUTES.length + SUB_PAGES.length + BLOG_POSTS.length) + ' URLs)');
}

generateSitemap();