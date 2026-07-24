from pathlib import Path

blog = Path('src/dashboard/src/pages/Blog.tsx')
t = blog.read_text(encoding='utf-8')
marker = "  {\n    slug: 'rate-limiting-strategies-for-ai-agents',"
if "install-agent-api-gateway-mcp-in-cursor" in t:
    print('blog post already present')
else:
    post = '''  {
    slug: 'install-agent-api-gateway-mcp-in-cursor',
    title: 'Install Agent API Gateway MCP in Cursor (and Claude Desktop)',
    excerpt: 'A practical MCP install guide: one-click Cursor deeplink, npm package, registry entry, env vars, and first extract tool call for AI agents.',
    date: '2026-07-24',
    readTime: '6 min',
    tags: ['mcp', 'guides', 'agents'],
    content: `If you are wiring an AI agent to pull product, article, or company fields from public pages, you do not want a custom scraper farm. You want a tool the agent can call.

Agent API Gateway ships a published MCP package for that path: URL + schema → validated JSON.

## What you get

- **MCP tools** for structured extraction
- **REST fallback** via `POST /v1/extract`
- **Free tier + credit packs** for bursty agent workloads
- **SSRF-guarded public URLs only**

Install hub (copy/paste configs): https://agentapigw.dpdns.org/mcp

## Option A — Cursor one-click

Open the MCP install hub and use the Cursor deeplink. It pre-fills the package name and stdio config.

1. Go to `/mcp`
2. Click **Add to Cursor**
3. Set `AGENT_API_KEY` to your dashboard API key
4. Restart Cursor MCP servers if needed

## Option B — npm / npx

```bash
npx -y agent-api-gateway-mcp
```

Claude Desktop / Cursor style config:

```json
{
  "mcpServers": {
    "agent-api-gateway": {
      "command": "npx",
      "args": ["-y", "agent-api-gateway-mcp"],
      "env": {
        "AGENT_API_KEY": "sk-your-api-key",
        "API_BASE_URL": "https://agentapigw.dpdns.org/v1"
      }
    }
  }
}
```

Package: `agent-api-gateway-mcp`  
Registry: `io.github.ZachDreamZ/agent-api-gateway`

## First successful call

Use a public product URL and the built-in `product` schema:

```json
{
  "url": "https://example.com/product",
  "schema": "product"
}
```

You should get validated fields such as name, price, currency, and stock — not raw HTML.

## When MCP is the wrong tool

Choose a crawl platform (or keep Scrapy) when you need:

- multi-page site maps as the primary workflow
- private network / login-gated targets
- raw browser session control

For agent-first single-URL extraction, MCP + REST is the short path.

## Related pages

- MCP install hub: `/mcp`
- Pricing: `/pricing`
- Firecrawl alternative comparison: `/alternatives/firecrawl`
- Full docs: `/docs#mcp`
`,
  },
'''
    t = t.replace(marker, post + marker, 1)
    blog.write_text(t, encoding='utf-8')
    print('blog post inserted')

# RSS
rss_path = Path('src/dashboard/public/blog/rss.xml')
rss = rss_path.read_text(encoding='utf-8')
if 'install-agent-api-gateway-mcp-in-cursor' not in rss:
    item = '''<item>
<title>Install Agent API Gateway MCP in Cursor (and Claude Desktop)</title>
<link>https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor</link>
<guid isPermaLink="true">https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor</guid>
<pubDate>Thu, 24 Jul 2026 08:00:00 +0000</pubDate>
<description>A practical MCP install guide: one-click Cursor deeplink, npm package, registry entry, env vars, and first extract tool call for AI agents.</description>
<category>mcp</category><category>guides</category><category>agents</category>
</item>
'''
    rss = rss.replace('<lastBuildDate>Wed, 23 Jul 2026 08:00:00 +0000</lastBuildDate>', '<lastBuildDate>Thu, 24 Jul 2026 08:00:00 +0000</lastBuildDate>', 1)
    rss = rss.replace('<item>\n<title>Rate limiting strategies for AI agent APIs</title>', item + '<item>\n<title>Rate limiting strategies for AI agent APIs</title>', 1)
    rss_path.write_text(rss, encoding='utf-8')
    print('rss updated')
else:
    print('rss already has post')

# JSON feed
feed_path = Path('src/dashboard/public/blog/feed.json')
import json
feed = json.loads(feed_path.read_text(encoding='utf-8'))
if not any(i.get('id','').endswith('install-agent-api-gateway-mcp-in-cursor') for i in feed.get('items', [])):
    feed['items'].insert(0, {
        'id': 'https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor',
        'url': 'https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor',
        'title': 'Install Agent API Gateway MCP in Cursor (and Claude Desktop)',
        'summary': 'A practical MCP install guide: one-click Cursor deeplink, npm package, registry entry, env vars, and first extract tool call for AI agents.',
        'date_published': '2026-07-24T08:00:00Z',
        'authors': [{ 'name': 'NexusCore' }],
        'tags': ['mcp', 'guides', 'agents'],
    })
    feed_path.write_text(json.dumps(feed, indent=2) + '\n', encoding='utf-8')
    print('json feed updated')
else:
    print('json feed already has post')
