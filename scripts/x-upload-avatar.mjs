import { chromium } from 'playwright';
import { resolve } from 'node:path';

const logo = resolve('src/dashboard/public/brand/nexuscore-mark.png');
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const pages = browser.contexts().flatMap((c) => c.pages());
const page = pages.find((p) => p.url().includes('x.com')) || pages.at(-1);
if (!page) throw new Error('No X page found');
console.log('page', page.url());

const inputs = page.locator('input[type="file"]');
const count = await inputs.count();
console.log('file inputs', count);
for (let i = 0; i < count; i++) {
  const accept = await inputs.nth(i).getAttribute('accept');
  console.log(i, accept);
}

// Prefer second image-only input (avatar). Fallback to last image-only.
let target = 1;
if (count < 2) target = 0;
await inputs.nth(target).setInputFiles(logo);
console.log('set files on input', target, logo);

// Wait for crop/apply UI
await page.waitForTimeout(1500);
const apply = page.getByRole('button', { name: /^Apply$/i });
if (await apply.count()) {
  await apply.first().click();
  console.log('clicked Apply');
  await page.waitForTimeout(1000);
}

const save = page.getByRole('button', { name: /^Save$/i });
if (await save.count()) {
  await save.first().click();
  console.log('clicked Save');
  await page.waitForTimeout(2000);
}

console.log('done url', page.url());
await browser.close();
