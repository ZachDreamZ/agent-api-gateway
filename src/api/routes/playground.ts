import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { assertSafePublicUrl, resolveAndAssertSafe } from '../lib/ssrf.js';
import { getPool } from '../lib/db.js';

const bodySchema = z.object({
  url: z
    .string()
    .url({ message: 'Invalid URL' })
    .max(2048, { message: 'URL too long' })
    .refine((u) => assertSafePublicUrl(u).ok, {
      message: 'URL targets a blocked or private host',
    }),
  schema: z.enum(['product', 'article', 'company']),
});

const rateLimitMap = new Map<string, number[]>();
const demoCache = new Map<string, { data: Record<string, unknown>; at: number }>();

const CACHE_TTL = 5 * 60_000;
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 3;

/**
 * Fetch with manual redirect handling. Every redirect Location is re-checked
 * against the SSRF guard so a benign initial URL cannot 30x to an internal /
 * metadata target.
 */
async function fetchWithSafeRedirect(initialUrl: string, maxHops = 5): Promise<Response> {
  let current = initialUrl;
  for (let hop = 0; hop <= maxHops; hop++) {
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'AgentAPIGateway-Playground/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) break;
      const next = new URL(loc, current).toString();
      const check = assertSafePublicUrl(next);
      if (!check.ok) {
        throw new Error(`Blocked redirect target: ${check.error}`);
      }
      current = next;
      continue;
    }
    return res;
  }
  throw new Error('Too many redirects');
}

function getMeta(doc: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta\\s[^>]*property=["']og:${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta\\s[^>]*name=["'](?:twitter:)?${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta\\s[^>]*content=["']([^"']*)["'][^>]*property=["']og:${name}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = doc.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTitle(doc: string): string | null {
  const og = getMeta(doc, 'title');
  if (og) return og;
  const m = doc.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractDescription(doc: string): string | null {
  return getMeta(doc, 'description');
}

function extractImage(doc: string): string | null {
  return getMeta(doc, 'image');
}

function extractPrice(doc: string): number | null {
  const og = getMeta(doc, 'price:amount');
  if (og) {
    const n = parseFloat(og);
    if (!isNaN(n)) return n;
  }
  const m = doc.match(/"price"\s*:\s*([\d.]+)/i);
  if (m) {
    const n = parseFloat(m[1]);
    if (!isNaN(n)) return n;
  }
  const dollarMatch = doc.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (dollarMatch) {
    const n = parseFloat(dollarMatch[1].replace(',', ''));
    if (!isNaN(n)) return n;
  }
  return null;
}

function extractCurrency(doc: string): string | null {
  const og = getMeta(doc, 'price:currency');
  if (og) return og.toUpperCase();
  if (/\$/g.test(doc)) return 'USD';
  if (/€/g.test(doc)) return 'EUR';
  if (/£/g.test(doc)) return 'GBP';
  return 'USD';
}

function extractAvailability(doc: string): string | null {
  if (/in stock|in_stock|available/i.test(doc)) return 'in_stock';
  if (/out of stock|sold out|unavailable/i.test(doc)) return 'out_of_stock';
  return 'in_stock';
}

function extractTopics(doc: string): string[] {
  const keywords = getMeta(doc, 'keywords');
  if (keywords) {
    return keywords.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 6);
  }
  return [];
}

function schemaForProduct(doc: string, url: string): Record<string, unknown> {
  return {
    name: extractTitle(doc) ?? 'Untitled Product',
    brand: extractTitle(doc)?.split(/\s+/)[0] ?? null,
    price: extractPrice(doc),
    currency: extractCurrency(doc),
    in_stock: extractAvailability(doc) === 'in_stock',
    rating: null,
    review_count: null,
    description: extractDescription(doc),
    image: extractImage(doc),
    specs: {},
    availability: extractAvailability(doc),
  };
}

function schemaForArticle(doc: string, url: string): Record<string, unknown> {
  const author = getMeta(doc, 'author') ?? getMeta(doc, 'article:author') ?? null;
  const date = getMeta(doc, 'article:published_time') ?? getMeta(doc, 'date') ?? null;
  const wordCount = doc.split(/\s+/).length;
  return {
    title: extractTitle(doc) ?? 'Untitled Article',
    author,
    date,
    reading_time: wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 250)) : null,
    excerpt: extractDescription(doc),
    content_summary: null,
    topics: extractTopics(doc),
  };
}

