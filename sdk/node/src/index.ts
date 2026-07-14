import {
  ExtractResponse,
  ProductData,
  ArticleData,
  CompanyData,
  SchemaInfo,
  UsageInfo,
  ApiError,
  AuthError,
  RateLimitError,
} from "./types.js";

export { ApiError, AuthError, RateLimitError };
export type {
  ExtractResponse,
  ProductData,
  ArticleData,
  CompanyData,
  SchemaInfo,
  UsageInfo,
};

export type SchemaType = "product" | "article" | "company";

export interface ExtractOptions {
  wait_for?: string;
  country?: string;
  extract_raw?: boolean;
}

export class AgentApi {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl = "https://api.agent-api-gateway.dev/v1") {
    if (!apiKey) throw new Error("API key is required");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 401) throw new AuthError();
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") || "60", 10);
        throw new RateLimitError(undefined, retryAfter);
      }
      throw new ApiError(text, res.status);
    }

    return res.json() as Promise<T>;
  }

  // ─── Extract ───

  async extract(
    url: string,
    schema: SchemaType,
    options?: ExtractOptions
  ): Promise<ExtractResponse> {
    return this.request<ExtractResponse>("/extract", {
      url,
      schema,
      options,
    });
  }

  async extractProduct(
    url: string,
    options?: ExtractOptions
  ): Promise<ProductData> {
    const res = await this.extract(url, "product", options);
    return res.data as unknown as ProductData;
  }

  async extractArticle(
    url: string,
    options?: ExtractOptions
  ): Promise<ArticleData> {
    const res = await this.extract(url, "article", options);
    return res.data as unknown as ArticleData;
  }

  async extractCompany(
    url: string,
    options?: ExtractOptions
  ): Promise<CompanyData> {
    const res = await this.extract(url, "company", options);
    return res.data as unknown as CompanyData;
  }

  // ─── Schemas ───

  async listSchemas(): Promise<SchemaInfo[]> {
    return this.request<SchemaInfo[]>("/schemas");
  }

  // ─── Usage ───

  async getUsage(): Promise<UsageInfo> {
    return this.request<UsageInfo>("/usage");
  }
}
