// Checks mobile viewport health: overflow, tap targets, font sizes.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({ headless: true, channel: String.fromCharCode(99,104,114,111,109,101) });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "OpenAI File Downloader, XaiImageApiFetch/1.0" });
const page = await ctx.newPage();
await page.goto("https://agentapigw.dpdns.org/", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
await page.waitForTimeout(2500);
const report = await page.evaluate(() => {
  const doc = document.documentElement;
  const overflowX = doc.scrollWidth - window.innerWidth;
  let overflowers = [];
  if (overflowX > 2) {
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 8 && r.width > 40 && el.children.length < 8) {
        overflowers.push(el.tagName + "." + String(el.className).slice(0, 40) + " right=" + Math.round(r.right));
        if (overflowers.length > 8) break;
      }
    }
  }
  const smallTaps = [];
  for (const a of document.querySelectorAll("a, button")) {
    const r = a.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) {
      smallTaps.push((a.textContent || a.getAttribute("aria-label") || "?").trim().slice(0, 30) + " h=" + Math.round(r.height));
    }
    if (smallTaps.length > 8) break;
  }
  const tinyText = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length > 0) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 12 && el.textContent.trim().length > 3) {
      tinyText.push(fs + "px: " + el.textContent.trim().slice(0, 30));
      if (tinyText.length > 6) break;
    }
  }
  return { overflowX, overflowers, smallTaps, tinyText, h1: document.querySelector("h1") && getComputedStyle(document.querySelector("h1")).fontSize };
});
await ctx.close();
await browser.close();
writeFileSync("mobile-check.json", JSON.stringify(report, null, 2));
console.log("done");
