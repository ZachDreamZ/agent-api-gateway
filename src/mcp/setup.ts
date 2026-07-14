/**
 * MCP setup utilities for Agent API Gateway.
 * Generates mcp.json config that Claude Desktop and Cursor can consume.
 */

export interface McpGatewayConfig {
  apiBaseUrl: string;
  apiKey: string;
  mcpPort?: number;
}

export function getMcpConfigJson(config: McpGatewayConfig): object {
  const url = config.mcpPort
    ? `http://localhost:${config.mcpPort}`
    : config.apiBaseUrl.replace("/v1", "/mcp");

  return {
    mcpServers: {
      "agent-api-gateway": {
        url,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      },
    },
  };
}

export function printMcpSetupInstructions(): void {
  console.log(`
─━ Agent API Gateway — MCP Setup ━─────────────────────────

Claude Desktop:
  Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
  {
    "mcpServers": {
      "agent-api-gateway": {
        "command": "npx",
        "args": ["@agent-api-gateway/mcp-server"]
      }
    }
  }

Cursor:
  Add to .cursor/mcp.json in your project:
  {
    "mcpServers": {
      "agent-api-gateway": {
        "command": "npx",
        "args": ["@agent-api-gateway/mcp-server"]
      }
    }
  }

VSCode + Copilot:
  Add to .vscode/mcp.json:
  {
    "servers": {
      "agent-api-gateway": {
        "type": "stdio",
        "command": "npx",
        "args": ["@agent-api-gateway/mcp-server"]
      }
    }
  }

───────────────────────────────────────────────────────────`);
}
