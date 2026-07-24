from pathlib import Path

# --- sitemap ---
sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://agentapigw.dpdns.org/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/docs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/mcp</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/pricing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/agents</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/for-agents</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/alternatives</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/alternatives/firecrawl</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/alternatives/browse-ai</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/alternatives/scrapy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/alternatives/browserless</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor</loc>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog/rate-limiting-strategies-for-ai-agents</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>2026-07-23</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog/agent-api-gateway-gets-premium-ui-code-splitting-and-seo</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>2026-07-22</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog/structured-data-for-ai-agents</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>2026-07-15</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog/ssrf-protection-for-extraction-apis</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>2026-07-10</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/blog/choosing-extraction-schema</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>2026-07-05</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>2026-01-15</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>2026-01-15</lastmod>
  </url>
  <url>
    <loc>https://agentapigw.dpdns.org/aup</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>2026-01-15</lastmod>
  </url>
</urlset>
'''
Path('src/dashboard/public/sitemap.xml').write_text(sitemap, encoding='utf-8')

# --- robots ---
robots = '''User-agent: *
Allow: /

# Public product + discovery surfaces
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /for-agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

# Auth / app surfaces (noindex-friendly but crawlable home is enough)
Disallow: /dashboard
Disallow: /login
Disallow: /auth
Disallow: /reset-password

Sitemap: https://agentapigw.dpdns.org/sitemap.xml

# AI crawlers — allow discovery pages
User-agent: GPTBot
Allow: /
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

User-agent: Claude-Web
Allow: /
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

User-agent: ChatGPT-User
Allow: /
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

User-agent: anthropic-ai
Allow: /
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

User-agent: cohere-ai
Allow: /
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

User-agent: Perplexitybot
Allow: /
Allow: /docs
Allow: /blog
Allow: /agents
Allow: /mcp
Allow: /pricing
Allow: /alternatives

# Block aggressive scrapers
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: DotBot
Disallow: /

Crawl-delay: 1
'''
Path('src/dashboard/public/robots.txt').write_text(robots, encoding='utf-8')
print('sitemap + robots updated')
