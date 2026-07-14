# Agent API Gateway — Node.js SDK

```bash
npm install @agent-api-gateway/sdk
```

## Quick Start

```typescript
import { AgentApi } from "@agent-api-gateway/sdk";

const api = new AgentApi(process.env.AGENT_API_KEY!);

// Extract product data
const product = await api.extractProduct("https://example.com/product/123");
console.log(product.name, product.price);

// Extract article
const article = await api.extractArticle("https://example.com/blog/post");
console.log(article.title, article.author);

// Extract company info
const company = await api.extractCompany("https://example.com/about");
console.log(company.name, company.funding_total);
```

## API

### `new AgentApi(apiKey, baseUrl?)`

Create a client. `baseUrl` defaults to `https://api.agent-api-gateway.dev/v1`.

### `extract(url, schema, options?)`

Generic extraction. Schema: `"product"` | `"article"` | `"company"`.
Options: `{ wait_for?: string, country?: string }`.

### `extractProduct(url, options?)` → `ProductData`
### `extractArticle(url, options?)` → `ArticleData`
### `extractCompany(url, options?)` → `CompanyData`
### `listSchemas()` → `SchemaInfo[]`
### `getUsage()` → `UsageInfo`

## Error Handling

```typescript
import { ApiError, AuthError, RateLimitError } from "@agent-api-gateway/sdk";

try {
  await api.extractProduct(url);
} catch (e) {
  if (e instanceof AuthError) console.error("Bad API key");
  if (e instanceof RateLimitError) console.error(`Wait ${e.retryAfter}s`);
  if (e instanceof ApiError) console.error(`API ${e.status}: ${e.message}`);
}
```

## Requirements

Node.js 18+ (uses native `fetch`).
