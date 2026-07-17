#!/usr/bin/env python3
"""Create ImprovMX MX+SPF records using logged-in Cloudflare dashboard session (Brave CDP)."""
from __future__ import annotations

import json
import time

from playwright.sync_api import sync_playwright

ZONE = "987de11e2425f7773a7bfdfd4e46b61d"
DOMAIN = "agentapigw.dpdns.org"
ACCOUNT = "c13ece43fe55a8396292a53ab4d189be"


def main() -> None:
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = b.contexts[0]
        page = next((pg for pg in ctx.pages if "dash.cloudflare.com" in pg.url), None)
        if page is None:
            page = ctx.new_page()
        page.goto(
            f"https://dash.cloudflare.com/{ACCOUNT}/{DOMAIN}/dns/records",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(2)
        print("url", page.url)

        # Run API calls in page context (session cookies)
        result = page.evaluate(
            """async ({ zoneId, domain }) => {
  const base = `/api/v4/zones/${zoneId}/dns_records`;
  const j = async (r) => {
    const t = await r.text();
    try { return JSON.parse(t); } catch { return { parse_error: true, status: r.status, body: t.slice(0, 500) }; }
  };
  const list = async () => j(await fetch(base + '?per_page=100', { credentials: 'include' }));
  const create = async (body) => j(await fetch(base, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));

  const existing = await list();
  if (!existing.success && !existing.result) {
    return { error: 'list_failed', existing };
  }
  const records = existing.result || [];
  const before = records.map(r => ({ type: r.type, name: r.name, content: r.content, priority: r.priority }));

  const wants = [
    { type: 'MX', name: domain, content: 'mx1.improvmx.com', priority: 10, ttl: 3600 },
    { type: 'MX', name: domain, content: 'mx2.improvmx.com', priority: 20, ttl: 3600 },
    { type: 'TXT', name: domain, content: 'v=spf1 include:spf.improvmx.com ~all', ttl: 3600 },
  ];
  const created = [];
  for (const w of wants) {
    const exists = records.find(r =>
      r.type === w.type &&
      (r.content || '').toLowerCase().replace(/\\.$/, '') === w.content.toLowerCase()
    );
    if (exists) {
      created.push({ skipped: true, type: w.type, content: w.content, id: exists.id });
      continue;
    }
    created.push({ request: w, response: await create(w) });
  }
  const afterList = await list();
  const after = (afterList.result || []).map(r => ({
    type: r.type, name: r.name, content: r.content, priority: r.priority
  }));
  return { before, created, after };
}""",
            {"zoneId": ZONE, "domain": DOMAIN},
        )
        print(json.dumps(result, indent=2))

        # ImprovMX alias + DNS check
        imx = ctx.new_page()
        imx.goto(
            f"https://app.improvmx.com/domains/{DOMAIN}/aliases",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        time.sleep(2)
        text = imx.inner_text("body")
        print("ALIASES PAGE:\n", text[:1500])
        if "support@" not in text and "support" not in text.split("\n")[0:30]:
            alias_in = imx.locator("input[placeholder='new-alias']")
            dest_in = imx.locator("input[placeholder*='Email']")
            if alias_in.count() and dest_in.count():
                alias_in.first.fill("support")
                dest_in.first.fill("xxtheshadowcraft@gmail.com")
                imx.locator("input[type='submit']").first.click()
                time.sleep(2)
                print("alias submit result:\n", imx.inner_text("body")[:1000])

        imx.goto(
            f"https://app.improvmx.com/domains/{DOMAIN}/dns",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        time.sleep(2)
        if imx.locator("text=Check again").count():
            imx.locator("text=Check again").first.click()
            time.sleep(8)
        print("IMX DNS CHECK:\n", imx.inner_text("body")[:2500])

        # Public DNS verify
        import subprocess

        for q in ["MX", "TXT"]:
            out = subprocess.run(
                ["nslookup", f"-type={q}", DOMAIN],
                capture_output=True,
                text=True,
                timeout=30,
            )
            print(f"nslookup {q}:\n", out.stdout, out.stderr)


if __name__ == "__main__":
    main()
