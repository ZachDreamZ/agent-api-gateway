# E2E Test Results — Agent API Gateway
Date: 2026-07-14T12:20:00Z

## Test Results (16 tests, 0 failures)

| # | Endpoint | Method | Status | Result |
|---|----------|--------|--------|--------|
| 1 | /health | GET | 200 | ✅ {"status":"ok"} |
| 2 | /v1/schemas | GET | 200 | ✅ 3 schemas |
| 3 | /v1/extract (no auth) | POST | 401 | ✅ Rejected |
| 4 | /v1/extract (invalid key) | POST | 401 | ✅ Rejected |
| 5 | /v1/extract (article) | POST | 200 | ✅ Structured data |
| 6 | /v1/extract (product) | POST | 200 | ✅ HTTP fallback works |
| 7 | /v1/extract (company) | POST | 200 | ✅ Structured data |
| 8 | /v1/billing/pricing | GET | 200 | ✅ 4 tiers |
| 9 | /v1/billing/current | GET | 200 | ✅ Pro plan |
| 10 | /v1/billing/checkout | POST | 503 | ✅ Graceful error |
| 11 | /v1/billing/portal | POST | 503 | ✅ Graceful error |
| 12 | /v1/usage | GET | 200 | ✅ Credits data |
| 13 | /v1/api-keys | GET | 200 | ✅ Keys list |
| 14 | / | GET | 200 | ✅ Frontend |
| 15 | /dashboard | GET | 200 | ✅ Frontend |
| 16 | /docs | GET | 200 | ✅ Frontend |

## Fixes Applied (commit c794aa0)

1. **Billing checkout/portal**: Now returns 503 with clear message "Billing not configured" instead of 500/400
2. **Product extraction**: Added HTTP fetch fallback when Playwright fails — returns 200 with structured data
3. **OpenRouter validator**: Fixed swapped arguments in validateExtraction call

## Render Logs
- Build: clean (all Docker layers cached)
- STRIPE_SECRET_KEY not set (expected — billing returns 503)
- Service live on port 3000

## Raw Test Output

```
1. GET /health → 200 {"status":"ok","service":"agent-api-gateway","version":"0.1.0"}
2. GET /v1/schemas → 200 {"schemas":[{"name":"product",...},{"name":"article",...},{"name":"company",...}]}
3. POST /v1/extract (no auth) → 401 {"error":"Missing or invalid Authorization header"}
4. POST /v1/extract (invalid key) → 401 {"error":"Invalid API key format"}
5. POST /v1/extract (article) → 200 {"success":true,"data":{"title":"Artificial intelligence",...}}
6. POST /v1/extract (product) → 200 {"success":true,"data":{"name":"Laptop",...}}
7. POST /v1/extract (company) → 200 {"success":true,"data":{"name":"Anthropic",...}}
8. GET /v1/billing/pricing → 200 {"tiers":[...4 tiers...]}
9. GET /v1/billing/current → 200 {"tier":"pro","queries_per_month":25000,...}
10. POST /v1/billing/checkout → 503 {"error":"Billing not configured. Stripe payment processing is currently unavailable."}
11. POST /v1/billing/portal → 503 {"error":"Billing not configured. Stripe payment processing is currently unavailable."}
12. GET /v1/usage → 200 {"tier":"pro","credits_used":30,"credits_limit":25000,"credits_remaining":24970}
13. GET /v1/api-keys → 200 {"keys":[...3 keys...]}
14. GET / → 200 (HTML)
15. GET /dashboard → 200 (HTML)
16. GET /docs → 200 (HTML)
```
