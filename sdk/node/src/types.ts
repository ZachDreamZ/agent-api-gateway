// ─── API Response Types ───

export interface ExtractResponse {
  success: boolean;
  data: Record<string, unknown>;
  usage: { credits_used: number; credits_remaining: number };
  cached: boolean;
  latency_ms: number;
}

export interface ProductData {
  name: string | null;
  brand: string | null;
  price: number | null;
  currency: string | null;
  in_stock: boolean | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  image: string | null;
  specs: Record<string, string>;
  availability: string | null;
}

export interface ArticleData {
  title: string | null;
  author: string | null;
  date: string | null;
  reading_time: number | null;
  excerpt: string | null;
  content_summary: string | null;
  topics: string[];
}

export interface CompanyData {
  name: string | null;
  description: string | null;
  founded: string | null;
  size: string | null;
  funding_total: string | null;
  industry: string | null;
  location: string | null;
  competitors: string[];
}

export interface SchemaInfo {
  name: string;
  description: string;
  fields: { name: string; type: string; description: string }[];
}

export interface UsageInfo {
  queries_used: number;
  queries_limit: number;
  remaining: number;
  tier: string;
  requests_by_schema: Record<string, number>;
}

// ─── Error Types ───

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthError extends ApiError {
  constructor(message = "Invalid or missing API key") {
    super(message, 401, "invalid_api_key");
    this.name = "AuthError";
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message = "Rate limit exceeded",
    public retryAfter = 60
  ) {
    super(message, 429, "rate_limit_exceeded");
    this.name = "RateLimitError";
  }
}
