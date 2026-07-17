import { chromium, Browser, Page } from 'playwright';
import { buildBrowserHeaders, CHROME_UA, resolveAcceptLanguage } from './browser-headers.js';
import { fetchResilient } from './fetch-resilient.js';
import { contentLooksThin, htmlToCleanMarkdown } from './html-to-markdown.js';

// ─── Types ───

export interface ScrapeOptions {
  waitFor?: string;
  timeout?: number;
  country?: string;
  /** Force Playwright even if HTTP content looks rich */
  forceBrowser?: boolean;
}

export interface ScrapeResult {
  html: string;
  /** Clean markdown for LLM (Crawl4AI-style) */
  markdown: string;
  url: string;
  finalUrl: string;
  statusCode: number;
  latencyMs: number;
  /** How content was obtained */
  method: 'http' | 'playwright';
}

// ─── Browser Pool ───

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser?.isConnected()) return browser;
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
    ],
  });
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

// ─── Playwright path ───

async function scrapeWithPlaywright(
  targetUrl: string,
  options: ScrapeOptions,
  start: number,
): Promise<ScrapeResult> {
  const timeout = options.timeout ?? 30_000;
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent: CHROME_UA,
    viewport: { width: 1280, height: 720 },
    locale: resolveAcceptLanguage(options.country).slice(0, 5) || 'en-US',
    extraHTTPHeaders: buildBrowserHeaders({ country: options.country }),
  });
  const page: Page = await context.newPage();
  try {
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    if (options.waitFor) {
      try {
        await page.waitForSelector(options.waitFor, { timeout: 10_000 });
      } catch {
        // non-fatal
      }
    }

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(800);

    const html = await page.content();
    const finalUrl = page.url();
    const statusCode = response?.status() ?? 0;
    const markdown = htmlToCleanMarkdown(html);

    return {
      html,
      markdown,
      url: targetUrl,
      finalUrl,
      statusCode,
      latencyMs: Date.now() - start,
      method: 'playwright',
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

// ─── Core: HTTP first (browser headers), Playwright if thin / forced ───

export async function scrapeUrl(
  targetUrl: string,
  options: ScrapeOptions = {},
): Promise<ScrapeResult> {
  const timeout = options.timeout ?? 30_000;
  const start = Date.now();
  const needBrowser = Boolean(options.forceBrowser || options.waitFor);

  // 1. Resilient HTTP with Chrome-like headers (fast path)
  if (!needBrowser) {
    try {
      const http = await fetchResilient(targetUrl, {
        timeoutMs: Math.min(timeout, 25_000),
        country: options.country,
      });
      const markdown = htmlToCleanMarkdown(http.html);
      const thin = contentLooksThin(http.html, markdown) || http.statusCode >= 400;

      if (!thin && http.statusCode > 0 && http.statusCode < 400) {
        return {
          html: http.html,
          markdown,
          url: targetUrl,
          finalUrl: http.finalUrl,
          statusCode: http.statusCode,
          latencyMs: http.latencyMs,
          method: 'http',
        };
      }

      console.warn(
        `[scrape] HTTP content thin or status=${http.statusCode} for ${targetUrl}; escalating to Playwright`,
      );
    } catch (httpErr) {
      console.warn(
        `[scrape] HTTP failed for ${targetUrl}:`,
        httpErr instanceof Error ? httpErr.message : String(httpErr),
      );
    }
  }

  // 2. Playwright (real browser TLS + JS)
  try {
    return await scrapeWithPlaywright(targetUrl, options, start);
  } catch (playwrightErr) {
    console.warn(
      `[scrape] Playwright failed for ${targetUrl}:`,
      playwrightErr instanceof Error ? playwrightErr.message : String(playwrightErr),
    );

    // 3. Last-chance HTTP if Playwright failed and we skipped it or want retry
    try {
      const http = await fetchResilient(targetUrl, {
        timeoutMs: Math.min(timeout, 20_000),
        country: options.country,
      });
      return {
        html: http.html,
        markdown: htmlToCleanMarkdown(http.html),
        url: targetUrl,
        finalUrl: http.finalUrl,
        statusCode: http.statusCode,
        latencyMs: Date.now() - start,
        method: 'http',
      };
    } catch (fetchErr) {
      const message = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const pw = playwrightErr instanceof Error ? playwrightErr.message : String(playwrightErr);
      throw new ScrapeError(`Failed to scrape ${targetUrl}: ${pw}; fallback: ${message}`, targetUrl);
    }
  }
}

// ─── Error ───

export class ScrapeError extends Error {
  constructor(
    message: string,
    public readonly url: string,
  ) {
    super(message);
    this.name = 'ScrapeError';
  }
}