function schemaForCompany(doc: string, url: string): Record<string, unknown> {
  const desc = extractDescription(doc);
  let location: string | null = null;
  const locMatch = doc.match(/ headquartered in ([A-Za-z\s,]+)\./i);
  if (locMatch) location = locMatch[1].trim();
  if (!location) location = getMeta(doc, 'location') ?? null;
  const founded = getMeta(doc, 'founded') ?? null;
  return {
    name: extractTitle(doc) ?? new URL(url).hostname,
    description: desc,
    founded,
    size: null,
    funding_total: null,
    industry: extractTopics(doc).join(', ') || null,
    location,
    competitors: [],
  };
}

const SCHEMA_BUILDERS: Record<string, (doc: string, url: string) => Record<string, unknown>> = {
  product: schemaForProduct,
  article: schemaForArticle,
  company: schemaForCompany,
};

const MOCK_URLS: Record<string, { schema: string; data: Record<string, unknown> }> = {
  'store.example.com/headphones': {
    schema: 'product',
    data: {
      name: 'Studio Headphones Pro',
      brand: 'Studio',
      price: 249.99,
      currency: 'USD',
      in_stock: true,
      rating: 4.7,
      review_count: 128,
      description: 'Premium wireless headphones with active noise cancellation and 40-hour battery life.',
      image: null,
      specs: { 'driver': '40mm', 'battery': '40h', 'bluetooth': '5.3' },
      availability: 'in_stock',
    },
  },
  'news.example.com/post/42': {
    schema: 'article',
    data: {
      title: 'Shipping agents that scrape less',
      author: 'Maya Chen',
      date: '2026-03-12',
      reading_time: 5,
      excerpt: 'Why the next generation of AI agents should depend on structured APIs instead of HTML parsing.',
      content_summary: 'A deep dive into the shift from scraping to structured data extraction for AI agents.',
      topics: ['agents', 'data', 'AI'],
    },
  },
  'example.com/about': {
    schema: 'company',
    data: {
      name: 'Nimbus Labs',
      description: 'Infrastructure for agent workflows. We build APIs that turn web pages into structured data for AI agents and automated pipelines.',
      founded: '2021',
      size: '5-10 employees',
      funding_total: null,
      industry: 'Developer tools, AI infrastructure',
      location: 'Remote',
      competitors: [],
    },
  },
};

const router = new Hono();

router.post('/', zValidator('json', bodySchema), async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const hits = (rateLimitMap.get(ip) ?? []).filter((t) => t > now - RATE_LIMIT_WINDOW);
  if (hits.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, hits);
    return c.json({ success: false, error: 'Rate limit exceeded. Try again in a moment.', data: null }, 429);
  }
  hits.push(now);
  rateLimitMap.set(ip, hits);

  const { url, schema } = c.req.valid('json');

  try {
    let data: Record<string, unknown>;
    let latencyMs: number;
    let fromCache = false;

    const cacheKey = `${schema}::${url}`;
    const cached = demoCache.get(cacheKey);
    if (cached && now - cached.at < CACHE_TTL) {
      data = cached.data;
      latencyMs = 0;
      fromCache = true;
    } else {
      const parsed = new URL(url);

      // Check mock URLs first (docs-only examples)
      const hostPath = parsed.hostname + parsed.pathname.replace(/\/$/, '');
      const mockKey = Object.keys(MOCK_URLS).find((k) => hostPath.includes(k));
      if (mockKey && MOCK_URLS[mockKey].schema === schema) {
        data = MOCK_URLS[mockKey].data;
        latencyMs = schema === 'product' ? 1842 : schema === 'article' ? 1621 : 2014;
      } else {
        const start = Date.now();
        let html: string;
        try {
          // Re-validate the resolved host (guards DNS-rebinding) then fetch
          // with manual redirect handling so every hop is SSRF-checked.
          const safe = await resolveAndAssertSafe(url);
          if (!safe.ok) {
            return c.json({ success: false, error: safe.error, data: null }, 422);
          }
          const finalRes = await fetchWithSafeRedirect(safe.url.toString());
          if (!finalRes.ok) {
            return c.json({
              success: false,
              error: 'Could not fetch the URL. Make sure the site is accessible.',
              data: null,
            }, 422);
          }
          html = (await finalRes.text()).slice(0, 100_000);
        } catch {
          return c.json({
            success: false,
            error: 'Could not fetch the URL. Make sure the site is accessible.',
            data: null,
          }, 422);
        }
        const builder = SCHEMA_BUILDERS[schema];
        data = builder(html, url);
        latencyMs = Date.now() - start;
      }

      demoCache.set(cacheKey, { data, at: now });
    }

    return c.json({
      success: true,
      data,
      cached: fromCache,
      latency_ms: latencyMs,
      preview: true,
    });
  } catch {
    return c.json({
      success: false,
      error: 'Something went wrong. Try a different URL.',
      data: null,
    }, 500);
  }
});

export { router as playgroundRoutes };
