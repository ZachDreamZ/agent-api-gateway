/**
 * Rasterize NexusCore SVG mark to transparent PNG assets.
 * Usage: node scripts/render-logo-png.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = resolve(root, 'src/dashboard/public/logo-mark.svg');
const outDir = resolve(root, 'src/dashboard/public/brand');

let svg = readFileSync(svgPath, 'utf8');
// Export color: brand teal (currentColor is for UI theming)
svg = svg.replaceAll('currentColor', '#5eead4');
// Drop the dark hollow punch so the core reads solid on any surface
svg = svg.replace(/<circle\s+r="2\.4"[^/]*\/>/, '');

async function renderSize(page, size) {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <style>
      html, body { margin: 0; padding: 0; background: transparent; width: ${size}px; height: ${size}px; overflow: hidden; }
      svg { display: block; width: ${size}px; height: ${size}px; }
    </style>
  </head>
  <body>
    ${svg.replace('<svg', `<svg width="${size}" height="${size}"`)}
  </body>
</html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: 'load' });
  return page.locator('svg').screenshot({ omitBackground: true, type: 'png' });
}

const browser = await chromium.launch();
const page = await browser.newPage();

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: 'nexuscore-mark.png', size: 1024 },
  { name: 'nexuscore-mark-512.png', size: 512 },
  { name: 'nexuscore-mark-256.png', size: 256 },
];

for (const { name, size } of sizes) {
  const buf = await renderSize(page, size);
  const out = resolve(outDir, name);
  writeFileSync(out, buf);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  console.log(`wrote ${name} bytes=${buf.length} png=${isPng}`);
}

await browser.close();
