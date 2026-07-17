"""Set up Resend API key via CDP browser (logged-in Chrome/Brave on :9222)."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env"
OUT = ROOT / ".resend-key-tmp.json"
CDP = "http://127.0.0.1:9222"


def upsert_env(key: str, value: str) -> None:
    text = ENV.read_text(encoding="utf-8") if ENV.exists() else ""
    lines = text.splitlines()
    found = False
    out_lines = []
    for line in lines:
        if re.match(rf"^\s*{re.escape(key)}\s*=", line):
            out_lines.append(f"{key}={value}")
            found = True
        else:
            out_lines.append(line)
    if not found:
        if out_lines and out_lines[-1].strip():
            out_lines.append("")
        out_lines.append(f"{key}={value}")
    ENV.write_text("\n".join(out_lines) + "\n", encoding="utf-8")


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0] if browser.contexts else browser.new_context()
        page = ctx.new_page()

        # Start at API keys (redirects to login if needed)
        page.goto("https://resend.com/api-keys", wait_until="domcontentloaded", timeout=90_000)
        time.sleep(3)
        print("URL1", page.url)

        # Login with GitHub if needed
        if "login" in page.url or "signin" in page.url or "sign-in" in page.url:
            # Prefer GitHub button
            for sel in [
                'button:has-text("GitHub")',
                'a:has-text("GitHub")',
                'button:has-text("Continue with GitHub")',
                'a:has-text("Continue with GitHub")',
                '[data-provider="github"]',
            ]:
                loc = page.locator(sel)
                if loc.count() and loc.first.is_visible():
                    print("click", sel)
                    loc.first.click()
                    break
            page.wait_for_load_state("domcontentloaded", timeout=60_000)
            time.sleep(3)
            print("URL2", page.url)

            # GitHub authorize
            if "github.com" in page.url:
                for sel in [
                    'button:has-text("Authorize")',
                    'button:has-text("Continue")',
                    'button[type="submit"]',
                ]:
                    loc = page.locator(sel)
                    if loc.count() and loc.first.is_visible():
                        try:
                            loc.first.click(timeout=5000)
                            break
                        except Exception as e:
                            print("github click", e)
                page.wait_for_load_state("domcontentloaded", timeout=60_000)
                time.sleep(4)
                print("URL3", page.url)

        # Ensure on api-keys
        if "api-keys" not in page.url:
            page.goto("https://resend.com/api-keys", wait_until="domcontentloaded", timeout=60_000)
            time.sleep(3)
        print("URL keys", page.url)
        print("title", page.title())

        # Create new API key
        created = False
        for sel in [
            'button:has-text("Create API Key")',
            'button:has-text("Create API key")',
            'button:has-text("Add API Key")',
            'a:has-text("Create API Key")',
            'button:has-text("Create")',
        ]:
            loc = page.locator(sel)
            if loc.count() and loc.first.is_visible():
                loc.first.click()
                created = True
                print("opened create via", sel)
                break
        time.sleep(1.5)

        # Fill name
        for sel in [
            'input[name="name"]',
            'input[placeholder*="name" i]',
            'input[placeholder*="Name" i]',
            'input[type="text"]',
        ]:
            loc = page.locator(sel)
            if loc.count() and loc.first.is_visible():
                loc.first.fill("Agent API Gateway")
                print("filled name")
                break

        # Permission full access if radio exists
        for sel in [
            'text=Full access',
            'label:has-text("Full access")',
            'input[value="full_access"]',
        ]:
            loc = page.locator(sel)
            if loc.count() and loc.first.is_visible():
                try:
                    loc.first.click()
                except Exception:
                    pass

        # Submit
        for sel in [
            'button:has-text("Add")',
            'button:has-text("Create")',
            'button:has-text("Save")',
            'button[type="submit"]',
        ]:
            loc = page.locator(sel)
            if loc.count() and loc.first.is_visible():
                # Prefer buttons in dialog
                try:
                    loc.last.click(timeout=3000)
                    print("submit", sel)
                    break
                except Exception as e:
                    print("submit fail", e)
        time.sleep(2.5)

        body = page.inner_text("body")
        # Capture re_ key
        keys = re.findall(r"\bre_[A-Za-z0-9]{10,}\b", body)
        # Also check inputs
        inputs = page.eval_on_selector_all(
            "input",
            "els => els.map(e => e.value).filter(v => v && v.startsWith('re_'))",
        )
        codes = page.eval_on_selector_all(
            "code, pre, [data-testid], span",
            """els => els.map(e => (e.textContent||'').trim()).filter(t => /^re_[A-Za-z0-9]{10,}$/.test(t))""",
        )
        all_keys = list(dict.fromkeys(keys + list(inputs or []) + list(codes or [])))
        print("found_keys", [k[:10] + "…" for k in all_keys])

        # Copy button?
        if not all_keys:
            for sel in ['button:has-text("Copy")', 'button[aria-label*="Copy" i]']:
                loc = page.locator(sel)
                if loc.count() and loc.first.is_visible():
                    loc.first.click()
                    time.sleep(0.5)
            try:
                clip = page.evaluate("navigator.clipboard.readText()")
                if clip and clip.startswith("re_"):
                    all_keys.append(clip)
            except Exception as e:
                print("clipboard", e)

        secret = all_keys[0] if all_keys else None
        if not secret:
            shot = ROOT / "scripts" / "resend-debug.png"
            page.screenshot(path=str(shot), full_page=True)
            print("NO_KEY screenshot", shot)
            print("body_snip", body[:800].replace("\n", " | "))
            return 1

        OUT.write_text(json.dumps({"resend_api_key": secret}), encoding="utf-8")
        upsert_env("RESEND_API_KEY", secret)
        upsert_env("EMAIL_FROM", "Agent API <onboarding@resend.dev>")
        upsert_env("BETTER_AUTH_URL", "https://agentapigw.dpdns.org")
        upsert_env("APP_DOMAIN", "https://agentapigw.dpdns.org")
        # widen CORS for custom domain if missing
        text = ENV.read_text(encoding="utf-8")
        if "agentapigw.dpdns.org" not in text or "CORS_ORIGIN" in text:
            upsert_env(
                "CORS_ORIGIN",
                "http://localhost:3000,http://localhost:5173,https://agent-api-gateway.onrender.com,https://agentapigw.dpdns.org",
            )
        print("WROTE_ENV key_len", len(secret))
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
