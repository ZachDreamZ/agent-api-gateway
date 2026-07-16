# Agent API Gateway

**Structured web data for AI agents. One API call.**

Live product: **https://agentapigw.dpdns.org** (also https://agent-api-gateway.onrender.com)

Agents send a URL + schema type, get clean JSON. No markdown, no raw HTML — just fields.

```bash
curl -X POST https://agentapigw.dpdns.org/v1/extract \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://store.com/product/123", "schema": "product"}'
```

## Pricing & how to buy

| Plan | Price | What you get | Buy |
|------|-------|--------------|-----|
| Free | $0 | 100 queries/mo, API keys, product/article schemas | [Dashboard](https://agentapigw.dpdns.org/dashboard) |
| **Starter Pack** | **$1 once** | Onboarding guide + live API access path | [Buy $1](https://agentapigw.dpdns.org/buy) |
| Hobby | $29/mo | 5,000 queries/mo | [Checkout](https://agentapigw.dpdns.org/buy?sku=hobby) |
| Pro | $99/mo | 25,000 queries/mo | [Checkout](https://agentapigw.dpdns.org/buy?sku=pro) |

Payments via **Polar** hosted checkout (card). After payment, use the dashboard to create API keys.

Public checkout API: `POST /v1/billing/pricing/checkout` with `{"sku":"starter"}` → `{ url, session_id, amount_cents }`.

Public pricing API: `GET https://agentapigw.dpdns.org/v1/billing/pricing`

## Support

**Business support email:** `support@agentapigw.dpdns.org`  
Polar public support email for org **NexusCore** (domain matches organization website https://agentapigw.dpdns.org).

## Available schemas

| Schema | Returns |
|--------|---------|
| `product` | name, brand, price, currency, in_stock, rating, review_count, description, image, specs, availability |
| `article` | title, author, date, reading_time, excerpt, content_summary, topics |
| `company` | name, description, founded, size, funding_total, industry, location, competitors |

## Auth

- Email + password (Better Auth) with **required email verification**
- Password reset via email
- **GitHub OAuth** (optional): set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### Email verification

Email/password accounts must verify before a session is created.

1. Set `RESEND_API_KEY` (and optionally `EMAIL_FROM` on a verified domain).
2. On sign-up, Better Auth emails a one-hour verification link.
3. Unverified sign-in is blocked and can resend the link from `/login`.

Locally without Resend, verification links are printed to the API console (not production).

Create an OAuth App at https://github.com/settings/developers

| Field | Value |
|-------|--------|
| Homepage URL | `https://agentapigw.dpdns.org` |
| Authorization callback URL | `https://agentapigw.dpdns.org/api/auth/callback/github` |

Existing app (prod): Client ID `Ov23liFQUYnTkcewcq2W` → https://github.com/settings/applications/3733447  
Generate a client secret there (GitHub sudo may require password), then set both env vars on Render and restart.

`GET /health` includes `"github_oauth": true|false` so you can confirm config without leaking secrets.

## Local development

```bash
cp .env.example .env
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

## MCP server

```bash
export AGENT_API_KEY=sk-your-key   # from dashboard; never commit
export API_BASE_URL=https://agentapigw.dpdns.org/v1
npm run mcp
```

Tools: `extract`, `extract_product`, `extract_article`, `extract_company`, `list_schemas`, `get_usage`.  
Setup guide: [docs/mcp.md](docs/mcp.md)

## Legal

- [Privacy Policy](https://agentapigw.dpdns.org/privacy)
- [Terms of Service](https://agentapigw.dpdns.org/terms)
- [Acceptable Use Policy](https://agentapigw.dpdns.org/aup)

## Security hygiene

- `.env` is gitignored; use `.env.example` for placeholders only
- Never commit API keys, OAuth secrets, or database URLs
- `npm run check:secrets` scans tracked files for high-risk patterns
- Server/MCP errors redact secrets before logging or client responses

## Docs

- [API reference](docs/api-reference.md)
- [MCP server](docs/mcp.md)
- [Agent onboarding](docs/agent-onboarding.md)
- [Self-hosting](docs/self-hosting.md)
