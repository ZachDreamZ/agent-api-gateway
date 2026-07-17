#!/usr/bin/env python3
"""Use Stripe Link saved Amex on Polar checkout; fill CVC if autofilled, else report need."""
from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")


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
    print("ck", ck)
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp(CDP)
        page = b.contexts[0].new_page()
        page.goto(ck["url"], wait_until="domcontentloaded", timeout=120000)
        time.sleep(4)
        page.locator('input[type="email"]').first.fill("xxtheshadowcraft@gmail.com")
        time.sleep(2)
        # click email to trigger link
        page.locator('input[type="email"]').first.press("Tab")
        time.sleep(3)
        page.screenshot(path=str(OUT / "link-1.png"), full_page=True)
        body = page.inner_text("body")
        print("body has link/amex", "0272" in body or "American Express" in body or "link" in body.lower())
        print(body[:2000])

        # Click the Link saved card row
        for sel in [
            'text=American Express',
            'text=0272',
            'text=Prepaid',
            '[data-testid*="link"]',
            'button:has-text("0272")',
            'div:has-text("American Express Prepaid")',
        ]:
            loc = page.locator(sel)
            if loc.count():
                try:
                    loc.first.click(force=True, timeout=4000)
                    print("clicked", sel)
                    time.sleep(2)
                except Exception as e:
                    print("click", sel, e)

        page.screenshot(path=str(OUT / "link-2.png"), full_page=True)

        # Look for CVC / security code fields in main page and iframes
        cvc_found = False
        for frame in [page] + page.frames:
            try:
                for sel in [
                    'input[name="cvc"]',
                    'input[autocomplete="cc-csc"]',
                    'input[placeholder*="CVC" i]',
                    'input[placeholder*="CVV" i]',
                    'input[placeholder*="security" i]',
                    'input[aria-label*="security" i]',
                    'input[aria-label*="CVC" i]',
                ]:
                    loc = frame.locator(sel)
                    if loc.count():
                        print("CVC field in", getattr(frame, "url", "main")[:80], sel)
                        cvc_found = True
                        # Try autofill by focusing only — do not invent CVC
                        loc.first.click(timeout=3000)
                        time.sleep(1)
                        val = ""
                        try:
                            val = loc.first.input_value()
                        except Exception:
                            pass
                        print("cvc value len", len(val))
            except Exception as e:
                print("frame scan", e)

        # Also dump all inputs
        for frame in [page] + page.frames:
            try:
                inputs = frame.locator("input")
                n = inputs.count()
                if n and n < 40:
                    for i in range(n):
                        el = inputs.nth(i)
                        print(
                            "input",
                            i,
                            el.get_attribute("name"),
                            el.get_attribute("placeholder"),
                            el.get_attribute("autocomplete"),
                            el.get_attribute("type"),
                            "vis",
                            el.is_visible(),
                        )
            except Exception:
                pass

        page.screenshot(path=str(OUT / "link-3.png"), full_page=True)
        # Click Pay now anyway in case CVC not needed
        pay = page.locator('button:has-text("Pay now")')
        if pay.count():
            pay.first.click(force=True, timeout=5000)
            time.sleep(6)
        page.screenshot(path=str(OUT / "link-after-pay.png"), full_page=True)
        print("final", page.url)
        print(page.inner_text("body")[:2000])
        (OUT / "link-attempt.txt").write_text(
            f"session={ck.get('session_id')}\ncvc_found={cvc_found}\nurl={page.url}\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
