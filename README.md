# Agent API Gateway

**Structured web data for AI agents. One API call. $0 to run.**

Agents send a URL + schema type, get clean JSON. No markdown, no raw HTML — just fields.

```bash
curl -X POST http://localhost:3000/v1/extract \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://store.com/product/123", "schema": "product"}'
```

```json
{ "name": "Wireless Headphones Pro", "price": 149.99, "currency": "USD", "in_stock": true }
```

## Cost: $0/mo

| Service | Cost | Why |
|---------|------|-----|
| Gemini Flash 2.0 | **Free** | 1500 req/day for LLM extraction |
| Supabase Free | **Free** | 500MB DB, 50K users |
| In-memory cache | **Free** | No Redis needed |
| Hosting on Oracle VPS | **Free** | 4 ARM cores, 24GB RAM |

[Full self-hosting guide](docs/self-hosting.md)

## Quick Start (local dev)

```bash
# 1. Get a free Gemini API key
#    https://aistudio.google.com/apikey

# 2. Clone and install
git clone <repo> && cd agent-api-gateway
cp .env.example .env
# Edit .env — set GEMINI_API_KEY

# 3. Install + run
npm install
npx playwright install chromium
npm run dev:api

# 4. Test it
curl http://localhost:3000/health
```

## Architecture

```
Agent → POST /v1/extract { url, schema }
       → Playwright scrapes page HTML
       → Gemini Flash extracts structured JSON
       → Cache result for 1 hour
       → { name, price, in_stock, ... }
```

## Available Schemas

| Schema | Returns |
|--------|---------|
| `product` | name, brand, price, currency, in_stock, rating, review_count, description, image, specs, availability |
| `article` | title, author, date, reading_time, excerpt, content_summary, topics |
| `company` | name, description, founded, size, funding_total, industry, location, competitors |

## LLM Options

| Engine | Cost | Set env var |
|--------|------|-------------|
| **Gemini Flash 2.0** | **$0** (free tier) | `GEMINI_API_KEY=xxx` (default) |
| Claude Sonnet 4 | Paid (~$0.003/query) | `ANTHROPIC_API_KEY=xxx` + `EXTRACTION_LLM=claude` |

## Self-Host

```bash
# Deploy anywhere with Docker:
docker compose up -d --build
```

Full guide: [docs/self-hosting.md](docs/self-hosting.md)

## Modules

| Module | Location | What |
|--------|----------|------|
| API | `src/api/` | Hono HTTP server, auth, rate-limit, routes |
| Extraction | `src/extraction/` | Gemini Flash (default) or Claude extraction |
| Scraper | `src/scraper/` | Playwright browser pool, page scraping |
| Billing | `src/billing/` | Stripe integration, pricing config |
| Dashboard | `src/dashboard/` | React 19 SPA (usage stats, API key mgmt, billing) |
| MCP Server | `src/mcp/` | Claude/Cursor auto-discovery |
| SDK (Node) | `sdk/node/` | `AgentApi` typed client |
| SDK (Python) | `sdk/python/` | Python client with Pydantic models |
| Docs | `docs/` | API reference, extraction schemas, agent onboarding |

## License

MIT
