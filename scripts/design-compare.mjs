// Extracts comparable design metrics from our site vs benchmarks.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const UA = "OpenAI File Downloader, XaiImageApiFetch/1.0";
const sites = [
  { id: "ours", url: "https://agentapigw.dpdns.org/" },
  { id: "linear", url: "https://linear.app/" },
  { id: "stripe", url: "https://stripe.com/" },
  { id: "vercel", url: "https://vercel.com/" },
];

const browser = await chromium.launch({ headless: true, channel: String.fromCharCode(99,104,114,111,109,101) });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA });
const results = {};
for (const s of sites) {
  const page = await ctx.newPage();
  try { await page.goto(s.url, { waitUntil: "domcontentloaded", timeout: 30000 }); } catch {}
  await page.waitForTimeout(2500);
  results[s.id] = await page.evaluate(() => {
    const pick = (el, props) => {
      if (!el) return null;
      const c = getComputedStyle(el);
      const o = {};
      for (const p of props) o[p] = c[p];
      return o;
    };
    const h1 = document.querySelector("h1");
    const btn = [...document.querySelectorAll("a")].find(a => {
      const r = a.getBoundingClientRect();
      return r.width > 80 && r.height > 36 && getComputedStyle(a).backgroundColor !== "rgba(0, 0, 0, 0)";
    });
    const nav = document.querySelector("nav") || document.querySelector("header");
    const imgs = document.images.length;
    const sections = document.querySelectorAll("section").length;
    const body = getComputedStyle(document.body);
    return {
      title: document.title.slice(0, 60),
      h1Text: h1?.textContent?.trim().slice(0, 90) ?? null,
      h1Style: pick(h1, ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "fontFamily"]),
      primaryBtn: pick(btn, ["backgroundColor", "color", "borderRadius", "padding", "fontSize", "fontWeight"]),
      btnText: btn?.textContent?.trim().slice(0, 40) ?? null,
      navStyle: pick(nav, ["position", "backdropFilter", "borderBottomWidth", "height"]),
      bodyBg: body.backgroundColor,
      bodyFont: body.fontFamily.slice(0, 60),
      images: imgs,
      sections,
      scrollHeight: document.documentElement.scrollHeight,
      maxWidths: [...new Set([...document.querySelectorAll("main *, section *")].map(e => getComputedStyle(e).maxWidth).filter(v => v !== "none"))].slice(0, 6),
    };
  });
  await page.close();
}
await ctx.close();
await browser.close();
writeFileSync("design-compare.json", JSON.stringify(results, null, 2));
console.log("done");
