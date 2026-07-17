#!/usr/bin/env python3
"""
Open live Polar $1 Starter checkout in the logged-in Brave profile
and attempt payment (Link / Google Pay / saved methods if present).
Does NOT invent card numbers.
"""
from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
OUT.mkdir(parents=True, exist_ok=True)
BUY_API = "https://agentapigw.dpdns.org/v1/billing/pricing/checkout"


def create_checkout() -> dict:
    req = urllib.request.Request(
        BUY_API,
        data=json.dumps({"sku": "starter"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode())


def main() -> None:
    ck = create_checkout()
    print("checkout", json.dumps(ck))
    (OUT / "purchase-checkout.json").write_text(json.dumps(ck, indent=2), encoding="utf-8")
    url = ck["url"]

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=90000)
        time.sleep(3)
        print("url", page.url)
        print("title", page.title())
        page.screenshot(path=str(OUT / "purchase-checkout-open.png"), full_page=True)
        body = page.inner_text("body")
        print("body snippet:\n", body[:2500])
        blocked = any(
            s in body
            for s in (
                "Payments are currently unavailable",
                "test mode",
                "You can test checkout with free products",
            )
        )
        print("blocked_ui=", blocked)

        # Fill email if empty
        email = page.locator('input[type="email"], input[name="email"], input[placeholder*="Email" i]')
        if email.count():
            try:
                val = email.first.input_value()
                if not val:
                    email.first.fill("buyer@agentapigw.dpdns.org")
                    print("filled email")
            except Exception as e:
                print("email", e)

        # Cardholder
        name = page.locator('input[placeholder*="Cardholder" i], input[name*="name" i]')
        if name.count():
            try:
                if not name.first.input_value():
                    name.first.fill("Agent API Customer")
                    print("filled name")
            except Exception as e:
                print("name", e)

        # Look for Link / Google Pay / Apple Pay / Wallet buttons
        for label in [
            "Pay with Link",
            "Link",
            "Google Pay",
            "GPay",
            "Apple Pay",
            "PayPal",
            "Pay now",
            "Subscribe",
            "Pay $1",
            "Pay US$1",
        ]:
            loc = page.get_by_role("button", name=label)
            if not loc.count():
                loc = page.locator(f'button:has-text("{label}"), [role="button"]:has-text("{label}")')
            if loc.count():
                print(f"found button: {label} count={loc.count()}")

        # Try clicking Google Pay / Link if present
        paid = False
        for sel in [
            'button:has-text("Google Pay")',
            'button:has-text("GPay")',
            '[aria-label*="Google Pay" i]',
            'button:has-text("Pay with Link")',
            'button:has-text("Link")',
            'iframe[title*="Google Pay" i]',
        ]:
            loc = page.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=5000)
                    print("clicked", sel)
                    time.sleep(4)
                    page.screenshot(path=str(OUT / "purchase-after-wallet.png"), full_page=True)
                    break
                except Exception as e:
                    print("click fail", sel, e)

        # Snapshot payment iframes
        frames = page.frames
        print("frames", len(frames))
        for f in frames:
            try:
                u = f.url
                if "stripe" in u or "pay" in u:
                    print(" frame", u[:120])
            except Exception:
                pass

        page.screenshot(path=str(OUT / "purchase-final.png"), full_page=True)
        print("final url", page.url)
        print("final body:\n", page.inner_text("body")[:2000])

        # Success heuristics
        final = page.url + " " + page.inner_text("body")
        if any(k in final.lower() for k in ("success", "thank you", "payment successful", "confirmed", "receipt")):
            paid = True
            print("LIKELY PAID UI")

        (OUT / "purchase-attempt.txt").write_text(
            f"checkout_id={ck.get('session_id')}\nurl={url}\nfinal={page.url}\nblocked={blocked}\npaid_ui={paid}\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
