import type { ExtractionSchema } from '../shared/types.js';
import { extractStructuredData as extractWithClaude } from './claude.js';
import { extractWithGemini } from './gemini.js';
import { extractWithOpenRouter } from './openrouter.js';

// ─── LLM Router ───
// Priority: openrouter > gemini > claude.
// Configure via EXTRACTION_LLM env var (gemini, claude, or openrouter).

export type ExtractionEngine = 'gemini' | 'claude' | 'openrouter';

function resolveEngine(schema?: ExtractionSchema): ExtractionEngine {
  const envVal = process.env['EXTRACTION_LLM']?.toLowerCase() as ExtractionEngine | undefined;
  if (envVal === 'openrouter' || envVal === 'claude' || envVal === 'gemini') return envVal;

  // Auto-detect: prefer OpenRouter if key is present
  if (process.env['OPENROUTER_API_KEY']) return 'openrouter';
  if (process.env['GEMINI_API_KEY']) return 'gemini';
  if (process.env['ANTHROPIC_API_KEY']) return 'claude';

  // Default
  return 'openrouter';
}

export { extractStructuredData as extractWithClaude, ExtractionError } from './claude.js';
export { extractWithGemini } from './gemini.js';
export { extractWithOpenRouter } from './openrouter.js';
export { resolveEngine };

/**
 * Extract structured data from HTML using the configured LLM engine.
 * Default: OpenRouter Gemini 2.0 Flash (routes through OpenRouter API).
 * Falls back to direct Gemini or Claude.
 */
export async function extractStructuredData(opts: {
  schema: ExtractionSchema;
  html: string;
  url: string;
  extractRaw?: boolean;
}): Promise<{ data: Record<string, unknown>; raw?: string; model: string; latencyMs: number }> {
  const engine = resolveEngine(opts.schema);

  if (engine === 'claude') {
    return extractWithClaude(opts);
  }

  if (engine === 'openrouter') {
    const result = await extractWithOpenRouter(opts.html, opts.url, opts.schema);
    return {
      data: result.data ?? {},
      raw: result.raw ? JSON.stringify(result.raw) : undefined,
      model: 'google/gemini-2.0-flash-001 (via OpenRouter)',
      latencyMs: result.latencyMs,
    };
  }

  return extractWithGemini(opts);
}
