import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/v1";
const API_KEY = process.env.AGENT_API_KEY || "";

async function callGateway(endpoint: string, body?: unknown) {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

const server = new Server(
  { name: "agent-api-gateway", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "extract_product",
      description: "Extract structured product data from a URL. Returns name, price, currency, stock, rating, specs, and more.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Product page URL" },
          wait_for: { type: "string", description: "CSS selector to wait for before extracting" },
          country: { type: "string", description: "Locale hint (e.g. 'us', 'de', 'jp')" },
        },
        required: ["url"],
      },
    },
    {
      name: "extract_article",
      description: "Extract structured article data from a URL. Returns title, author, date, reading time, summary, topics.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Article URL" },
          wait_for: { type: "string", description: "CSS selector to wait for" },
        },
        required: ["url"],
      },
    },
    {
      name: "extract_company",
      description: "Extract structured company data from a URL. Returns name, description, founded, size, funding, industry, competitors.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Company page URL" },
          wait_for: { type: "string", description: "CSS selector to wait for" },
        },
        required: ["url"],
      },
    },
    {
      name: "list_schemas",
      description: "List all available extraction schemas with field descriptions and types.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

const SCHEMA_MAP: Record<string, string> = {
  extract_product: "product",
  extract_article: "article",
  extract_company: "company",
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_schemas") {
    const data = await callGateway("/schemas");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  const schema = SCHEMA_MAP[name];
  if (!schema) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const result = await callGateway("/extract", {
    url: args?.url,
    schema,
    options: {
      wait_for: args?.wait_for,
      country: args?.country,
    },
  });

  return {
    content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
  };
});

export function startMcpServer(port?: number) {
  if (port) {
    const { HttpServletTransport } = require("@modelcontextprotocol/sdk/server/http.js");
    const transport = new HttpServletTransport({ port });
    server.connect(transport);
    console.log(`MCP HTTP server listening on port ${port}`);
  } else {
    const transport = new StdioServerTransport();
    server.connect(transport);
    console.error("MCP stdio server running");
  }
}

if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : undefined;
  startMcpServer(port);
}
