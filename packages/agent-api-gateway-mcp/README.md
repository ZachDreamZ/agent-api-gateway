# agent-api-gateway-mcp

MCP server for [Agent API Gateway](https://agentapigw.dpdns.org) — extract structured JSON from public URLs for AI agents.

## Install

```bash
npm i -g agent-api-gateway-mcp
# or run without install
npx -y agent-api-gateway-mcp
```

## Claude Desktop / Cursor config

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

Get an API key at https://agentapigw.dpdns.org/dashboard/api-keys

## Tools

| Tool | Description |
|------|-------------|
| `extract` | Extract with schema `product` \| `article` \| `company` |
| `extract_product` | Product fields |
| `extract_article` | Article fields |
| `extract_company` | Company fields |
| `list_schemas` | Schema catalog |
| `get_usage` | Credits / tier |

## Env

- `AGENT_API_KEY` (required) — API key from dashboard
- `API_BASE_URL` (optional) — defaults to `https://agentapigw.dpdns.org/v1`

## License

MIT
