import type {
  ExtractionSchema,
  ProductData,
  ArticleData,
  CompanyData,
} from '../shared/types.js';

// ─── Errors ───

export class ValidationError extends Error {
  constructor(message: string, public readonly raw: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ─── Type guards ───

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function sanitizeString(val: unknown, maxLen = 500): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function sanitizeNumber(val: unknown): number | null {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.\-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function sanitizeBoolean(val: unknown): boolean | null {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.toLowerCase();
    if (['true', 'yes', '1', 'in stock', 'available'].includes(lower)) return true;
    if (['false', 'no', '0', 'out of stock', 'unavailable'].includes(lower)) return false;
  }
  if (typeof val === 'number') return val !== 0;
  return null;
}

function sanitizeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((v) => (typeof v === 'string' ? v.trim() : String(v)))
    .filter((s) => s.length > 0);
}

function sanitizeSpecs(val: unknown): Record<string, string> {
  if (!isRecord(val)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(val)) {
    if (typeof v === 'string' && v.trim().length > 0) {
      out[k.trim()] = v.trim();
    }
  }
  return out;
}

// ─── Validators per schema ───

function validateProduct(raw: unknown): ProductData {
  if (!isRecord(raw)) throw new ValidationError('Product data must be a JSON object', raw);

  return {
    name: sanitizeString(raw.name),
    brand: sanitizeString(raw.brand),
    price: sanitizeNumber(raw.price),
    currency: sanitizeString(raw.currency, 10),
    in_stock: sanitizeBoolean(raw.in_stock),
    rating: sanitizeNumber(raw.rating),
    review_count: sanitizeNumber(raw.review_count) !== null
      ? Math.round(sanitizeNumber(raw.review_count)!)
      : null,
    description: sanitizeString(raw.description),
    image: sanitizeString(raw.image, 2000),
    specs: sanitizeSpecs(raw.specs),
    availability: sanitizeString(raw.availability, 200),
  };
}

function validateArticle(raw: unknown): ArticleData {
  if (!isRecord(raw)) throw new ValidationError('Article data must be a JSON object', raw);

  return {
    title: sanitizeString(raw.title),
    author: sanitizeString(raw.author, 200),
    date: sanitizeString(raw.date, 50),
    reading_time: sanitizeNumber(raw.reading_time) !== null
      ? Math.round(sanitizeNumber(raw.reading_time)!)
      : null,
    excerpt: sanitizeString(raw.excerpt),
    content_summary: sanitizeString(raw.content_summary),
    topics: sanitizeStringArray(raw.topics),
  };
}

function validateCompany(raw: unknown): CompanyData {
  if (!isRecord(raw)) throw new ValidationError('Company data must be a JSON object', raw);

  return {
    name: sanitizeString(raw.name),
    description: sanitizeString(raw.description),
    founded: sanitizeString(raw.founded, 50),
    size: sanitizeString(raw.size, 100),
    funding_total: sanitizeString(raw.funding_total, 100),
    industry: sanitizeString(raw.industry, 100),
    location: sanitizeString(raw.location, 200),
    competitors: sanitizeStringArray(raw.competitors),
  };
}

// ─── Router ───

const VALIDATOR_MAP: Record<ExtractionSchema, (raw: unknown) => Record<string, unknown>> = {
  product: (raw) => validateProduct(raw) as unknown as Record<string, unknown>,
  article: (raw) => validateArticle(raw) as unknown as Record<string, unknown>,
  company: (raw) => validateCompany(raw) as unknown as Record<string, unknown>,
};

export function validateExtraction(
  schema: ExtractionSchema,
  raw: unknown,
): Record<string, unknown> {
  const validator = VALIDATOR_MAP[schema];
  if (!validator) throw new ValidationError(`Unknown schema: ${schema}`, raw);
  return validator(raw);
}
