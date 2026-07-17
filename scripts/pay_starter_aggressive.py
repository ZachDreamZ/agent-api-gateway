#!/usr/bin/env python3
"""Open live Polar $1 checkout and try every available wallet path (no invented PANs)."""
from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
OUT.mkdir(parents=True, exist_ok=True)


def create_checkout() -> dict:
    req = urllib.request.Request(
        "https://agentapigw.dpdns.org/v1/billing/pricing/checkout",
        data=json.dumps({"sku": "starter"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def main() -> None:
    ck = create_checkout()
    (OUT / "pay-attempt-checkout.json").write_text(json.dumps(ck, indent=2), encoding="utf-8")
    print("checkout", ck)

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]
        page = ctx.new_page()
        page.goto(ck["url"], wait_until="domcontentloaded", timeout=120000)
        time.sleep(3)
        print("url", page.url, "title", page.title())
        body0 = page.inner_text("body")
        print(
            "blocked=",
            any(
                s in body0
                for s in ("Payments are currently unavailable", "test mode", "free products or 100%")
            ),
        )
        page.screenshot(path=str(OUT / "pay-open.png"), full_page=True)

        # Fill identity
        for sel, val in [
            ('input[type="email"]', "xxtheshadowcraft@gmail.com"),
            ('input[placeholder*="Cardholder" i]', "Vendex"),
            ('input[autocomplete="cc-name"]', "Vendex"),
            ('input[name*="name" i]', "Vendex"),
        ]:
            loc = page.locator(sel)
            if loc.count():
                try:
                    loc.first.fill(val)
                    print("filled", sel)
                except Exception as e:
                    print("fill fail", sel, e)

        # Country Philippines
        try:
            combo = page.locator('[role="combobox"], select').first
            if combo.count():
                combo.click(timeout=2000)
                time.sleep(0.5)
                opt = page.get_by_role("option", name="Philippines")
                if opt.count():
                    opt.first.click()
                    print("country PH")
        except Exception as e:
            print("country", e)

        # Enumerate clickable payment affordances
        for f in page.frames:
            u = f.url or ""
            if any(k in u for k in ("stripe", "pay", "link")):
                print("FRAME", u[:140])

        # Click wallet / pay buttons
        for label in [
            "Google Pay",
            "GPay",
            "Pay with Link",
            "Link",
            "Apple Pay",
            "PayPal",
            "Pay now",
        ]:
            loc = page.locator(f'button:has-text("{label}"), [role="button"]:has-text("{label}")')
            n = loc.count()
            if n:
                print(f"button {label!r} n={n}")
                try:
                    loc.first.click(force=True, timeout=5000)
                    print("clicked", label)
                    time.sleep(4)
                    page.screenshot(path=str(OUT / f"pay-after-{label.replace(' ','_')}.png"), full_page=True)
                except Exception as e:
                    print("click fail", label, e)

        # Stripe payment-request iframes
        for f in page.frames:
            if "payment-request" in f.url or "google-pay" in f.url or "link" in f.url.lower():
                try:
                    f.click("body", force=True, timeout=3000)
                    print("frame body click", f.url[:80])
                    time.sleep(2)
                    for sel in ["button", "[role=button]", "div[role=button]", "#gpay-button"]:
                        if f.locator(sel).count():
                            f.locator(sel).first.click(force=True, timeout=3000)
                            print("frame btn", sel)
                            time.sleep(3)
                except Exception as e:
                    print("frame", e)

        # Final pay now
        pay = page.locator('button:has-text("Pay now"), button:has-text("Pay")')
        if pay.count():
            try:
                pay.first.click(force=True, timeout=5000)
                print("pay now clicked")
                time.sleep(5)
            except Exception as e:
                print("pay now", e)

        page.screenshot(path=str(OUT / "pay-end.png"), full_page=True)
        final_body = page.inner_text("body")
        print("final_url", page.url)
        print(final_body[:1500])
        (OUT / "pay-attempt-end.txt").write_text(
            f"session={ck.get('session_id')}\nurl={page.url}\nbody=\n{final_body[:4000]}\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
