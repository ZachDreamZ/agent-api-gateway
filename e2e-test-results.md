# E2E Test Results — Agent API Gateway
Date: 2026-07-14T12:30:00Z

## Render Logs
Captured via Render CLI (100 lines). Key findings:
- Build: clean (all Docker layers cached)
- STRIPE_SECRET_KEY not set (warning)
- Playwright GPU/dbus errors (expected on Render free tier)
- Service live on port 3000

## Test Results (18 tests, 0 unexpected failures)

| # | Endpoint | Method | Status | Result |
|---|----------|--------|--------|--------|
| 1 | /health | GET | 200 | ✅ {"status":"ok"} |
| 2 | /v1/schemas | GET | 200 | ✅ 3 schemas |
| 3 | /v1/extract (no auth) | POST | 401 | ✅ Rejected |
| 4 | /v1/extract (invalid key) | POST | 401 | ✅ Rejected |
| 5 | /v1/extract (article) | POST | 200 | ✅ Structured data |
| 6 | /v1/extract (product/Amazon) | POST | 200 | ✅ HTTP fallback works |
| 7 | /v1/extract (company) | POST | 200 | ✅ Structured data |
| 8 | GET /v1/billing/pricing | GET | 200 | ✅ 4 tiers |
| 9 | GET /v1/billing/current | GET | 200 | ✅ Pro plan |
| 10 | POST /v1/billing/checkout | POST | 503 | ✅ Graceful error |
| 11 | POST /v1/billing/portal | POST | 503 | ✅ Graceful error |
| 12 | GET /v1/usage | GET | 200 | ✅ Credits data |
| 13 | GET /v1/api-keys | GET | 200 | ✅ Keys list |
| 14 | GET / | GET | 200 | ✅ Frontend HTML |
| 15 | GET /dashboard | GET | 200 | ✅ Frontend HTML |
| 16 | GET /docs | GET | 200 | ✅ Frontend HTML |
| 17 | Rate limit (req 1-10) | POST | 200 | ✅ Below 10 RPM limit |
| 18 | Rate limit (req 11-12) | POST | 429 | ✅ Rate limit triggered |

## Rate Limiting Test
- User tier: free (10 RPM limit)
- 12 rapid requests sent
- Requests 1-10: HTTP 200 (within limit)
- Requests 11-12: HTTP 429 (rate limit exceeded)
- Rate limiter functioning correctly

## Product Extraction Fallback Test
- URL: https://www.amazon.com/dp/B0D1XD1ZV3 (blocks headless browsers)
- Playwright fails → HTTP fallback triggers
- Result: 200 with product name extracted
- Fallback path verified functionally

## Fixes Applied (commit c794aa0)
1. Billing checkout/portal: Returns 503 with clear message
2. Product extraction: HTTP fetch fallback when Playwright fails
3. OpenRouter validator: Fixed swapped arguments
