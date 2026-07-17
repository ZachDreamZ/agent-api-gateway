/**
 * Crawl4AI-inspired HTML → clean text/markdown for LLM extraction.
 * Pure TS — no Python Crawl4AI dependency. Strips chrome, keeps main content.
 */

const DROP_TAGS =
  /<(script|style|noscript|svg|iframe|canvas|template|object|embed|link|meta)(\s[^>]*)?>[\s\S]*?<\/\1\s*>/gi;
const DROP_VOID =
  /<(script|style|noscript|svg|iframe|canvas|template|object|embed|link|meta)(\s[^>]*)?\/?>/gi;
const DROP_COMMENTS = /<!--[\s\S]*?-->/g;
const DROP_CHROME =
  /<(nav|footer|header|aside|form|button|input|select|textarea|noscript)(\s[^>]*)?>[\s\S]*?<\/\1\s*>/gi;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractAttr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
  const m = tag.match(re);
  return m ? decodeEntities(m[1]) : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]) : null;
}

function extractMetaDescription(html: string): string | null {
  const m =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i,
    ) ||
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    );
  return m ? decodeEntities(m[1]).trim() : null;
}

function extractMainChunk(html: string): string {
  const main =
    html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
    html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<div[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return main ? main[1] : html;
}

/**
 * Convert HTML to compact markdown-ish text for LLM context.
 */
export function htmlToCleanMarkdown(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let work = html;
  work = work.replace(DROP_COMMENTS, '');
  work = work.replace(DROP_TAGS, '');
  work = work.replace(DROP_VOID, '');
  work = work.replace(DROP_CHROME, '');

  const title = extractTitle(html);
  const description = extractMetaDescription(html);
  work = extractMainChunk(work);

  // Links: keep text + URL
  work = work.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
    const href = extractAttr(attrs, 'href');
    const text = stripTags(inner);
    if (!text) return '';
    if (href && /^https?:\/\//i.test(href)) return `[${text}](${href})`;
    return text;
  });

  // Images: alt + src
  work = work.replace(/<img\b([^>]*)\/?>/gi, (_, attrs) => {
    const alt = extractAttr(attrs, 'alt') || 'image';
    const src = extractAttr(attrs, 'src');
    if (src && /^https?:\/\//i.test(src)) return `![${alt}](${src})`;
    return alt ? `[image: ${alt}]` : '';
  });

  // Headings
  for (let i = 6; i >= 1; i--) {
    const re = new RegExp(`<h${i}\\b[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
    work = work.replace(re, (_, inner) => `\n\n${'#'.repeat(i)} ${stripTags(inner)}\n\n`);
  }

  // Lists
  work = work.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `\n- ${stripTags(inner)}`);
  work = work.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n');

  // Paragraphs / breaks
  work = work.replace(/<br\s*\/?>/gi, '\n');
  work = work.replace(/<\/p>/gi, '\n\n');
  work = work.replace(/<\/div>/gi, '\n');
  work = work.replace(/<\/tr>/gi, '\n');
  work = work.replace(/<\/(td|th)>/gi, ' | ');

  // Drop remaining tags
  work = work.replace(/<[^>]+>/g, ' ');
  work = decodeEntities(work);

  // Collapse whitespace
  work = work
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  const parts: string[] = [];
  if (title) parts.push(`# ${title}`);
  if (description) parts.push(`> ${description}`);
  if (work) parts.push(work);
  return parts.join('\n\n').trim();
}

/** True if page is likely an empty SPA shell or bot wall. */
export function contentLooksThin(html: string, markdown?: string): boolean {
  const md = markdown ?? htmlToCleanMarkdown(html);
  const textLen = md.replace(/\s+/g, ' ').trim().length;
  if (textLen < 180) return true;

  const lower = html.toLowerCase();
  const shellHints =
    (lower.includes('id="root"') || lower.includes("id='root'") || lower.includes('id="app"')) &&
    textLen < 400;
  if (shellHints) return true;

  const challenge =
    lower.includes('cf-browser-verification') ||
    lower.includes('just a moment') ||
    lower.includes('enable javascript') ||
    lower.includes('captcha');
  if (challenge && textLen < 600) return true;

  return false;
}

export function getTrimmedContent(content: string, maxChars = 60_000): string {
  if (content.length <= maxChars) return content;
  return content.slice(0, maxChars) + '\n\n<!-- [TRUNCATED] -->';
}
