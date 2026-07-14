import type { ExtractionSchema } from '../shared/types.js';
import { extractStructuredData as extractWithClaude } from './claude.js';
import { extractWithGemini } from './gemini.js';

// ─── LLM Router ───
// Gemini Flash is free-tier default. Falls back to Claude when GEMINI_API_KEY
// is not set but ANTHROPIC_API_KEY is. Configure via EXTRACTION_LLM env var.

export type ExtractionEngine = 'gemini' | 'claude';

function resolveEngine(schema?: ExtractionSchema): ExtractionEngine {
  const envVal = process.env['EXTRACTION_LLM']?.toLowerCase() as ExtractionEngine | undefined;
  if (envVal === 'claude' || envVal === 'gemini') return envVal;

  // Auto-detect: prefer Gemini if key is present
  if (process.env['GEMINI_API_KEY']) return 'gemini';
  if (process.env['ANTHROPIC_API_KEY']) return 'claude';

  // Default to Gemini (will fail gracefully with clear error if no key set)
  return 'gemini';
}

export { extractStructuredData as extractWithClaude, ExtractionError } from './claude.js';
export { extractWithGemini } from './gemini.js';
export { resolveEngine };

/**
 * Extract structured data from HTML using the configured LLM engine.
 * Default: Gemini Flash 2.0 (free tier). Falls back to Claude Sonnet 4.
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

  return extractWithGemini(opts);
}
