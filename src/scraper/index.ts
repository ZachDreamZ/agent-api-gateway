import type { ExtractionSchema } from '../shared/types.js';
import { scrapeUrl, ScrapeError } from './playwright.js';
import { extractStructuredData, ExtractionError } from '../extraction/index.js';
import { getCache } from '../api/lib/cache.js';
import { CACHE_TTL_SECONDS } from '../shared/types.js';

// ─── Types ───

export interface PipelineOptions {
  waitFor?: string;
  country?: string;
  extractRaw?: boolean;
}

export interface PipelineResult {
  success: boolean;
  data: Record<string, unknown>;
  raw?: string;
  cached: boolean;
  latencyMs: number;
  error?: string;
}

// ─── Pipeline ───

export async function runExtractionPipeline(
  url: string,
  schema: ExtractionSchema,
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const start = Date.now();
  const cacheKey = buildCacheKey(url, schema);

  // 1. Check cache
  const cache = getCache();
  const cachedRaw = await cache.get(cacheKey);
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw) as Record<string, unknown>;
      return {
        success: true,
        data: parsed,
        cached: true,
        latencyMs: Date.now() - start,
      };
    } catch {
      // stale/invalid cache, continue
    }
  }

  // 2. Scrape (browser-like HTTP first → Playwright if thin; clean markdown for LLM)
  let scrapeLatency = 0;
  let contentForLlm: string;
  let finalUrl: string;

  try {
    const scrapeResult = await scrapeUrl(url, {
      waitFor: options.waitFor,
      country: options.country,
    });
    // Prefer Crawl4AI-style markdown; fall back to raw HTML if cleaner emptied the page
    contentForLlm =
      scrapeResult.markdown && scrapeResult.markdown.length > 80
        ? scrapeResult.markdown
        : scrapeResult.html;
    finalUrl = scrapeResult.finalUrl;
    scrapeLatency = scrapeResult.latencyMs;
  } catch (err) {
    return {
      success: false,
      data: {},
      cached: false,
      latencyMs: Date.now() - start,
      error: err instanceof ScrapeError ? err.message : `Scrape failed: ${err}`,
    };
  }

  // 3. Extract with LLM (clean content in, not full noisy DOM)
  try {
    const extractResult = await extractStructuredData({
      schema,
      html: contentForLlm,
      url: finalUrl,
      extractRaw: options.extractRaw,
    });

    // 4. Cache result
    await cache.set(cacheKey, JSON.stringify(extractResult.data), CACHE_TTL_SECONDS).catch(() => {});

    return {
      success: true,
      data: extractResult.data,
      raw: extractResult.raw,
      cached: false,
      latencyMs: scrapeLatency + extractResult.latencyMs,
    };
  } catch (err) {
    const message =
      err instanceof ExtractionError ? err.message : `Extraction failed: ${String(err)}`;

    return {
      success: false,
      data: {},
      cached: false,
      latencyMs: Date.now() - start,
      error: message,
    };
  }
}

// ─── Helper ───

function buildCacheKey(url: string, schema: ExtractionSchema): string {
  const normalized = url.replace(/\/$/, '').toLowerCase();
  return `extract:${schema}:${normalized}`;
}
