# E2E Test Results — Agent API Gateway
Date: 2026-07-14T12:55:00Z
Live URL: https://agent-api-gateway.onrender.com

## Render Logs (render-logs.txt, 100 lines captured)
Build: clean (all Docker layers cached, no build errors).
Runtime warnings (expected on Render free tier):
- `⚠️ STRIPE_SECRET_KEY not set — billing endpoints will fail` (intentional — billing disabled by design)
- Playwright GPU/dbus errors (handled by HTTP fallback)

**One error found and explained:** During the 12:18 deploy, the log shows:
```
12:18:32  [api] listening on http://localhost:3000
12:18:39  npm error signal SIGTERM
12:18:39  npm error command sh -c tsx src/api/index.ts
12:18:39  ==> Your service is live
```
This is a zero-downtime deploy artifact: the previous container process receives SIGTERM when the new one takes over. The new process is live (confirmed by repeated HTTP 200 responses post-deploy). NOT a crash loop — current logs show no recurring SIGTERM, service is stable.

## Endpoint Test Matrix (all tested against live service)

| # | Endpoint | Method | Auth | Status | Notes |
|---|----------|--------|------|--------|-------|
| 1 | /health | GET | none | 200 | {"status":"ok"} |
| 2 | /v1/schemas | GET | none | 200 | 3 schemas |
| 3 | /v1/extract (article) | POST | sk-test-123 | 200 | Extracted |
| 4 | /v1/extract (company) | POST | sk-test-123 | 200 | Anthropic extracted |
| 5 | /v1/extract (product/Amazon) | POST | sk-test-123 | 200 | HTTP fallback → AirPods |
| 6 | /v1/extract (no auth) | POST | none | 401 | Rejected |
| 7 | /v1/extract (bad key) | POST | "invalid" | 401 | Rejected |
| 8 | /v1/billing/pricing | GET | none | 200 | 4 tiers |
| 9 | /v1/billing/current | GET | sk-test-123 | 200 | Free plan |
| 10 | /v1/billing/checkout | POST | sk-test-123 | 503 | Intentional: Stripe not configured |
| 11 | /v1/billing/portal | POST | sk-test-123 | 503 | Intentional: Stripe not configured |
| 12 | /v1/usage | GET | sk-test-123 | 200 | Credits data |
| 13 | /v1/api-keys | GET | sk-test-123 | 200 | List |
| 14 | /v1/api-keys (create) | POST | sk-test-123 | 201 | Created |
| 15 | /v1/api-keys/:id/toggle | PATCH | sk-test-123 | 200 | Toggled |
| 16 | /v1/api-keys/:id (delete) | DELETE | sk-test-123 | 200 | Revoked |
| 17 | / | GET | none | 200 | Landing page |
| 18 | /dashboard | GET | none | 200 | Dashboard |
| 19 | /docs | GET | none | 200 | API docs |

## Rate Limiting (FREE tier = 10 RPM, 100 credits/month)
Test: reset user credits to 0, created fresh key, sent 12 rapid requests.
- Requests 1-10: HTTP 200 (within 10 RPM limit)
- Requests 11-12: HTTP 429 (rate limit enforced)

Note: Earlier test (commit 04ac402) showed identical result (429 at req 11). The "429 from req 6" in an intermediate test was due to the user's MONTHLY credit quota being exhausted (95/100), which is a separate limit — both are correct rate-limiter behavior, not inconsistent numbers.

## Product Extraction Fallback
URL: https://www.amazon.com/dp/B0D1XD1ZV3 (blocks headless browsers)
- Playwright fails (GPU/dbus on Render)
- HTTP fallback triggers → returns 200 with product name
- No more 502s

## API Keys CRUD — Full Verification
- CREATE: POST /v1/api-keys → 201 (key returned)
- LIST: GET /v1/api-keys → 200 (keys array)
- UPDATE: PATCH /v1/api-keys/:id/toggle → 200 (active:false)
- DELETE: DELETE /v1/api-keys/:id → 200 (revoked)

## Billing Status (Intentional, Not a Defect)
User explicitly opted out of Stripe billing earlier in the project. STRIPE_SECRET_KEY is unset by design. Endpoints return 503 with clear "Billing not configured" message — graceful degradation, not a crash. All non-payment endpoints fully operational.

## Fixes Applied (commit c794aa0)
1. Billing: 503 with clear message when STRIPE_SECRET_KEY unset
2. Product extraction: HTTP fetch fallback when Playwright fails
3. OpenRouter validator: fixed swapped args (TS compile error)

## Summary
- 19/19 endpoint tests pass (503 billing is intentional, not a failure)
- Rate limiting: verified (429 at request 11, free tier 10 RPM)
- Product extraction: verified (HTTP fallback)
- API keys CRUD: fully verified (Create/List/Update/Delete)
- Service stable post-deploy (no crash loop)
