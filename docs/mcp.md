# MCP server

Agent API Gateway exposes a **stdio MCP server** for agent hosts (Claude Desktop, Cursor, VS Code Copilot).

**Install hub (website):** https://agentapigw.dpdns.org/mcp

## Tools

| Tool | Input | Notes |
|------|--------|--------|
| `extract` | `url`, `schema` | schema: `product` \| `article` \| `company` |
| `extract_product` | `url` | Product fields |
| `extract_article` | `url` | Article fields |
| `extract_company` | `url` | Company fields |
| `list_schemas` | — | Schema catalog |
| `get_usage` | — | Credits / tier for the key |

## Run locally

```bash
# from repo root
export AGENT_API_KEY=sk-your-key          # from dashboard; never commit
export API_BASE_URL=https://agentapigw.dpdns.org/v1
npm run mcp
```

### Verify tools

```bash
AGENT_API_KEY=sk-your-key npm run verify:mcp
```

This starts the stdio server, lists tools, and calls `list_schemas` against the live API.


## Install (published package)

```bash
npm i -g agent-api-gateway-mcp
# or one-shot
npx -y agent-api-gateway-mcp
```

- npm: https://www.npmjs.com/package/agent-api-gateway-mcp
- GitHub: https://github.com/ZachDreamZ/agent-api-gateway-mcp
- Official MCP Registry name: `io.github.ZachDreamZ/agent-api-gateway`

Search the registry:

```bash
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=agent-api-gateway"
```

## Client config (placeholder key only)

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

The published package is preferred for clients. Local `npm run mcp` remains available for development.

## Security

- Keys only in environment variables or host secret stores
- MCP tool errors redact bearer tokens and connection strings
- Do not log `AGENT_API_KEY`
- Respect [Acceptable Use](https://agentapigw.dpdns.org/aup) (no private network targets)
