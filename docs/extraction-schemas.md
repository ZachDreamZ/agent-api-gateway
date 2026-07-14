# Extraction Schemas

## `product` — E-commerce Product Data

Extract product information from any product page, store, or marketplace listing.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name/title |
| `brand` | string | Brand or manufacturer |
| `price` | number | Current price (numeric only) |
| `currency` | string | Currency code (USD, EUR, GBP, etc.) |
| `in_stock` | boolean | Whether product is currently in stock |
| `rating` | number | Average rating (0-5 scale) |
| `review_count` | number | Number of reviews |
| `description` | string | Product description text |
| `image` | string | Main product image URL |
| `specs` | object | Key-value pairs of product specifications |
| `availability` | string | Availability text (e.g. "In Stock", "Ships in 24h") |

### Example

```json
{
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "brand": "Sony",
  "price": 349.99,
  "currency": "USD",
  "in_stock": true,
  "rating": 4.6,
  "review_count": 12543,
  "description": "Industry-leading noise canceling...",
  "image": "https://example.com/image.jpg",
  "specs": {
    "battery": "30 hours",
    "weight": "250g",
    "color": "Black"
  },
  "availability": "In Stock"
}
```

---

## `article` — Article/News Data

Extract article content and metadata from blog posts, news articles, and documentation.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article headline |
| `author` | string | Author name |
| `date` | string | Publication date |
| `reading_time` | number | Estimated reading time in minutes |
| `excerpt` | string | Short description or excerpt |
| `content_summary` | string | 2-3 sentence summary of content |
| `topics` | array | List of topic tags |

### Example

```json
{
  "title": "How AI is Transforming Web Scraping",
  "author": "Jane Smith",
  "date": "2026-07-14",
  "reading_time": 8,
  "excerpt": "AI-powered extraction is making traditional scraping obsolete...",
  "content_summary": "The article discusses how LLMs can extract structured data from unstructured web pages, reducing development time and improving accuracy.",
  "topics": ["AI", "Web Scraping", "Data Extraction"]
}
```

---

## `company` — Company/Business Data

Extract company information from about pages, Crunchbase, LinkedIn, or company websites.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Company name |
| `description` | string | Company description |
| `founded` | string | Founding year/date |
| `size` | string | Employee count range |
| `funding_total` | string | Total funding amount |
| `industry` | string | Industry category |
| `location` | string | Headquarters location |
| `competitors` | array | List of competitor names |

### Example

```json
{
  "name": "Acme Corp",
  "description": "Acme Corp provides enterprise AI solutions...",
  "founded": "2020",
  "size": "51-200 employees",
  "funding_total": "$12.5M",
  "industry": "Artificial Intelligence",
  "location": "San Francisco, CA",
  "competitors": ["Competitor A", "Competitor B"]
}
```

---

## Tips for Better Extraction

1. **Use `wait_for`** — If the page loads content dynamically, pass a CSS selector for a known element to wait for: `".product-price"`, `"[data-product]"`, etc.
2. **Country hints** — For region-specific pricing, pass `country: "de"` or `country: "jp"`.
3. **URL quality** — Direct product/article URLs work best. Avoid search results or category pages.
4. **Cache busting** — Add `?fresh=true` to force a fresh extraction (costs credits).
