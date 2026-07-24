from pathlib import Path

# Product Hunt launch pack + Show HN draft + expanded tracker statuses
ph = '''# Product Hunt Launch Pack

## Status
Blocked only on demo video + maker warm-up. Screenshots folder: growth/assets/

## Listing draft
- **Name:** Agent API Gateway
- **Tagline (<=60):** Structured web data for AI agents
- **Short description:** URL + schema turns public pages into validated JSON via REST or MCP.
- **Topics/tags:** artificial-intelligence, developer-tools, api, open-source, productivity
- **Links:**
  - Website: https://agentapigw.dpdns.org/
  - Docs: https://agentapigw.dpdns.org/docs
  - MCP: https://agentapigw.dpdns.org/mcp
  - Pricing: https://agentapigw.dpdns.org/pricing
  - GitHub MCP: https://github.com/ZachDreamZ/agent-api-gateway-mcp

## First maker comment
Built Agent API Gateway because agents should not babysit scrapers.

What it does:
- `POST /v1/extract` with product/article/company schemas
- MCP package for Cursor / Claude Desktop (`agent-api-gateway-mcp`)
- Free tier + credit packs from $1
- SSRF guard so only public URLs are allowed

Would love feedback on positioning:
1. Is "Firecrawl alternative for agents" clear?
2. Is MCP install the right primary CTA?
3. What schema would you add next?

## Gallery plan (1270x760)
1. Hero / landing
2. MCP install hub
3. Pricing
4. Alternatives comparison
5. Docs extract example
6. Dashboard API keys (optional after login screenshot)

## Launch timing
- Tue/Wed/Thu only
- 12:01 AM PT
- Warm account for 2–3 weeks first (comment on other launches)

## Still needed before submit
- [ ] 60–90s demo video (screen recording of MCP install + extract)
- [ ] Final PH gallery images from growth/assets
- [ ] Hunter optional
- [ ] Email/social warm list for first 2 hours
'''
Path('growth/product-hunt-pack.md').write_text(ph, encoding='utf-8')

hn = '''# Show HN draft (technical only)

## Title options
1. Show HN: Agent API Gateway – URL + schema to validated JSON for AI agents (REST + MCP)
2. Show HN: SSRF-safe structured extraction API with a published MCP package
3. Show HN: agent-api-gateway-mcp – give Cursor/Claude product/article/company extract tools

## Body
I built a small extraction API for agent workflows:

- Input: public URL + schema (product | article | company)
- Output: validated JSON fields
- Transports: REST and MCP (npx -y agent-api-gateway-mcp)
- Safety: SSRF guard blocks private/metadata hosts
- Pricing: free tier + cheap credit packs

Not trying to replace full crawl platforms. This is for the case where an agent already has a URL and needs typed fields.

Links:
- Site: https://agentapigw.dpdns.org/
- MCP hub: https://agentapigw.dpdns.org/mcp
- Install guide: https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor
- Firecrawl comparison: https://agentapigw.dpdns.org/alternatives/firecrawl

Curious what schemas people want next, and whether MCP-first packaging is useful vs REST-only.
'''
Path('growth/show-hn-draft.md').write_text(hn, encoding='utf-8')

subs = '''# Directory submission batch (ready-to-paste)

Submit manually where login is required. Use different long-form variants (do not identical-copy).

## 1) DevHunt
- URL: https://devhunt.org/submit
- Landing: https://agentapigw.dpdns.org/mcp
- Tagline: Structured web data for AI agents
- Description: Agent API Gateway is a developer extraction API for AI agents. Send a public URL + schema (product/article/company) and get validated JSON over REST or MCP. Includes free tier, credit packs from $1, and an SSRF guard for public URLs only.
- Tags: ai, api, developer-tools, mcp, scraping

## 2) SaaSHub
- URL: https://saashub.com/submit
- Landing: https://agentapigw.dpdns.org/alternatives/firecrawl
- Positioning: Firecrawl alternative for agent-first structured extraction
- Description: Looking for a Firecrawl alternative focused on agent workflows? Agent API Gateway returns typed product/article/company JSON via REST and a published MCP package. Free tier and $1 credit packs. Better for single-URL extract than full-site crawl jobs.

## 3) AlternativeTo
- URL: https://alternativeto.net/software/_/add/
- Landing: https://agentapigw.dpdns.org/alternatives
- Alternatives to claim: Firecrawl, Browse AI, Scrapy, Browserless
- Description: Structured extraction API for AI agents. URL + schema to validated JSON, with MCP install for Cursor/Claude.

## 4) TAAFT
- URL: https://theresanaiforthat.com/submit/
- Landing: https://agentapigw.dpdns.org/
- Description: AI-powered structured extraction API that turns public web pages into validated product, article, and company JSON for agents. REST + MCP, free tier, credit packs.

## 5) Futurepedia
- URL: https://www.futurepedia.io/submit-tool
- Landing: https://agentapigw.dpdns.org/pricing
- Pricing note: Free tier available; paid packs/plans listed on pricing page.

## 6) Glama / MCP registries
- Landing: https://agentapigw.dpdns.org/mcp
- Package: agent-api-gateway-mcp
- Registry: io.github.ZachDreamZ/agent-api-gateway
- Install: npx -y agent-api-gateway-mcp
- Env: AGENT_API_KEY, API_BASE_URL=https://agentapigw.dpdns.org/v1

## 7) Indie Hackers product
- URL: https://www.indiehackers.com/products
- Landing: https://agentapigw.dpdns.org/
- One-liner: Structured web data for AI agents (REST + MCP)

## 8) Show HN
- Use growth/show-hn-draft.md
- Only after technical angle is the lead (MCP/SSRF/schema contract)
'''
Path('growth/submission-batch.md').write_text(subs, encoding='utf-8')
print('launch packs written')
