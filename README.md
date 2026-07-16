# Agent API Gateway

**Structured web data for AI agents. One API call.**

Live product: **https://agent-api-gateway.onrender.com**

Agents send a URL + schema type, get clean JSON. No markdown, no raw HTML — just fields.

```bash
curl -X POST https://agent-api-gateway.onrender.com/v1/extract \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://store.com/product/123", "schema": "product"}'
```

```json
{ "name": "Wireless Headphones Pro", "price": 149.99, "currency": "USD", "in_stock": true }
```

## Pricing & how to buy

| Plan | Price | What you get | Buy |
|------|-------|--------------|-----|
| Free | $0 | 100 queries/mo, API keys, product/article schemas | [Dashboard](https://agent-api-gateway.onrender.com/dashboard) |
| **Starter Pack** | **$1 once** | Onboarding guide + live API access path | [Buy on Gumroad](https://shadowcraft41.gumroad.com/l/spwxix) · [Site /buy](https://agent-api-gateway.onrender.com/buy) |
| Hobby | $29/mo | 5,000 queries/mo | [Checkout](https://agent-api-gateway.onrender.com/buy?sku=hobby) |
| Pro | $99/mo | 25,000 queries/mo | [Checkout](https://agent-api-gateway.onrender.com/buy?sku=pro) |

Payments via **Polar** hosted checkout (card). After payment, use the dashboard to create API keys.

Public pricing API: `GET https://agent-api-gateway.onrender.com/v1/billing/pricing`

## Available schemas

| Schema | Returns |
|--------|---------|
| `product` | name, brand, price, currency, in_stock, rating, review_count, description, image, specs, availability |
| `article` | title, author, date, reading_time, excerpt, content_summary, topics |
| `company` | name, description, founded, size, funding_total, industry, location, competitors |

## Local development

```bash
cp .env.example .env
# Set DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY or OPENROUTER_API_KEY
# Optional for billing: POLAR_* product IDs + access token

npm install
npm run test:product
npm run dev:api
curl http://localhost:3000/health
```

## Architecture

```
Agent  POST /v1/extract { url, schema }
        Scraper fetches page HTML
        LLM extracts structured JSON
        Validator sanitizes business fields
        Cache result
        → { name, price, in_stock, ... }
```

## Docs

- [API reference](docs/api-reference.md)
- [Agent onboarding](docs/agent-onboarding.md)
- [Self-hosting](docs/self-hosting.md)

## Support

**xxtheshadowcraft+agentapi-support@gmail.com** — Polar public support email for NexusCore / Agent API Gateway.
