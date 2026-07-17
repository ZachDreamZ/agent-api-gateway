/**
 * Render NexusCore avatar: teal mark on dark circular-friendly square (for X/GitHub social).
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let svg = readFileSync(resolve(root, 'src/dashboard/public/logo-mark.svg'), 'utf8');
svg = svg.replaceAll('currentColor', '#5eead4');
svg = svg.replace(/<circle\s+r="2\.4"[^/]*\/>/, '');

const size = 1024;
const pad = 140;
const html = `<!DOCTYPE html>
<html>
<head>
<style>
  html, body { margin:0; width:${size}px; height:${size}px; background:#0a0e18; overflow:hidden; }
  .wrap {
    width:${size}px; height:${size}px;
    display:flex; align-items:center; justify-content:center;
    background: radial-gradient(circle at 50% 45%, #13202b 0%, #0a0e18 70%);
  }
  svg { width:${size - pad * 2}px; height:${size - pad * 2}px; display:block; }
</style>
</head>
<body>
  <div class="wrap">
    ${svg.replace('<svg', `<svg width="${size - pad * 2}" height="${size - pad * 2}"`)}
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: size, height: size } });
await page.setContent(html, { waitUntil: 'load' });
const buf = await page.screenshot({ type: 'png', omitBackground: false });
const outDir = resolve(root, 'src/dashboard/public/brand');
mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, 'nexuscore-avatar.png');
writeFileSync(out, buf);
console.log('wrote', out, buf.length);
await browser.close();
