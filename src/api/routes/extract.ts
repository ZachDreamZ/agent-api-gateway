import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import {
  TIER_LIMITS,
  CREDIT_COST_PER_QUERY,
  CACHE_TTL_SECONDS,
  type ExtractionSchema,
} from '../../shared/types.js';
import type { Cache } from '../lib/cache.js';
import { getCache } from '../lib/cache.js';
import { getSupabase } from '../lib/supabase.js';
import { runExtractionPipeline } from '../../scraper/index.js';

// ─── Zod Schemas ───

const extractBodySchema = z.object({
  url: z.string().url({ message: 'Invalid URL' }),
  schema: z.enum(['product', 'article', 'company']),
  options: z
    .object({
      wait_for: z.string().optional(),
      country: z.string().optional(),
      extract_raw: z.boolean().optional(),
    })
    .optional(),
});

// ─── Helpers ───

async function getMonthlyCreditsUsed(userId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('usage_logs')
    .select('credits_used')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    .eq('user_id', userId);

  if (error) {
    console.error('[quota] query failed:', error);
    return 0;
  }

  return (data ?? []).reduce((sum, row) => sum + (row.credits_used ?? 0), 0);
}

async function logUsage(opts: {
  userId: string;
  apiKeyId: string;
  endpoint: string;
  schema: string;
  url: string;
  cached: boolean;
  latencyMs: number;
  creditsUsed: number;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('usage_logs').insert({
    user_id: opts.userId,
    api_key_id: opts.apiKeyId,
    endpoint: opts.endpoint,
    schema: opts.schema,
    url: opts.url,
    cached: opts.cached,
    latency_ms: opts.latencyMs,
    credits_used: opts.creditsUsed,
  });
  if (error) {
    console.error('[usage] log insert failed:', error);
  }
}

// ─── Routes ───

const router = new Hono();

router.post('/extract', zValidator('json', extractBodySchema), async (c) => {
  const user = c.get('user');
  const apiKey = c.get('apiKey');
  const tier = c.get('tier');
  const body = c.req.valid('json');
  const startMs = Date.now();
  const endpoint = 'POST /v1/extract';

  try {
    // ── Quota check ──
    const usedThisMonth = await getMonthlyCreditsUsed(user.id);
    const monthlyLimit = TIER_LIMITS[tier].queries_per_month;
    const remaining = monthlyLimit - usedThisMonth;

    if (remaining <= 0) {
      return c.json(
        {
          success: false,
          error: 'Monthly quota exceeded',
          usage: { credits_used: usedThisMonth, credits_remaining: 0 },
        },
        429,
      );
    }

    // ── Cache lookup ──
    const cache: Cache = getCache();
    const cacheKey = `extract:${body.url}::${body.schema}`;
    const cachedRaw = await cache.get(cacheKey);

    if (cachedRaw) {
      const cachedData = JSON.parse(cachedRaw);
      const latencyMs = Date.now() - startMs;

      // Log cache-hit usage
      await logUsage({
        userId: user.id,
        apiKeyId: apiKey.id,
        endpoint,
        schema: body.schema,
        url: body.url,
        cached: true,
        latencyMs,
        creditsUsed: CREDIT_COST_PER_QUERY,
      });

      return c.json({
        success: true,
        data: cachedData,
        usage: { credits_used: CREDIT_COST_PER_QUERY, credits_remaining: remaining - CREDIT_COST_PER_QUERY },
        cached: true,
        latency_ms: latencyMs,
      });
    }

    // ── Run extraction pipeline synchronously ──
    const result = await runExtractionPipeline(body.url, body.schema as ExtractionSchema, {
      waitFor: body.options?.wait_for,
      country: body.options?.country,
      extractRaw: body.options?.extract_raw,
    });

    const latencyMs = Date.now() - startMs;

    // Cache result on success
    if (result.success && result.data) {
      await cache.set(cacheKey, JSON.stringify(result.data), CACHE_TTL_SECONDS).catch(() => {});
    }

    // Log usage
    await logUsage({
      userId: user.id,
      apiKeyId: apiKey.id,
      endpoint,
      schema: body.schema,
      url: body.url,
      cached: false,
      latencyMs,
      creditsUsed: CREDIT_COST_PER_QUERY,
    });

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error || 'Extraction failed',
          usage: { credits_used: CREDIT_COST_PER_QUERY, credits_remaining: remaining - CREDIT_COST_PER_QUERY },
          latency_ms: latencyMs,
        },
        502,
      );
    }

    return c.json({
      success: true,
      data: result.data,
      raw: result.raw || undefined,
      usage: { credits_used: CREDIT_COST_PER_QUERY, credits_remaining: remaining - CREDIT_COST_PER_QUERY },
      cached: result.cached,
      latency_ms: latencyMs,
    });
  } catch (err) {
    console.error('[extract] unexpected error:', err);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export { router as extractRoutes };
