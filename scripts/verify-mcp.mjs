import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'src/mcp/index.ts'],
  env: {
    ...process.env,
    AGENT_API_KEY: process.env.AGENT_API_KEY || 'sk-smoke-invalid',
    API_BASE_URL: process.env.API_BASE_URL || 'https://agentapigw.dpdns.org/v1',
  },
});
const client = new Client({ name: 'verify-mcp', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const tools = await client.listTools();
const names = tools.tools.map((t) => t.name);
const required = ['extract', 'extract_product', 'extract_article', 'extract_company', 'list_schemas', 'get_usage'];
const missing = required.filter((n) => !names.includes(n));
if (missing.length) {
  console.error('FAIL missing tools', missing);
  process.exit(1);
}
const schemas = await client.callTool({ name: 'list_schemas', arguments: {} });
const text = schemas.content?.find?.((c) => c.type === 'text')?.text || JSON.stringify(schemas);
if (!text.includes('product') || !text.includes('article')) {
  console.error('FAIL list_schemas unexpected', text.slice(0, 200));
  process.exit(1);
}
console.log('PASS mcp tools:', names.join(', '));
await client.close();
process.exit(0);
