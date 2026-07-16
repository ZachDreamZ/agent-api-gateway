"""Create a GitHub OAuth App via Brave CDP (logged-in session on :9222)."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / ".github-oauth-tmp.json"
CALLBACK = "https://agentapigw.dpdns.org/api/auth/callback/github"
HOME = "https://agentapigw.dpdns.org"


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = browser.contexts[0] if browser.contexts else browser.new_context()
        page = ctx.new_page()
        page.goto(
            "https://github.com/settings/applications/new",
            wait_until="domcontentloaded",
            timeout=60_000,
        )
        time.sleep(2)
        print("URL:", page.url)
        if "/login" in page.url:
            print("NEED_LOGIN")
            return 2

        # Dump input names for debug
        names = page.eval_on_selector_all(
            "input, textarea",
            "els => els.map(e => ({tag:e.tagName, name:e.name, id:e.id, type:e.type, placeholder:e.placeholder}))",
        )
        print("fields:", json.dumps(names)[:2000])

        def set_field(name_or_id: str, value: str) -> bool:
            for sel in [
                f'#{name_or_id}',
                f'[name="{name_or_id}"]',
                f'input[name="{name_or_id}"]',
                f'textarea[name="{name_or_id}"]',
            ]:
                loc = page.locator(sel)
                if loc.count() and loc.first.is_visible():
                    loc.first.fill(value)
                    return True
            return False

        # Common GitHub OAuth form field names
        set_field("oauth_application_name", "Agent API Gateway")
        set_field("oauth_application[name]", "Agent API Gateway")
        set_field("oauth_application_url", HOME)
        set_field("oauth_application[url]", HOME)
        set_field("oauth_application_description", "Dashboard auth for Agent API Gateway")
        set_field("oauth_application[description]", "Dashboard auth for Agent API Gateway")
        set_field("oauth_application_callback_url", CALLBACK)
        set_field("oauth_application[callback_url]", CALLBACK)

        # Prefer the primary form submit on the main content
        submitted = False
        for sel in [
            'form[action*="applications"] button[type="submit"]',
            'form button.btn-primary:has-text("Register")',
            'button.btn-primary:has-text("Register application")',
            'input.btn-primary[type="submit"]',
            'main button[type="submit"]',
        ]:
            loc = page.locator(sel)
            if loc.count() and loc.first.is_visible():
                loc.first.click(timeout=10_000)
                submitted = True
                break

        if not submitted:
            # last resort: submit nearest form containing name field
            page.evaluate(
                """() => {
                  const name = document.querySelector('[name="oauth_application[name]"], #oauth_application_name');
                  if (name && name.form) name.form.requestSubmit();
                }"""
            )

        page.wait_for_load_state("domcontentloaded", timeout=30_000)
        time.sleep(2.5)
        print("After submit URL:", page.url)

        codes = [
            page.locator("code").nth(i).inner_text().strip()
            for i in range(min(page.locator("code").count(), 12))
        ]
        print("codes:", codes)

        gen = page.get_by_role("button", name=re.compile("Generate a new client secret", re.I))
        secret = None
        if gen.count():
            gen.first.click()
            time.sleep(2)
            secrets = [
                page.locator("code").nth(i).inner_text().strip()
                for i in range(min(page.locator("code").count(), 20))
            ]
            print("after secret:", secrets)
            for c in secrets:
                if len(c) >= 30 and c not in codes:
                    secret = c
                    break

        client_id = None
        for c in codes:
            if re.match(r"^(Ov|Iv)[0-9A-Za-z._-]+$", c) or (10 <= len(c) <= 40 and re.match(r"^[A-Za-z0-9]+$", c)):
                client_id = c
                break
        if not client_id and codes:
            client_id = codes[0]

        payload = {
            "client_id": client_id,
            "client_secret": secret,
            "callback": CALLBACK,
            "url": page.url,
        }
        print(
            json.dumps(
                {
                    k: (v if k != "client_secret" else (f"len={len(v)}" if v else None))
                    for k, v in payload.items()
                }
            )
        )
        if client_id and secret:
            OUT.write_text(json.dumps(payload), encoding="utf-8")
            print("WROTE", OUT)
            return 0

        shot = Path(__file__).resolve().parent / "oauth-debug.png"
        page.screenshot(path=str(shot), full_page=True)
        print("screenshot", shot)
        print("MISSING_CREDENTIALS")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
