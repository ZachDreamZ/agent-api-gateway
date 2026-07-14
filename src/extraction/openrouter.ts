import type { ExtractionSchema } from '../shared/types.js';
import { getSystemPrompt, getTrimmedHtml } from './prompts.js';
import { validateExtraction, ValidationError } from './validation.js';

// ─── Errors ───
export class OpenRouterError extends Error {
  constructor(message: string, public readonly attempt?: number) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

// ─── Config ───
const MODEL = 'google/gemma-4-31b-it';
const MAX_RETRIES = 2;
const API_BASE = 'https://openrouter.ai/api/v1';
const SITE_URL = 'https://agent-api-gateway.onrender.com';
const SITE_NAME = 'AgentAPI';
const CREDIT_COST = 1;

interface ExtractionResult {
  data: Record<string, unknown> | null;
  raw: Record<string, unknown> | null;
  latencyMs: number;
  creditsUsed: number;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    total_tokens: number;
  };
  error?: {
    message: string;
  };
}

function createExtractionPrompt(schema: ExtractionSchema, html: string, url: string): OpenRouterMessage[] {
  return [
    { role: 'system', content: getSystemPrompt(schema) },
    { role: 'user', content: `URL: ${url}\n\nHTML content:\n\n${html}\n\nExtract the requested data and return ONLY valid JSON.` },
  ];
}

async function callOpenRouter(messages: OpenRouterMessage[], attempt: number): Promise<OpenRouterResponse> {
  const apiKey = process.env['OPENROUTER_API_KEY'];
  if (!apiKey) {
    throw new OpenRouterError('OPENROUTER_API_KEY not set');
  }

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': SITE_URL,
      'X-Title': SITE_NAME,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new OpenRouterError(`OpenRouter API error ${response.status}: ${text.slice(0, 500)}`, attempt);
  }

  return response.json();
}

function parseJsonResponse(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function extractWithOpenRouter(
  html: string,
  url: string,
  schema: ExtractionSchema,
): Promise<ExtractionResult> {
  const startMs = Date.now();
  let lastError: Error | null = null;

  const trimmedHtml = getTrimmedHtml(html);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const messages = createExtractionPrompt(schema, trimmedHtml, url);
      const response = await callOpenRouter(messages, attempt);

      // Check for OpenRouter API error
      if (response.error) {
        throw new OpenRouterError(`OpenRouter: ${response.error.message}`, attempt);
      }

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new OpenRouterError('No content in response', attempt);
      }

      const parsed = parseJsonResponse(content);

      // Validate
      try {
        validateExtraction(parsed, schema);
      } catch (err) {
        if (err instanceof ValidationError) {
          console.warn(`[openrouter] validation warn (attempt ${attempt}): ${err.message}`);
          // Return best-effort even on validation warning
        }
      }

      return {
        data: parsed,
        raw: {
          model: MODEL,
          tokens: response.usage?.total_tokens ?? 0,
          schema,
        },
        latencyMs: Date.now() - startMs,
        creditsUsed: CREDIT_COST,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[openrouter] attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  throw new OpenRouterError(`All ${MAX_RETRIES} attempts failed. Last error: ${lastError?.message}`);
}
