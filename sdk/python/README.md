# Agent API Gateway — Python SDK

```bash
pip install agent-api-gateway
```

## Quick Start

```python
from agent_api import AgentApi

api = AgentApi(api_key="sk-...")

# Extract product data
product = api.extract_product("https://example.com/product/123")
print(product.name, product.price)

# Extract article
article = api.extract_article("https://example.com/blog/post")
print(article.title, article.author)

# Extract company info
company = api.extract_company("https://example.com/about")
print(company.name, company.funding_total)
```

## API

### `AgentApi(api_key, base_url?)`

Create a client. `base_url` defaults to `https://api.agent-api-gateway.dev/v1`.

### `extract(url, schema, wait_for=None, country=None)` → `ExtractResponse`

### `extract_product(url, wait_for=None, country=None)` → `ProductData`
### `extract_article(url, wait_for=None)` → `ArticleData`
### `extract_company(url, wait_for=None)` → `CompanyData`
### `list_schemas()` → `list[SchemaInfo]`
### `get_usage()` → `UsageInfo`

## Error Handling

```python
from agent_api import AuthError, RateLimitError, ApiError

try:
    product = api.extract_product(url)
except AuthError:
    print("Bad API key")
except RateLimitError as e:
    print(f"Wait {e.retry_after}s")
except ApiError as e:
    print(f"API {e.status}: {e}")
```

## Requirements

Python 3.10+, httpx, pydantic.
