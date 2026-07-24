# Show HN draft (technical only)

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
