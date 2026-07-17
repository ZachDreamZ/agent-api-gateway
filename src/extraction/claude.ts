import Anthropic from '@anthropic-ai/sdk';
import type { ExtractionSchema } from '../shared/types.js';
import { getSystemPrompt, getTrimmedHtml } from './prompts.js';
import { validateExtraction, ValidationError } from './validator.js';

// ─── Config ───

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

// ─── Types ───

export interface ExtractOptions {
  schema: ExtractionSchema;
  html: string;
  url: string;
  extractRaw?: boolean;
}

export interface ExtractResult {
  data: Record<string, unknown>;
  raw?: string;
  model: string;
  latencyMs: number;
}

// ─── Errors ───

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly schema: ExtractionSchema,
    public readonly url: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

// ─── Client Singleton ───

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable not set');

  client = new Anthropic({
    apiKey,
    timeout: TIMEOUT_MS,
  });
  return client;
}

// ─── Core extraction ───

export async function extractStructuredData(
  options: ExtractOptions,
): Promise<ExtractResult> {
  const { schema, html, url, extractRaw } = options;
  const start = Date.now();

  const systemPrompt = getSystemPrompt(schema);
  const trimmedHtml = getTrimmedHtml(html);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const anthropic = getClient();

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ${schema} data from this webpage URL: ${url}\n\nPage content:\n${trimmedHtml}`,
              },
            ],
          },
        ],
      });

      const responseBlock = message.content[0];
      if (responseBlock?.type !== 'text') {
        throw new ExtractionError(
          `Unexpected response type: ${responseBlock?.type}`,
          schema,
          url,
        );
      }

      const rawText = responseBlock.text.trim();

      // Parse JSON from response (handle code fences gracefully)
      const jsonStr = extractJson(rawText);
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        throw new ExtractionError(
          `Claude returned invalid JSON: ${rawText.slice(0, 200)}`,
          schema,
          url,
        );
      }

      // Validate against schema
      const validated = validateExtraction(schema, parsed);

      const result: ExtractResult = {
        data: validated,
        model: message.model,
        latencyMs: Date.now() - start,
      };

      if (extractRaw) {
        result.raw = rawText;
      }

      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (lastError instanceof ValidationError) {
        // Validation errors are non-retryable — invalid data from LLM
        throw new ExtractionError(
          `Validation failed: ${lastError.message}`,
          schema,
          url,
          lastError,
        );
      }

      if (attempt < MAX_RETRIES) {
        // exponential backoff: 1s, 2s
        await sleep(1000 * Math.pow(2, attempt));
      }
    }
  }

  throw new ExtractionError(
    `All ${MAX_RETRIES + 1} attempts failed. Last error: ${lastError?.message}`,
    schema,
    url,
    lastError!,
  );
}

// ─── Helpers ───

function extractJson(text: string): string {
  // Remove code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Find first { and last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
