/**
 * SSRF guard for user-supplied URLs used by the extraction pipeline.
 * Blocks non-http(s), credentials-in-URL, localhost, private/link-local,
 * and cloud metadata endpoints before any fetch/playwright work runs.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.google',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

function isIpv4(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

function parseIpv4(host: string): number[] | null {
  const parts = host.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return null;
  }
  return parts;
}

function isPrivateOrReservedIpv4(parts: number[]): boolean {
  const [a, b] = parts;
  // 0.0.0.0/8, 10/8, 127/8, 169.254/16, 172.16/12, 192.168/16, 100.64/10 (CGNAT)
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 198.18/15 benchmark, 198.51.100, 203.0.113 documentation
  if (a === 198 && (b === 18 || b === 19 || b === 51)) return true;
  if (a === 203 && b === 0) return true;
  // Multicast & reserved
  if (a >= 224) return true;
  return false;
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host === '::1' || host === '[::1]' || host === '0.0.0.0') return true;

  // IPv6 literals (bracketed or bare)
  const bare = host.replace(/^\[|\]$/g, '');
  if (bare.includes(':')) {
    const h = bare.toLowerCase();
    if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
    // IPv4-mapped :ffff:x.x.x.x
    const mapped = h.match(/:ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) {
      const parts = parseIpv4(mapped[1]!);
      if (parts && isPrivateOrReservedIpv4(parts)) return true;
    }
    return false;
  }

  if (isIpv4(host)) {
    const parts = parseIpv4(host);
    if (parts && isPrivateOrReservedIpv4(parts)) return true;
  }

  return false;
}

export type UrlSafetyResult =
  | { ok: true; url: URL }
  | { ok: false; error: string };

/**
 * Validate that a URL is safe to fetch from this service.
 */
export function assertSafePublicUrl(raw: string): UrlSafetyResult {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, error: 'Only http and https URLs are allowed' };
  }

  // Prefer https in production extractions; still allow http for public sites that lack TLS
  if (url.username || url.password) {
    return { ok: false, error: 'URLs with credentials are not allowed' };
  }

  if (!url.hostname) {
    return { ok: false, error: 'URL must include a hostname' };
  }

  if (isPrivateOrLocalHostname(url.hostname)) {
    return { ok: false, error: 'Private, local, or metadata hostnames are not allowed' };
  }

  // Block numeric hosts that resolve as private after normalization
  if (url.port && !['', '80', '443', '8080', '8443'].includes(url.port)) {
    // Allow uncommon public ports but reject common internal service ports
    const port = Number(url.port);
    if ([22, 25, 3306, 5432, 6379, 9200, 11211, 27017].includes(port)) {
      return { ok: false, error: 'URL port is not allowed' };
    }
  }

  return { ok: true, url };
}
