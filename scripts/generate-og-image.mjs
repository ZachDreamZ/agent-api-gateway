// Generates public/og-image.png from an inline SVG design.
// Run: node scripts/generate-og-image.mjs
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#0e1a2b"/>
      <stop offset="100%" stop-color="#070c14"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="1050" cy="120" r="260" fill="#0d2a33" opacity="0.55"/>
  <circle cx="120" cy="560" r="200" fill="#0a1f2b" opacity="0.5"/>
  <rect x="72" y="96" width="64" height="64" rx="16" fill="#0d2a33"/>
  <path d="M104 108 l22 20 -22 20" stroke="#5eead4" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="160" y="140" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="600" fill="#e8eef5">Agent API Gateway</text>
  <text x="72" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="76" font-weight="700" fill="#f4f8fc">Structured web data</text>
  <text x="72" y="392" font-family="Segoe UI, Arial, sans-serif" font-size="76" font-weight="700" fill="#5eead4">for AI agents.</text>
  <text x="72" y="468" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#9fb0c2">URL + schema &#8594; validated JSON in one call.</text>
  <rect x="72" y="516" width="420" height="56" rx="12" fill="#0d2a33" stroke="#1b4a52"/>
  <text x="96" y="552" font-family="Consolas, monospace" font-size="24" fill="#7dd3c8">POST /v1/extract</text>
  <text x="952" y="560" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#6b7c8e">by NexusCore</text>
</svg>`;

const out = fileURLToPath(new URL('../src/dashboard/public/og-image.png', import.meta.url));
const info = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
console.log(`og-image.png ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
