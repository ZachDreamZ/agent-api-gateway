// Captures comparable screenshots of our site vs top-tier SaaS sites.
// Writes shots/*.png + shots/manifest.json, then exits.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const UA = "OpenAI File Downloader, XaiImageApiFetch/1.0";
const OUT = "D:/micro-saas-agent-api/shots";
mkdirSync(OUT, { recursive: true });

const sites = [
  { id: "ours", url: "https://agentapigw.dpdns.org/" },
  { id: "linear", url: "https://linear.app/" },
  { id: "stripe", url: "https://stripe.com/" },
  { id: "vercel", url: "https://vercel.com/" },
];

const viewports = [
  { tag: "desktop", width: 1440, height: 900 },
  { tag: "mobile", width: 390, height: 844 },
];

const manifest = [];
const browser = await chromium.launch({ headless: true, channel: String.fromCharCode(99,104,114,111,109,101) });
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    userAgent: UA,
  });
  for (const site of sites) {
    const page = await ctx.newPage();
    try {
      await page.goto(site.url, { waitUntil: "networkidle", timeout: 45000 });
    } catch {
      await page.waitForTimeout(3000);
    }
    await page.waitForTimeout(1200);
    // Above the fold
    await page.screenshot({ path: OUT + "/" + site.id + "-" + vp.tag + "-hero.png" });
    manifest.push(site.id + "-" + vp.tag + "-hero.png");
    if (vp.tag === "desktop") {
      // Mid-page scroll
      await page.evaluate(() => window.scrollTo(0, 2200));
      await page.waitForTimeout(900);
      await page.screenshot({ path: OUT + "/" + site.id + "-desktop-mid.png" });
      manifest.push(site.id + "-desktop-mid.png");
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(OUT + "/manifest.json", JSON.stringify(manifest, null, 2));
console.log("captured " + manifest.length + " shots");
