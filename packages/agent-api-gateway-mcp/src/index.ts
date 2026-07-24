/**
 * Agent API Gateway — standalone MCP server (stdio)
 * Tools: extract, extract_product, extract_article, extract_company, list_schemas, get_usage
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE_URL = (process.env.API_BASE_URL || 'https://agentapigw.dpdns.org/v1').replace(/\/$/, '');
const API_KEY = process.env.AGENT_API_KEY || process.env.AGENTAPI_KEY || '';

function redactSecrets(input: string): string {
  return String(input)
    .replace(/\bBearer\s+[A-Za-z0-9._\-+=/]{8,}/gi, 'Bearer ***')
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, 'sk-***');
}

function safeErrorMessage(err: unknown, fallback = 'MCP tool failed'): string {
  if (err instanceof Error) return redactSecrets(err.message) || fallback;
  return redactSecrets(String(err)) || fallback;
}

if (!API_KEY) {
  console.error('[mcp] AGENT_API_KEY is not set. Tools that hit /v1/extract will fail with 401.');
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) h.Authorization = `Bearer ${API_KEY}`;
  return h;
}

async function callGateway(endpoint: string, body?: unknown): Promise<unknown> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: redactSecrets(text.slice(0, 500)) };
  }
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: unknown }).error)
        : text.slice(0, 300);
    throw new Error(redactSecrets(`API ${res.status}: ${msg}`));
  }
  return data;
}

const server = new Server(
  { name: 'agent-api-gateway', version: '1.3.0' },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: 'extract',
    description:
      'Extract structured data from a public URL. schema: product | article | company. Returns validated JSON fields.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Public https URL to extract from' },
        schema: {
          type: 'string',
          enum: ['product', 'article', 'company'],
          description: 'Extraction schema',
        },
        wait_for: { type: 'string', description: 'Optional CSS selector to wait for' },
        country: { type: 'string', description: 'Optional locale hint (e.g. us, de)' },
      },
      required: ['url', 'schema'],
    },
  },
  {
    name: 'extract_product',
    description: 'Extract product fields (name, price, stock, rating, variants) from a URL.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Product page URL' },
        wait_for: { type: 'string' },
        country: { type: 'string' },
      },
      required: ['url'],
    },
  },
  {
    name: 'extract_article',
    description: 'Extract article fields (title, author, date, topics, summary) from a URL.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Article URL' },
        wait_for: { type: 'string' },
      },
      required: ['url'],
    },
  },
  {
    name: 'extract_company',
    description: 'Extract company fields (name, description, location, industry) from a URL.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Company page URL' },
        wait_for: { type: 'string' },
      },
      required: ['url'],
    },
  },
  {
    name: 'list_schemas',
    description: 'List available extraction schemas and field definitions.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_usage',
    description: 'Return current plan tier, credits used, and credits remaining for this API key.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

const SCHEMA_MAP: Record<string, string> = {
  extract_product: 'product',
  extract_article: 'article',
  extract_company: 'company',
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;

  try {
    if (name === 'list_schemas') {
      const data = await callGateway('/schemas');
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    }

    if (name === 'get_usage') {
      const data = await callGateway('/usage');
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    }

    let schema = SCHEMA_MAP[name];
    if (name === 'extract') {
      schema = String(a.schema || '');
      if (!['product', 'article', 'company'].includes(schema)) {
        throw new Error('schema must be product, article, or company');
      }
    }
    if (!schema) throw new Error(`Unknown tool: ${name}`);

    const url = String(a.url || '');
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new Error('url must be an http(s) URL');
    }

    const result = (await callGateway('/extract', {
      url,
      schema,
      options: {
        wait_for: a.wait_for ? String(a.wait_for) : undefined,
        country: a.country ? String(a.country) : undefined,
      },
    })) as { data?: unknown };

    const payload = result?.data ?? result;
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text' as const, text: safeErrorMessage(err) }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp] agent-api-gateway-mcp stdio server ready');
}

main().catch((err) => {
  console.error('[mcp] fatal:', safeErrorMessage(err));
  process.exit(1);
});
