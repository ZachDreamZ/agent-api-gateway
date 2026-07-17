/**
 * Browser-like request headers (curl-impersonate / Chrome fingerprint inspiration).
 * Improves acceptance vs bare Node fetch User-Agent.
 */

export type BrowserHeaderOptions = {
  country?: string;
  referer?: string;
};

const LOCALE_MAP: Record<string, string> = {
  us: 'en-US,en;q=0.9',
  gb: 'en-GB,en;q=0.9',
  de: 'de-DE,de;q=0.9,en;q=0.8',
  fr: 'fr-FR,fr;q=0.9,en;q=0.8',
  jp: 'ja-JP,ja;q=0.9,en;q=0.8',
  cn: 'zh-CN,zh;q=0.9,en;q=0.8',
  br: 'pt-BR,pt;q=0.9,en;q=0.8',
  in: 'en-IN,en;q=0.9',
};

export function resolveAcceptLanguage(country?: string): string {
  if (!country) return 'en-US,en;q=0.9';
  return LOCALE_MAP[country.toLowerCase()] ?? 'en-US,en;q=0.9';
}

/** Chrome 131 desktop on Windows — common, well-trusted fingerprint. */
export const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function buildBrowserHeaders(opts: BrowserHeaderOptions = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': CHROME_UA,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': resolveAcceptLanguage(opts.country),
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': opts.referer ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  };
  if (opts.referer) headers.Referer = opts.referer;
  return headers;
}
