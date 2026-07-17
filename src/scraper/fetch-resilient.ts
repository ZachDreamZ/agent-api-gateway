/**
 * Resilient HTTP fetch with browser-like headers (curl-impersonate spirit).
 * Used as primary path before Playwright for speed and lower cost.
 */

import { buildBrowserHeaders } from './browser-headers.js';

export type ResilientFetchOptions = {
  timeoutMs?: number;
  country?: string;
  maxRedirects?: number;
};

export type ResilientFetchResult = {
  html: string;
  finalUrl: string;
  statusCode: number;
  latencyMs: number;
  method: 'http';
};

export async function fetchResilient(
  targetUrl: string,
  options: ResilientFetchOptions = {},
): Promise<ResilientFetchResult> {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const maxRedirects = options.maxRedirects ?? 5;
  const start = Date.now();

  let current = targetUrl;
  let redirects = 0;

  while (redirects <= maxRedirects) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: buildBrowserHeaders({
          country: options.country,
          referer: redirects > 0 ? targetUrl : undefined,
        }),
      });

      // Follow redirects manually so we keep headers
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const loc = res.headers.get('location');
        if (!loc) {
          throw new Error(`Redirect ${res.status} without Location`);
        }
        current = new URL(loc, current).toString();
        redirects += 1;
        // drain body
        await res.arrayBuffer().catch(() => {});
        continue;
      }

      const html = await res.text();
      return {
        html,
        finalUrl: res.url || current,
        statusCode: res.status,
        latencyMs: Date.now() - start,
        method: 'http',
      };
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`Too many redirects fetching ${targetUrl}`);
}
