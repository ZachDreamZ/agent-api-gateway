#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

DOMAIN = "agentapigw.dpdns.org"

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
    ctx = b.contexts[0]
    imx = ctx.new_page()
    imx.goto(
        f"https://app.improvmx.com/domains/{DOMAIN}/dns",
        wait_until="domcontentloaded",
        timeout=60000,
    )
    time.sleep(2)
    for i in range(4):
        if imx.locator("text=Check again").count():
            imx.locator("text=Check again").first.click()
            print("check", i)
            time.sleep(7)
        body = imx.inner_text("body")
        if "No MX records found" not in body:
            print("DNS LOOKS GOOD")
            print(body[body.find("MX records") : body.find("MX records") + 900])
            break
        print("still waiting...", i)
    else:
        print(imx.inner_text("body")[imx.inner_text("body").find("MX records") :][:900])

    imx.goto(
        f"https://app.improvmx.com/domains/{DOMAIN}/aliases",
        wait_until="domcontentloaded",
        timeout=60000,
    )
    time.sleep(2)
    body = imx.inner_text("body")
    print("ALIASES:\n", body[:2000])
    if "support@" not in body.lower() and "support" not in body:
        alias_in = imx.locator("input[placeholder='new-alias']")
        dest_in = imx.locator("input[placeholder*='Email address']")
        if alias_in.count() and dest_in.count():
            alias_in.first.fill("support")
            dest_in.first.fill("xxtheshadowcraft@gmail.com")
            imx.locator("input[type='submit'][name='add']").first.click()
            time.sleep(2)
            print("AFTER ADD:\n", imx.inner_text("body")[:1500])
    imx.screenshot(
        path=r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer\imx-done.png"
    )
