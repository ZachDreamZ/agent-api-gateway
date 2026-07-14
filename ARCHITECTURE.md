# Agent API Gateway — Architecture Plan

AI agents query structured data from URLs via one API. Starts with **product data** extraction, expands to more schemas.

## Product Summary

```
Agent sends:   POST /v1/extract { url: "...", schema: "product" }
Agent gets:    { name, price, currency, inStock, rating, reviews, image, specs, availability }
```

No markdown parsing, no raw HTML. Agents get the fields they need in one call.

## Target Users

- AI coding agents (Claude Code, Cursor, Copilot) that need current product/commerce data
- Agent builders building shopping assistants, price trackers, research agents
- Developers who currently use Firecrawl + custom LLM extraction (two steps → one)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│             │     │              │     │               │     │              │
│   Agent     │────▶│  API Gateway │────▶│  Queue +      │────▶│  LLM         │
│  (Claude,   │     │  (Hono)      │     │  Workers      │     │  Extraction  │
│   Cursor)   │     │              │     │  (Playwright) │     │  (Claude)    │
│             │◀────│              │◀────│               │◀────│              │
└─────────────┘     └──────┬───────┘     └───────────────┘     └──────────────┘
                           │
                    ┌──────▼───────┐     ┌───────────────┐
                    │              │     │               │
                    │  Cache       │     │  Supabase     │
                    │  (Upstash)   │     │  (Auth, DB)   │
                    │              │     │               │
                    └──────────────┘     └───────────────┘

                    ┌──────────────┐
                    │              │
                    │  Stripe      │
                    │  (Billing)   │
                    │              │
                    └──────────────┘
```

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| API Framework | **Hono** (Node.js) | Lightweight, fast, works with Vercel Edge |
| Scraper | **Playwright** | JS rendering, reliable, one binary |
| LLM Extraction | **Claude API** (structured output) | Best structured JSON extraction |
| Queue | **Inngest** | Serverless queue, no infra to manage |
| Cache | **Upstash Redis** | Pay-per-use, fast TTL-based caching |
| Database | **Supabase (PostgreSQL)** | Auth + DB in one, generous free tier |
| Auth | **Supabase Auth** | API key management built-in |
| Payments | **Stripe** | SaaS billing, metered usage |
| Hosting | **Vercel (API) + Railway (Workers)** | Edge API + persistent scraper nodes |
| MCP Server | **MCP TypeScript SDK** | Agents discover the API automatically |

## API Design

### POST /v1/extract

```
POST /v1/extract
Authorization: Bearer sk-xxx
Content-Type: application/json

{
  "url": "https://example.com/product/123",
  "schema": "product",
  "options": {
    "wait_for": ".price",       // CSS selector to wait for
    "country": "us",            // locale hint
    "extract_raw": false        // return llm text too
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "Wireless Headphones Pro",
    "price": 149.99,
    "currency": "USD",
    "in_stock": true,
    "rating": 4.5,
    "review_count": 2341,
    "image": "https://.../product.jpg",
    "specs": {
      "battery": "30 hours",
      "weight": "250g",
      "color": "Black"
    },
    "availability": "In Stock, Ships in 24h",
    "brand": "AudioBrand"
  },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 4999
  },
  "cached": false,
  "latency_ms": 3420
}
```

### GET /v1/schemas

Lists available extraction schemas with their field definitions.

### POST /v1/mcp

MCP server endpoint — agents use `mcp.json` to auto-connect.

## Extraction Schemas (v1)

### `product`
- name, brand, price, currency, in_stock, rating, review_count, description, image, specs[], availability, shipping

### `article` (v1.1)
- title, author, date, reading_time, excerpt, content_summary, topics[]

### `company` (v1.1)
- name, description, founded, size, funding_total, industry, location, competitors[]

### `custom` (v1.2)
- User defines JSON schema, LLM extracts matching fields

## Build Plan

### Week 1: Core API + Extraction

```
Day 1-2:   Hono API + Supabase auth + API key management
Day 3-4:   Playwright scraper worker + Inngest queue
Day 5-6:   Claude structured extraction → product schema
Day 7:     Cache layer + error handling + rate limiting
```

**Milestone:** `curl` → structured product JSON.

### Week 2: Billing + Dashboard + MCP

```
Day 8-9:    Stripe metered billing + usage tracking
Day 10-11:  Dashboard (usage stats, API keys, billing)
Day 12-13:  MCP server + SDK packages (npm, pip)
Day 14:     Docs + landing page + deploy
```

**Milestone:** First paying customer can sign up, get key, and use it from Claude/Cursor.

### Week 3: Launch + Distribution

```
Day 15-16: Post on Reddit (r/SaaS, r/ClaudeAI, r/cursor, r/webdev)
Day 17:    Ship MCP server to public MCP registry
Day 18:    Create agent skill for auto-onboarding
Day 19-20: Monitor usage, fix bugs, optimize latency
Day 21:    Launch on Product Hunt + IH
```

## Pricing

| Tier | Queries/mo | Price | Target |
|------|-----------|-------|--------|
| Free | 100 | $0 | Tinkerers, agents evaluating |
| Hobby | 5,000 | $29/mo | Solo devs, indie hackers |
| Pro | 25,000 | $99/mo | Teams, agent builders |
| Scale | 100,000+ | Custom | Companies embedding in product |

## Distribution Channels (ranked)

1. **MCP Server** — agents auto-discover. One `mcp.json` config and Claude/Cursor start using it.
2. **Reddit** — r/ClaudeAI, r/cursor, r/webdev, r/SaaS — "built a thing that lets agents read any product page in one API call"
3. **Agent skills** — Claude Code skill, Cursor rule — auto-setup the API key
4. **Open source** — GitHub repo with the extraction engine. Free tier drives virality
5. **Build in public** — Twitter/X, IndieHackers

## Cost Model (per query)

| Service | Cost | Notes |
|---------|------|-------|
| Playwright run | ~$0.001 | Railway, 3s avg |
| Claude extraction | ~$0.003 | 500 input, 200 output tokens |
| Cache hit (no LLM) | ~$0.0001 | Redis |
| Total cost | ~$0.004 | ~$4/1K queries |

At $29/5K queries → **~69% margin**.

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Sites block scraping | Rotate user agents, respect robots.txt, proxy rotation (add later) |
| LLM cost overruns | Hard timeout on LLM calls, cache aggressively, set max retries |
| Competition | Start narrow (products), ship fast, build MCP distribution moat |
| Low quality extraction | Claude structured output is reliable. Add confidence scoring |
| Abuse | Rate limit per key, per IP. Kill free tier abuse fast |
