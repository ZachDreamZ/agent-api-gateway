/**
 * MCP setup utilities for Agent API Gateway.
 * Generates config snippets for Claude Desktop, Cursor, and VS Code.
 * Never embeds real API keys in docs — placeholders only.
 */

export interface McpGatewayConfig {
  apiBaseUrl?: string;
  /** Placeholder only in generated configs — user replaces with real key */
  apiKeyPlaceholder?: string;
}

export function getMcpStdioConfig(config: McpGatewayConfig = {}): object {
  const key = config.apiKeyPlaceholder || 'sk-your-api-key';
  return {
    mcpServers: {
      'agent-api-gateway': {
        command: 'npx',
        args: ['-y', 'agent-api-gateway-mcp'],
        env: {
          AGENT_API_KEY: key,
          API_BASE_URL: config.apiBaseUrl || 'https://agentapigw.dpdns.org/v1',
        },
      },
    },
  };
}

/** Cursor-style project config (.cursor/mcp.json) */
export function getCursorMcpConfig(config: McpGatewayConfig = {}): object {
  return getMcpStdioConfig(config);
}

/** VS Code Copilot mcp.json servers block */
export function getVscodeMcpConfig(config: McpGatewayConfig = {}): object {
  const key = config.apiKeyPlaceholder || 'sk-your-api-key';
  return {
    servers: {
      'agent-api-gateway': {
        type: 'stdio',
        command: 'npx',
        args: ['-y', 'agent-api-gateway-mcp'],
        env: {
          AGENT_API_KEY: key,
          API_BASE_URL: config.apiBaseUrl || 'https://agentapigw.dpdns.org/v1',
        },
      },
    },
  };
}

export function printMcpSetupInstructions(): void {
  const sample = JSON.stringify(getMcpStdioConfig(), null, 2);
  console.error(`
Agent API Gateway — MCP setup

1. Create an API key in the dashboard (https://agentapigw.dpdns.org/dashboard/api-keys)
2. Add this to Claude Desktop config (or Cursor .cursor/mcp.json):

${sample}

3. Never commit AGENT_API_KEY or .env files.

Tools: extract, extract_product, extract_article, extract_company, list_schemas, get_usage
`);
}

if (process.argv[1]?.includes('setup')) {
  printMcpSetupInstructions();
}
