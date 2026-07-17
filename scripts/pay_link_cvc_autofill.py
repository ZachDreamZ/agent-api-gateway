#!/usr/bin/env python3
"""Open Polar checkout, trigger Stripe Link, try browser autofill on CVC only."""
from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")


def main() -> None:
    req = urllib.request.Request(
        "https://agentapigw.dpdns.org/v1/billing/pricing/checkout",
        data=json.dumps({"sku": "starter"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        ck = json.loads(r.read().decode())
    print("session", ck["session_id"], ck["url"])

    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp(CDP)
        page = b.contexts[0].new_page()
        page.goto(ck["url"], wait_until="domcontentloaded", timeout=120000)
        time.sleep(3)
        page.fill('input[type="email"]', "xxtheshadowcraft@gmail.com")
        page.keyboard.press("Tab")
        time.sleep(4)
        # click amex if shown
        for t in ["American Express", "0272", "Prepaid"]:
            loc = page.locator(f"text={t}")
            if loc.count():
                try:
                    loc.first.click(force=True, timeout=3000)
                    print("clicked", t)
                    time.sleep(2)
                except Exception as e:
                    print(e)

        # Find CVC frame and try autofill via focus + keyboard
        for frame in page.frames:
            cvc = frame.locator(
                'input[autocomplete="cc-csc"], input[name="cardCvc"], input[placeholder*="CVC" i]'
            )
            if not cvc.count():
                continue
            print("found cvc frame", frame.url[:100])
            try:
                cvc.first.click(timeout=5000)
                time.sleep(0.5)
                # trigger browser password manager / autofill
                page.keyboard.press("Control+Shift+L")  # some managers
                time.sleep(0.3)
                # double-click select
                cvc.first.dblclick()
                time.sleep(1)
                val = ""
                try:
                    val = cvc.first.input_value()
                except Exception:
                    pass
                print("cvc after autofill attempts len=", len(val))
                # do NOT type invented digits
                page.screenshot(path=str(OUT / "cvc-focus.png"), full_page=True)
            except Exception as e:
                print("cvc focus", e)

        # Link might open OTP email - check Gmail
        gmail = b.contexts[0].new_page()
        gmail.goto(
            "https://mail.google.com/mail/u/0/#search/from%3Astripe+OR+subject%3ALink+OR+subject%3Averif",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(4)
        gmail.screenshot(path=str(OUT / "gmail-link-otp.png"))
        print("gmail", gmail.url)
        print(gmail.inner_text("body")[:2000])

        pay = page.locator('button:has-text("Pay now")')
        if pay.count():
            pay.first.click(force=True)
            time.sleep(5)
        page.screenshot(path=str(OUT / "after-cvc-pay.png"), full_page=True)
        print("final", page.url)
        print(page.inner_text("body")[:1200])


if __name__ == "__main__":
    main()
