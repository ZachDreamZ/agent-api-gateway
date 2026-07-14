# Agent API Gateway — Agent Onboarding

> AI agents can auto-discover and use this API. Just fetch this file.

```bash
curl -s https://api.agent-api-gateway.dev/agent-onboarding.md
```

## MCP Server

The fastest way for AI agents to use Agent API Gateway is via MCP.

### Claude Code

```bash
claude mcp add agent-api-gateway -- npx @agent-api-gateway/mcp-server
```

Or add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "agent-api-gateway": {
      "command": "npx",
      "args": ["@agent-api-gateway/mcp-server"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "agent-api-gateway": {
      "command": "npx",
      "args": ["@agent-api-gateway/mcp-server"]
    }
  }
}
```

### VS Code + Copilot

Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "agent-api-gateway": {
      "type": "stdio",
      "command": "npx",
      "args": ["@agent-api-gateway/mcp-server"]
    }
  }
}
```

## Available Tools

Once connected, agents can call:

- `extract_product(url, wait_for?, country?)` — Extract product data from a URL
- `extract_article(url, wait_for?)` — Extract article data
- `extract_company(url, wait_for?)` — Extract company data
- `list_schemas()` — List all available schemas

## REST API

Agents can also call the REST API directly:

```
POST https://api.agent-api-gateway.dev/v1/extract
Authorization: Bearer sk-...
Content-Type: application/json

{
  "url": "https://example.com/product/123",
  "schema": "product",
  "options": {
    "wait_for": ".price",
    "country": "us"
  }
}
```

## Getting an API Key

Sign up at [app.agent-api-gateway.dev](https://app.agent-api-gateway.dev) or run:

```bash
curl -s https://api.agent-api-gateway.dev/agent-onboarding.md | grep "API_KEY"
```

The free tier includes 100 queries/month — no credit card required.
