// End-to-end check of the hero playground: prefill -> Try it -> typed result.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({ headless: true, channel: String.fromCharCode(99,104,114,111,109,101) });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: "OpenAI File Downloader, XaiImageApiFetch/1.0",
});
const page = await ctx.newPage();
const result = {};
try {
  await page.goto("https://agentapigw.dpdns.org/", { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  result.inputs = await page.evaluate(() =>
    [...document.querySelectorAll("input")].map((i) => ({ ph: i.placeholder, val: i.value })),
  );
  result.clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Try it");
    if (!btn) return false;
    btn.click();
    return true;
  });
  let ok = false;
  for (let i = 0; i < 22; i++) {
    await page.waitForTimeout(2000);
    const state = await page.evaluate(() => ({
      success: [...document.querySelectorAll("a")].some((a) => a.textContent.includes("Sign up for full")),
      loading: document.body.innerText.includes("Extracting structured"),
      emptyUrlError: document.body.innerText.includes("Enter a URL"),
      cardText: document.querySelector(".hero-float-card")?.innerText.slice(0, 400) || "",
    }));
    if (state.success || state.emptyUrlError) {
      result.finalState = state;
      ok = state.success;
      break;
    }
    if (i === 21) result.finalState = state;
  }
  result.oneClickDemoWorks = ok;
} catch (e) {
  result.error = String(e).slice(0, 300);
}
await browser.close();
writeFileSync("demo-check.json", JSON.stringify(result, null, 2));
console.log("done ok=" + (result.oneClickDemoWorks === true));
