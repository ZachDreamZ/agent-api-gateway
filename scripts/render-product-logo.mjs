/**
 * Rasterize Agent API Gateway product mark to transparent PNGs.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let svg = readFileSync(resolve(root, 'src/dashboard/public/logo-product.svg'), 'utf8');
svg = svg.replaceAll('currentColor', '#5eead4');

async function render(page, size) {
  const html = `<!DOCTYPE html><html><head>
<style>html,body{margin:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden}
svg{display:block;width:${size}px;height:${size}px}</style></head>
<body>${svg.replace('<svg', `<svg width="${size}" height="${size}"`)}</body></html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: 'load' });
  return page.locator('svg').screenshot({ omitBackground: true, type: 'png' });
}

const browser = await chromium.launch();
const page = await browser.newPage();
const outDir = resolve(root, 'src/dashboard/public/brand');
mkdirSync(outDir, { recursive: true });
for (const size of [1024, 512, 256]) {
  const buf = await render(page, size);
  const name = size === 1024 ? 'agent-api-gateway-mark.png' : `agent-api-gateway-mark-${size}.png`;
  writeFileSync(resolve(outDir, name), buf);
  console.log('wrote', name, buf.length);
}
// dark social avatar for product
const size = 1024;
const pad = 160;
const darkHtml = `<!DOCTYPE html><html><head><style>
html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden}
.wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
background:radial-gradient(circle at 50% 45%,#13202b 0%,#0a0e18 70%)}
svg{width:${size-pad*2}px;height:${size-pad*2}px;display:block}
</style></head><body><div class="wrap">${svg.replace('<svg', `<svg width="${size-pad*2}" height="${size-pad*2}"`)}</div></body></html>`;
await page.setViewportSize({ width: size, height: size });
await page.setContent(darkHtml, { waitUntil: 'load' });
const avatar = await page.screenshot({ type: 'png' });
writeFileSync(resolve(outDir, 'agent-api-gateway-avatar.png'), avatar);
console.log('wrote agent-api-gateway-avatar.png', avatar.length);
await browser.close();
