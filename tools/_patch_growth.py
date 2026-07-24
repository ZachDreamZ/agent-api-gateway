from pathlib import Path
import csv

# Directory submission kit with product-ready copy variants
root = Path('growth')
root.mkdir(exist_ok=True)

readme = '''# Growth / Directory Submission Kit

Real traffic only: SEO destination pages first, then directory submissions for discovery + backlinks.

## Live destination pages (shipped)

- Home: https://agentapigw.dpdns.org/
- Pricing: https://agentapigw.dpdns.org/pricing
- MCP install hub: https://agentapigw.dpdns.org/mcp
- Alternatives index: https://agentapigw.dpdns.org/alternatives
- Firecrawl alternative: https://agentapigw.dpdns.org/alternatives/firecrawl
- Browse AI alternative: https://agentapigw.dpdns.org/alternatives/browse-ai
- Scrapy alternative: https://agentapigw.dpdns.org/alternatives/scrapy
- Browserless alternative: https://agentapigw.dpdns.org/alternatives/browserless
- MCP install guide: https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor
- Docs: https://agentapigw.dpdns.org/docs
- Terms / Privacy / AUP: /terms /privacy /aup

## Positioning (do not copy-paste the same long form everywhere)

### Startup / launch (Product Hunt, BetaList, DevHunt)
- Tagline: Structured web data for AI agents
- Short: URL + schema → validated JSON for agents
- Long: Agent API Gateway turns public product, article, and company pages into validated JSON for AI agents. Use REST or the published MCP package (Cursor / Claude Desktop). Free tier, credit packs from $1, SSRF-safe public URLs only.

### SaaS / alternatives directories (SaaSHub, AlternativeTo)
- Lead: Firecrawl / Browse AI alternative for agent-first extraction
- Emphasize schema contracts + MCP + cheap packs over full crawl stacks

### AI directories (TAAFT, Futurepedia, Toolify)
- Lead: AI-powered structured extraction API for agents
- Emphasize schemas, LLM validation, MCP tools

### Agent / MCP registries (Glama, MCP registry, APITracker)
- Lead: MCP-native structured extraction for public pages
- Package: agent-api-gateway-mcp
- Registry: io.github.ZachDreamZ/agent-api-gateway
- Install: npx -y agent-api-gateway-mcp
- Env: AGENT_API_KEY, API_BASE_URL=https://agentapigw.dpdns.org/v1

### Dev directories
- Lead: Hono + Better Auth + Polar extraction API with SSRF guard and schema validation

## Recommended first batch (this week)

1. DevHunt
2. SaaSHub
3. AlternativeTo
4. TAAFT
5. Futurepedia
6. Toolify / AI directories
7. Glama / MCP registry listings
8. Indie Hackers product page
9. Show HN only with a technical angle (MCP install / SSRF)

## Assets needed before flagship launches

- Pricing page: live
- Alternatives pages: live
- MCP page: live
- Logo / favicon: live
- Screenshots + 60–90s demo: still recommended before Product Hunt
- FAQ schema on landing: optional next polish

## Do not do

- Fake traffic / bot hits
- Duplicate long descriptions across every directory
- Submit before destination pages exist
'''
(root / 'README.md').write_text(readme, encoding='utf-8')

