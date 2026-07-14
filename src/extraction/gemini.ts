import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { ExtractionSchema } from '../shared/types.js';
import { getSystemPrompt, getTrimmedHtml } from './prompts.js';
import { validateExtraction, ValidationError } from './validator.js';

// ─── Config ───

const MODEL = 'gemma-4-31b-it';
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;

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

export class GeminiExtractionError extends Error {
  constructor(
    message: string,
    public readonly schema: ExtractionSchema,
    public readonly url: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'GeminiExtractionError';
  }
}

// ─── Client Singleton ───

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (genAI) return genAI;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

// ─── JSON schema per extraction type (helps Gemini return valid JSON) ───

const SCHEMA_DEFS: Record<ExtractionSchema, Record<string, unknown>> = {
  product: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING, nullable: true },
      brand: { type: SchemaType.STRING, nullable: true },
      price: { type: SchemaType.NUMBER, nullable: true },
      currency: { type: SchemaType.STRING, nullable: true },
      in_stock: { type: SchemaType.BOOLEAN, nullable: true },
      rating: { type: SchemaType.NUMBER, nullable: true },
      review_count: { type: SchemaType.INTEGER, nullable: true },
      description: { type: SchemaType.STRING, nullable: true },
      image: { type: SchemaType.STRING, nullable: true },
      specs: { type: SchemaType.OBJECT, properties: {}, nullable: true },
      availability: { type: SchemaType.STRING, nullable: true },
    },
  },
  article: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, nullable: true },
      author: { type: SchemaType.STRING, nullable: true },
      date: { type: SchemaType.STRING, nullable: true },
      reading_time: { type: SchemaType.INTEGER, nullable: true },
      excerpt: { type: SchemaType.STRING, nullable: true },
      content_summary: { type: SchemaType.STRING, nullable: true },
      topics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
  },
  company: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING, nullable: true },
      description: { type: SchemaType.STRING, nullable: true },
      founded: { type: SchemaType.STRING, nullable: true },
      size: { type: SchemaType.STRING, nullable: true },
      funding_total: { type: SchemaType.STRING, nullable: true },
      industry: { type: SchemaType.STRING, nullable: true },
      location: { type: SchemaType.STRING, nullable: true },
      competitors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
  },
};

// ─── Core extraction ───

export async function extractWithGemini(
  options: ExtractOptions,
): Promise<ExtractResult> {
  const { schema, html, url, extractRaw } = options;
  const start = Date.now();

  const systemPrompt = getSystemPrompt(schema);
  const trimmedHtml = getTrimmedHtml(html);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({
        model: MODEL,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA_DEFS[schema] as any,
        },
      });

      const result = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Extract ${schema} data from this webpage URL: ${url}\n\nHTML:\n${trimmedHtml}` },
            ],
          },
        ],
      });

      const response = result.response;
      const rawText = response.text().trim();

      // Strip markdown code fences if present
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new GeminiExtractionError(
          `Gemini returned invalid JSON: ${rawText.slice(0, 200)}`,
          schema,
          url,
        );
      }

      // Validate against schema
      const validated = validateExtraction(schema, parsed);

      const extractResult: ExtractResult = {
        data: validated,
        model: MODEL,
        latencyMs: Date.now() - start,
      };

      if (extractRaw) {
        extractResult.raw = rawText;
      }

      return extractResult;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (lastError instanceof ValidationError) {
        throw new GeminiExtractionError(
          `Validation failed: ${lastError.message}`,
          schema,
          url,
          lastError,
        );
      }

      if (attempt < MAX_RETRIES) {
        await sleep(2000 * Math.pow(2, attempt));
      }
    }
  }

  throw new GeminiExtractionError(
    `All ${MAX_RETRIES + 1} attempts failed. Last error: ${lastError?.message}`,
    schema,
    url,
    lastError!,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
