"""Create Resend API key on CDP 9222 (logged-in browser) and write .env."""
from __future__ import annotations

import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env"
CDP = "http://127.0.0.1:9222"


def upsert(k: str, v: str) -> None:
    text = ENV.read_text(encoding="utf-8") if ENV.exists() else ""
    lines = text.splitlines()
    out, found = [], False
    for line in lines:
        if re.match(rf"^\s*{re.escape(k)}\s*=", line):
            out.append(f"{k}={v}")
            found = True
        else:
            out.append(line)
    if not found:
        if out and out[-1].strip():
            out.append("")
        out.append(f"{k}={v}")
    ENV.write_text("\n".join(out) + "\n", encoding="utf-8")


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]
        page = ctx.new_page()
        page.set_default_timeout(25_000)
        page.goto("https://resend.com/api-keys", wait_until="domcontentloaded")
        time.sleep(2)
        print("url", page.url, "title", page.title())

        if "login" in page.url:
            # try GitHub
            for sel in [
                'button:has-text("GitHub")',
                'a:has-text("GitHub")',
                'button:has-text("Continue with GitHub")',
            ]:
                loc = page.locator(sel)
                if loc.count() and loc.first.is_visible():
                    loc.first.click()
                    break
            time.sleep(4)
            if "github.com" in page.url:
                for sel in ['button:has-text("Authorize")', 'button[type="submit"]']:
                    loc = page.locator(sel)
                    if loc.count() and loc.first.is_visible():
                        loc.first.click()
                        break
                time.sleep(4)
            page.goto("https://resend.com/api-keys", wait_until="domcontentloaded")
            time.sleep(2)
            print("after login", page.url)

        if "login" in page.url:
            page.screenshot(path=str(ROOT / "scripts" / "resend-login.png"), full_page=True)
            print("STILL_LOGIN")
            return 2

        page.get_by_role("button", name=re.compile("Create API key", re.I)).first.click()
        time.sleep(1.2)

        dialog = page.locator('[role="dialog"], form')
        filled = False
        for sel in [
            '[role="dialog"] input[type="text"]',
            'input[name="name"]',
            'input[placeholder*="name" i]',
        ]:
            loc = page.locator(sel)
            if loc.count() and loc.first.is_visible():
                loc.first.fill("Agent API Gateway")
                filled = True
                print("filled name")
                break
        if not filled:
            page.locator('input[type="text"]').last.fill("Agent API Gateway")

        # Prefer full access
        try:
            page.get_by_text("Full access", exact=False).first.click(timeout=2000)
        except Exception:
            pass

        for label in ("Add", "Create", "Save"):
            btn = page.get_by_role("button", name=re.compile(rf"^{label}$", re.I))
            if btn.count():
                try:
                    btn.last.click(timeout=3000)
                    print("submit", label)
                    break
                except Exception:
                    continue

        time.sleep(2.5)
        keys = re.findall(r"\bre_[A-Za-z0-9]{20,}\b", page.inner_text("body"))
        vals = page.eval_on_selector_all(
            "input",
            "els => els.map(e => e.value).filter(v => v && v.startsWith('re_') && v.length > 20)",
        )
        keys = list(dict.fromkeys(list(keys) + list(vals or [])))
        print("keys", [k[:8] + "..." for k in keys])

        if not keys:
            try:
                page.get_by_role("button", name=re.compile("Copy", re.I)).first.click()
                time.sleep(0.4)
                clip = page.evaluate("navigator.clipboard.readText()")
                if isinstance(clip, str) and clip.startswith("re_"):
                    keys = [clip]
            except Exception as e:
                print("copy fail", e)

        if not keys:
            page.screenshot(path=str(ROOT / "scripts" / "resend-debug.png"), full_page=True)
            print("FAIL", page.inner_text("body")[:500].replace("\n", " | "))
            return 1

        secret = keys[0]
        upsert("RESEND_API_KEY", secret)
        upsert("EMAIL_FROM", "Agent API <onboarding@resend.dev>")
        upsert("BETTER_AUTH_URL", "https://agentapigw.dpdns.org")
        upsert("APP_DOMAIN", "https://agentapigw.dpdns.org")
        upsert(
            "CORS_ORIGIN",
            "http://localhost:3000,http://localhost:5173,https://agent-api-gateway.onrender.com,https://agentapigw.dpdns.org",
        )
        print("SUCCESS len", len(secret))
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
