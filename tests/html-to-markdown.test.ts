import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  htmlToCleanMarkdown,
  contentLooksThin,
  getTrimmedContent,
} from '../src/scraper/html-to-markdown.ts';
import { buildBrowserHeaders, CHROME_UA } from '../src/scraper/browser-headers.ts';

describe('htmlToCleanMarkdown (Crawl4AI-style cleaner)', () => {
  it('strips scripts/styles and keeps product-ish content', () => {
    const html = `
      <!doctype html>
      <html><head>
        <title>Studio Headphones Pro</title>
        <meta name="description" content="Wireless ANC headphones" />
        <script>window.evil=1</script>
        <style>.x{color:red}</style>
      </head>
      <body>
        <nav><a href="/">Home</a></nav>
        <main>
          <h1>Studio Headphones Pro</h1>
          <p>Price: $249.99</p>
          <img src="https://cdn.example.com/hp.png" alt="headphones" />
          <a href="https://store.example.com/buy">Buy now</a>
        </main>
        <footer>© example</footer>
      </body></html>`;

    const md = htmlToCleanMarkdown(html);
    assert.match(md, /Studio Headphones Pro/);
    assert.match(md, /249\.99|Wireless ANC/);
    assert.match(md, /cdn\.example\.com\/hp\.png/);
    assert.doesNotMatch(md, /window\.evil|color:red/i);
    assert.doesNotMatch(md, /© example/);
  });

  it('detects thin SPA shells', () => {
    const shell = `<html><body><div id="root"></div><script src="/app.js"></script></body></html>`;
    assert.equal(contentLooksThin(shell), true);

    const rich = `<html><head><title>Article</title></head><body><article>${'word '.repeat(80)}</article></body></html>`;
    assert.equal(contentLooksThin(rich), false);
  });

  it('truncates long content', () => {
    const long = 'x'.repeat(1000);
    const t = getTrimmedContent(long, 100);
    assert.ok(t.length < 200);
    assert.match(t, /TRUNCATED/);
  });
});

describe('buildBrowserHeaders (curl-impersonate spirit)', () => {
  it('emits Chrome UA and Sec-Fetch headers', () => {
    const h = buildBrowserHeaders({ country: 'us' });
    assert.equal(h['User-Agent'], CHROME_UA);
    assert.ok(h['sec-ch-ua']?.includes('Chrome'));
    assert.equal(h['Sec-Fetch-Mode'], 'navigate');
    assert.match(h['Accept-Language'], /en-US/);
  });
});
