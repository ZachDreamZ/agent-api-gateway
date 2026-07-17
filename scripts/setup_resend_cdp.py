"""
Resend setup via Chrome DevTools Protocol (port 9222).
Does not use agent-browser or Brave-specific tooling.
"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env"
CDP = "http://127.0.0.1:9222"


def upsert_env(key: str, value: str) -> None:
    text = ENV.read_text(encoding="utf-8") if ENV.exists() else ""
    lines = text.splitlines()
    out, found = [], False
    for line in lines:
        if re.match(rf"^\s*{re.escape(key)}\s*=", line):
            out.append(f"{key}={value}")
            found = True
        else:
            out.append(line)
    if not found:
        if out and out[-1].strip():
            out.append("")
        out.append(f"{key}={value}")
    ENV.write_text("\n".join(out) + "\n", encoding="utf-8")


def find_re_keys(page) -> list[str]:
    keys: list[str] = []
    try:
        body = page.inner_text("body", timeout=5000)
        keys += re.findall(r"\bre_[A-Za-z0-9]{10,}\b", body)
    except Exception:
        pass
    try:
        keys += page.eval_on_selector_all(
            "input, textarea, code, pre, span, p, div",
            """els => els.flatMap(e => {
              const vals = [e.value, e.textContent, e.getAttribute('data-clipboard-text')];
              return vals.filter(v => v && /^re_[A-Za-z0-9]{10,}$/.test(String(v).trim()))
                        .map(v => String(v).trim());
            })""",
        )
    except Exception:
        pass
    # unique preserve order
    seen, uniq = set(), []
    for k in keys:
        if k not in seen:
            seen.add(k)
            uniq.append(k)
    return uniq


def click_first(page, selectors: list[str], label: str) -> bool:
    for sel in selectors:
        try:
            loc = page.locator(sel)
            n = loc.count()
            for i in range(min(n, 5)):
                el = loc.nth(i)
                if el.is_visible(timeout=500):
                    el.click(timeout=5000)
                    print(f"clicked {label}: {sel} #{i}")
                    return True
        except Exception as e:
            print(f"skip {sel}: {e}")
    return False


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        print("connected contexts", len(browser.contexts))
        ctx = browser.contexts[0]
        page = ctx.new_page()
        page.set_default_timeout(20000)

        page.goto("https://resend.com/api-keys", wait_until="domcontentloaded")
        time.sleep(2)
        print("url", page.url)

        # Auth walls
        if any(x in page.url for x in ("login", "signin", "sign-in", "auth")):
            click_first(
                page,
                [
                    'button:has-text("Continue with GitHub")',
                    'a:has-text("Continue with GitHub")',
                    'button:has-text("GitHub")',
                    'a:has-text("GitHub")',
                    '[href*="github"]',
                ],
                "github-login",
            )
            time.sleep(3)
            print("after oauth start", page.url)
            if "github.com" in page.url:
                click_first(
                    page,
                    [
                        'button:has-text("Authorize")',
                        'button:has-text("Continue")',
                        'button[name="authorize"]',
                        'button[type="submit"]',
                    ],
                    "github-authorize",
                )
                time.sleep(4)
            # land back
            if "api-keys" not in page.url:
                page.goto("https://resend.com/api-keys", wait_until="domcontentloaded")
                time.sleep(2)
            print("url after auth", page.url)

        if any(x in page.url for x in ("login", "signin")):
            page.screenshot(path=str(ROOT / "scripts" / "resend-login.png"), full_page=True)
            print("STILL_LOGIN")
            print(page.inner_text("body")[:600])
            return 2

        # Create key UI
        click_first(
            page,
            [
                'button:has-text("Create API Key")',
                'button:has-text("Create API key")',
                'a:has-text("Create API Key")',
                'button:has-text("Create key")',
                'button:has-text("Add API Key")',
                'button:has-text("Create")',
            ],
            "create",
        )
        time.sleep(1.2)

        # Name field
        for sel in [
            'input[name="name"]',
            'input[placeholder*="name" i]',
            'input[placeholder*="Name"]',
            'dialog input[type="text"]',
            '[role="dialog"] input[type="text"]',
            'input[type="text"]',
        ]:
            loc = page.locator(sel)
            try:
                if loc.count() and loc.first.is_visible():
                    loc.first.fill("Agent API Gateway")
                    print("name filled", sel)
                    break
            except Exception:
                pass

        # Full access if present
        click_first(
            page,
            [
                'label:has-text("Full access")',
                'text=Full access',
                'input[value="full_access"]',
                'button:has-text("Full access")',
            ],
            "permission",
        )

        click_first(
            page,
            [
                'dialog button:has-text("Add")',
                '[role="dialog"] button:has-text("Add")',
                'dialog button:has-text("Create")',
                '[role="dialog"] button:has-text("Create")',
                'button:has-text("Create")',
                'button:has-text("Add")',
                'button[type="submit"]',
            ],
            "submit",
        )
        time.sleep(2.5)

        keys = find_re_keys(page)
        print("keys_found", len(keys), [k[:8] + "…" for k in keys])

        if not keys:
            # try copy
            click_first(page, ['button:has-text("Copy")', 'button[aria-label*="opy"]'], "copy")
            time.sleep(0.5)
            try:
                clip = page.evaluate("navigator.clipboard.readText()")
                if isinstance(clip, str) and clip.startswith("re_"):
                    keys = [clip]
            except Exception as e:
                print("clipboard", e)
            keys = keys or find_re_keys(page)

        if not keys:
            page.screenshot(path=str(ROOT / "scripts" / "resend-debug.png"), full_page=True)
            print("body", page.inner_text("body")[:900].replace("\n", " | "))
            return 1

        secret = keys[0]
        upsert_env("RESEND_API_KEY", secret)
        upsert_env("EMAIL_FROM", "Agent API <onboarding@resend.dev>")
        upsert_env("BETTER_AUTH_URL", "https://agentapigw.dpdns.org")
        upsert_env("APP_DOMAIN", "https://agentapigw.dpdns.org")
        upsert_env(
            "CORS_ORIGIN",
            "http://localhost:3000,http://localhost:5173,https://agent-api-gateway.onrender.com,https://agentapigw.dpdns.org",
        )
        # temp file for render push if needed (gitignored via .env patterns)
        (ROOT / ".resend-key-tmp.json").write_text(
            json.dumps({"ok": True, "len": len(secret)}), encoding="utf-8"
        )
        print("SUCCESS key_len", len(secret))
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