rows = [
    ['Directory','Tier','URL','Category','Positioning Variant','Preferred Landing URL','Status','Notes'],
    ['DevHunt','1','https://devhunt.org/submit','Launch','Dev','https://agentapigw.dpdns.org/mcp','Ready','Lead with MCP + REST extract'],
    ['SaaSHub','2','https://saashub.com/submit','SaaS','SaaS alternative','https://agentapigw.dpdns.org/alternatives/firecrawl','Ready','Position as Firecrawl alternative for agents'],
    ['AlternativeTo','2','https://alternativeto.net/software/_/add/','SaaS','SaaS alternative','https://agentapigw.dpdns.org/alternatives','Ready','List vs Firecrawl, Browse AI, Scrapy'],
    ['TAAFT','3','https://theresanaiforthat.com/submit/','AI','AI directory','https://agentapigw.dpdns.org/','Ready','AI extraction API framing'],
    ['Futurepedia','3','https://www.futurepedia.io/submit-tool','AI','AI directory','https://agentapigw.dpdns.org/pricing','Ready','Pricing page required'],
    ['Toolify','3','https://www.toolify.ai/','AI','AI directory','https://agentapigw.dpdns.org/','Ready','Check current submit form'],
    ['Glama MCP','4','https://glama.ai/mcp','Agent/MCP','Agent/MCP','https://agentapigw.dpdns.org/mcp','Ready','MCP package listing'],
    ['MCP Registry','4','https://registry.modelcontextprotocol.io/','Agent/MCP','Agent/MCP','https://agentapigw.dpdns.org/mcp','Live','io.github.ZachDreamZ/agent-api-gateway'],
    ['npm package page','4','https://www.npmjs.com/package/agent-api-gateway-mcp','Agent/MCP','Agent/MCP','https://agentapigw.dpdns.org/mcp','Live','Published package'],
    ['Indie Hackers','8','https://www.indiehackers.com/products','Community','Startup','https://agentapigw.dpdns.org/','Ready','Build-in-public + product page'],
    ['Product Hunt','1','https://www.producthunt.com/posts/new','Launch','Startup','https://agentapigw.dpdns.org/','Blocked','Need screenshots + demo video first'],
    ['Hacker News Show HN','1','https://news.ycombinator.com/submit','Launch','Dev','https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor','Ready','Only with technical MCP/SSRF angle'],
]

with (root / 'directory-tracker.csv').open('w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

copy = '''# Directory copy bank

## Shared facts
- Product: Agent API Gateway (NexusCore)
- One-liner: Structured web data for AI agents. URL + schema → validated JSON.
- Free tier: yes
- Credit packs: from $1
- MCP: agent-api-gateway-mcp
- Registry: io.github.ZachDreamZ/agent-api-gateway
- Site: https://agentapigw.dpdns.org/
- Docs: https://agentapigw.dpdns.org/docs
- MCP: https://agentapigw.dpdns.org/mcp
- Pricing: https://agentapigw.dpdns.org/pricing

## Startup short (60 chars)
Structured web data for AI agents (REST + MCP)

## AI directory short
AI extraction API: public URL → validated product/article/company JSON

## SaaS alternative short
Firecrawl alternative for agent-first structured extraction

## Agent/MCP short
MCP package for structured public-page extraction

## Long (startup, ~150 words)
Agent API Gateway turns public product, article, and company pages into validated JSON for AI agents. Call POST /v1/extract with a URL and schema, or install the published MCP package for Cursor and Claude Desktop. You get free tier access, credit packs for bursts, SSRF protection for public URLs only, and a simple schema contract instead of brittle HTML parsers. Use it when agents need clean fields — price, title, stock, author, company facts — without running a browser farm.

## Long (SaaS alternative)
Looking for a Firecrawl or Browse AI alternative for agent workflows? Agent API Gateway is agent-first: built-in product/article/company schemas, REST + MCP, free tier, and credit packs from $1. It is not a full-site crawl orchestrator. Choose it when you already know the URL and want typed JSON. Choose a crawl platform when multi-page site maps are the main job.

## Long (MCP/agent)
Agent API Gateway is an MCP-native extraction service for public web pages. Install with `npx -y agent-api-gateway-mcp`, set AGENT_API_KEY, and give Claude/Cursor tools that return validated JSON. Registry name: io.github.ZachDreamZ/agent-api-gateway. Install hub: https://agentapigw.dpdns.org/mcp
'''
(root / 'directory-copy.md').write_text(copy, encoding='utf-8')
print('growth kit written')
