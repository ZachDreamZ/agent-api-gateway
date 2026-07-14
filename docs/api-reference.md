# API Reference

**Base URL:** `https://api.agent-api-gateway.dev/v1`

All requests require an API key in the `Authorization` header:

```
Authorization: Bearer sk-<your-api-key>
```

---

## POST /v1/extract

Extract structured data from a URL.

### Request

```json
{
  "url": "https://example.com/product/123",
  "schema": "product",
  "options": {
    "wait_for": ".price",
    "country": "us",
    "extract_raw": false
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | Full URL to extract from |
| `schema` | string | ✅ | One of: `product`, `article`, `company` |
| `options.wait_for` | string | ❌ | CSS selector to wait for before extraction |
| `options.country` | string | ❌ | Locale hint (`us`, `de`, `jp`, etc.) |
| `options.extract_raw` | boolean | ❌ | Include raw LLM extraction text |

### Response

```json
{
  "success": true,
  "data": { ... },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 4999
  },
  "cached": false,
  "latency_ms": 3420
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether extraction succeeded |
| `data` | object | Structured data (varies by schema) |
| `usage.credits_used` | number | Credits charged for this request |
| `usage.credits_remaining` | number | Credits left in billing period |
| `cached` | boolean | Whether response was served from cache |
| `latency_ms` | number | Total response time in milliseconds |

### Schema-specific `data` shapes

See [Extraction Schemas](extraction-schemas.md) for full field definitions.

---

## GET /v1/schemas

List all available extraction schemas.

### Response

```json
[
  {
    "name": "product",
    "description": "Extract product information from e-commerce pages",
    "fields": [
      { "name": "name", "type": "string", "description": "Product name" },
      { "name": "price", "type": "number", "description": "Product price" }
    ]
  }
]
```

---

## GET /v1/usage

Get current billing period usage.

### Response

```json
{
  "queries_used": 42,
  "queries_limit": 5000,
  "remaining": 4958,
  "tier": "hobby",
  "requests_by_schema": {
    "product": 35,
    "article": 7
  }
}
```

---

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `invalid_request` | Missing or invalid parameters |
| 401 | `invalid_api_key` | API key missing or invalid |
| 402 | `quota_exceeded` | Monthly quota exhausted |
| 429 | `rate_limit_exceeded` | Too many requests. Check `Retry-After` header |
| 500 | `extraction_failed` | Page could not be extracted |
| 502 | `upstream_error` | Upstream service failed |

---

## Rate Limits

| Tier | Requests/min | Concurrent |
|------|-------------|------------|
| Free | 10 | 1 |
| Hobby | 60 | 5 |
| Pro | 300 | 20 |
| Scale | 1000+ | 100+ |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## Caching

Extractions are cached for 1 hour. Cache hits return in ~100ms and don't consume extraction credits. Force a fresh extraction by adding `?fresh=true` to the request.

---

## SDKs

- [Node.js SDK](https://www.npmjs.com/package/@agent-api-gateway/sdk)
- [Python SDK](https://pypi.org/project/agent-api-gateway/)
