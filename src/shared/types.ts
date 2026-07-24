// ─── API Contract ───

export type ExtractionSchema = 'product' | 'article' | 'company';

export interface ExtractRequest {
  url: string;
  schema: ExtractionSchema;
  options?: {
    wait_for?: string;
    country?: string;
    extract_raw?: boolean;
  };
}

export interface ExtractResponse {
  success: boolean;
  data: Record<string, unknown>;
  usage: { credits_used: number; credits_remaining: number };
  cached: boolean;
  latency_ms: number;
}

// ─── Extraction Schemas ───

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

// ─── Database ───

export type Tier = 'free' | 'hobby' | 'pro' | 'scale';

export interface DbUser {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  tier: Tier;
  created_at: string;
}

export interface DbApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  name: string;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface DbUsageLog {
  id: string;
  user_id: string;
  api_key_id: string;
  endpoint: string;
  schema: ExtractionSchema;
  url: string;
  cached: boolean;
  latency_ms: number;
  credits_used: number;
  created_at: string;
}

// ─── Tier Limits ───

export const TIER_LIMITS: Record<Tier, { queries_per_month: number; rate_limit_rpm: number; concurrent_requests: number }> = {
  free:  { queries_per_month: 500,  rate_limit_rpm: 10,  concurrent_requests: 1 },
  hobby: { queries_per_month: 5000, rate_limit_rpm: 60,  concurrent_requests: 5 },
  pro:   { queries_per_month: 25000,rate_limit_rpm: 300, concurrent_requests: 20 },
  scale: { queries_per_month: 100000, rate_limit_rpm: 1000, concurrent_requests: 100 },
};

export const CREDIT_COST_PER_QUERY = 1;
export const CACHE_TTL_SECONDS = 3600; // 1 hour

// ─── Hono context variables (set by auth middleware) ───
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    user: { id: string; email: string; stripe_customer_id?: string | null; tier?: string };
    tier: Tier;
    apiKey: { id: string };
  }
}

