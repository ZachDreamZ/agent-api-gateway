import { chromium, Browser, Page } from 'playwright';
import { CACHE_TTL_SECONDS } from '../shared/types.js';

// ─── Types ───

export interface ScrapeOptions {
  waitFor?: string;
  timeout?: number;
  country?: string;
}

export interface ScrapeResult {
  html: string;
  url: string;
  finalUrl: string;
  statusCode: number;
  latencyMs: number;
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

// ─── Locale helpers ───

const LOCALE_MAP: Record<string, string> = {
  us: 'en-US',
  gb: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  jp: 'ja-JP',
  cn: 'zh-CN',
  br: 'pt-BR',
  in: 'en-IN',
};

function resolveLocale(country?: string): string {
  if (!country) return 'en-US';
  return LOCALE_MAP[country.toLowerCase()] ?? 'en-US';
}

// ─── Core ───

export async function scrapeUrl(
  targetUrl: string,
  options: ScrapeOptions = {},
): Promise<ScrapeResult> {
  const timeout = options.timeout ?? 30_000;
  const start = Date.now();
  const page: Page = await (await getBrowser()).newPage();

  try {
    await page.setViewportSize({ width: 1280, height: 720 });

    const locale = resolveLocale(options.country);
    await page.setExtraHTTPHeaders({
      'Accept-Language': locale,
    });

    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    if (options.waitFor) {
      try {
        await page.waitForSelector(options.waitFor, { timeout: 10_000 });
      } catch {
        // non-fatal — page may not have the selector
      }
    }

    // wait a beat for JS rendering
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    const html = await page.content();
    const finalUrl = page.url();
    const statusCode = response?.status() ?? 0;

    return {
      html,
      url: targetUrl,
      finalUrl,
      statusCode,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ScrapeError(`Failed to scrape ${targetUrl}: ${message}`, targetUrl);
  } finally {
    await page.close().catch(() => {});
  }
}

// ─── Error ───

export class ScrapeError extends Error {
  constructor(message: string, public readonly url: string) {
    super(message);
    this.name = 'ScrapeError';
  }
}
