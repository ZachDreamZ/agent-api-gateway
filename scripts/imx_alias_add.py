from playwright.sync_api import sync_playwright
import time

DOMAIN = "agentapigw.dpdns.org"

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
    ctx = b.contexts[0]
    imx = ctx.new_page()
    imx.goto(
        f"https://app.improvmx.com/domains/{DOMAIN}/aliases",
        wait_until="domcontentloaded",
        timeout=60000,
    )
    time.sleep(2)
    imx.locator("input[placeholder='new-alias']").first.fill("support")
    imx.locator("input[placeholder*='Email address']").first.fill(
        "xxtheshadowcraft@gmail.com"
    )
    imx.locator("input[type='submit'][name='add']").first.click()
    time.sleep(3)
    print("AFTER SUPPORT:\n", imx.inner_text("body")[:2500])
    imx.locator("input[placeholder='new-alias']").first.fill("*")
    imx.locator("input[placeholder*='Email address']").first.fill(
        "xxtheshadowcraft@gmail.com"
    )
    imx.locator("input[type='submit'][name='add']").first.click()
    time.sleep(2)
    print("AFTER *:\n", imx.inner_text("body")[:2500])
    imx.screenshot(
        path=r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer\aliases-final2.png"
    )
