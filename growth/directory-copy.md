# Directory copy bank

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
