export interface LimitBreakOptions {
  timeout?: number;
  country?: string;
}

export interface LimitBreakResult {
  html: string;
  finalUrl: string;
  statusCode: number;
  latencyMs: number;
  method: 'limitbreak';
}

export class LimitBreakError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
  ) {
    super(message);
    this.name = 'LimitBreakError';
  }
}

export async function fetchViaLimitBreak(
  targetUrl: string,
  options: LimitBreakOptions = {},
): Promise<LimitBreakResult> {
  const baseUrl = process.env['LIMITBREAK_URL']?.trim();
  if (!baseUrl) {
    throw new LimitBreakError('LIMITBREAK_URL is not set', targetUrl);
  }

  const timeout = options.timeout ?? 30_000;
  const start = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeout, 60_000));

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/v1/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        url: targetUrl,
        method: 'GET',
        use_proxy: true,
        impersonate: null,
        cache_ttl: 0,
        timeout: Math.ceil(timeout / 1000),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new LimitBreakError(
        `limit-break returned ${res.status}: ${body.slice(0, 200)}`,
        targetUrl,
      );
    }

    const data = await res.json() as {
      status: number;
      body: string;
      url: string;
      ms: number;
    };

    return {
      html: typeof data.body === 'string' ? data.body : '',
      finalUrl: data.url || targetUrl,
      statusCode: data.status ?? 200,
      latencyMs: data.ms ?? (Date.now() - start),
      method: 'limitbreak',
    };
  } catch (err) {
    if (err instanceof LimitBreakError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new LimitBreakError(`limit-break request failed: ${message}`, targetUrl);
  } finally {
    clearTimeout(timer);
  }
}
