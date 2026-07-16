"""Generate client secret for existing OAuth app via CDP."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

APP = "https://github.com/settings/applications/3733447"
OUT = Path(__file__).resolve().parents[1] / ".github-oauth-tmp.json"
CLIENT_ID = "Ov23liFQUYnTkcewcq2W"


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = browser.contexts[0]
        page = ctx.new_page()
        page.goto(APP, wait_until="domcontentloaded", timeout=60_000)
        time.sleep(2)
        print("URL", page.url)
        print("body snippet", page.inner_text("body")[:1500])

        # Try multiple secret generate UI patterns
        candidates = [
            page.get_by_role("button", name=re.compile("Generate a new client secret", re.I)),
            page.locator('button:has-text("Generate a new client secret")'),
            page.locator('input[value*="Generate"]'),
            page.locator('a:has-text("Generate a new client secret")'),
            page.locator('form[action*="client_secret"] button'),
            page.locator('form[action*="client_secret"] input[type="submit"]'),
        ]
        clicked = False
        for loc in candidates:
            try:
                if loc.count() and loc.first.is_visible():
                    loc.first.click(timeout=5000)
                    clicked = True
                    print("clicked", loc)
                    break
            except Exception as e:
                print("click fail", e)

        if not clicked:
            # navigate to client_secret path
            page.goto(APP + "/client_secret", wait_until="domcontentloaded")
            time.sleep(1)
            print("alt url", page.url)

        time.sleep(2)
        text = page.inner_text("body")
        print("after", text[:2000])
        codes = [page.locator("code").nth(i).inner_text().strip() for i in range(min(page.locator("code").count(), 30))]
        print("codes", codes)

        secret = None
        for c in codes:
            if c != CLIENT_ID and len(c) >= 30:
                secret = c
                break
        # also look for input value readonly secret
        inputs = page.eval_on_selector_all(
            "input",
            "els => els.map(e => e.value).filter(Boolean)",
        )
        print("inputs", [i[:8] + "…" if len(i) > 12 else i for i in inputs])
        for i in inputs:
            if i != CLIENT_ID and len(i) >= 30:
                secret = i
                break

        if secret:
            payload = {
                "client_id": CLIENT_ID,
                "client_secret": secret,
                "callback": "https://agentapigw.dpdns.org/api/auth/callback/github",
                "url": page.url,
            }
            OUT.write_text(json.dumps(payload), encoding="utf-8")
            print("WROTE secret len", len(secret))
            return 0

        page.screenshot(path=str(Path(__file__).parent / "oauth-secret-debug.png"), full_page=True)
        print("NO_SECRET")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
