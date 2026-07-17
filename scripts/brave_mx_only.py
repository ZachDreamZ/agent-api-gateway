#!/usr/bin/env python3
"""Reliably add ImprovMX MX+SPF on Cloudflare DNS via Brave CDP."""
from __future__ import annotations

import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
DOMAIN = "agentapigw.dpdns.org"
CF_ACCOUNT = "c13ece43fe55a8396292a53ab4d189be"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")


def shot(page, name: str) -> None:
    page.screenshot(path=str(OUT / name))
    print("shot", name)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]
        cf = ctx.new_page()
        cf.goto(
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/dns/records",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(4)
        print("url", cf.url)
        body = cf.inner_text("body")
        print(body[:2000])
        shot(cf, "dns-start.png")

        # Close any open dialog
        if cf.locator("[role='dialog']").count():
            try:
                cf.keyboard.press("Escape")
                time.sleep(0.5)
            except Exception:
                pass

        # Delete bad A records we may have created (empty content)
        # skip for safety unless clearly improvmx

        for server, prio in [("mx1.improvmx.com", "10"), ("mx2.improvmx.com", "20")]:
            if server in body.lower():
                print("already has", server)
                continue
            add_mx(cf, server, prio)
            time.sleep(2)
            body = cf.inner_text("body")

        if "spf.improvmx.com" not in body.lower():
            add_txt(cf, "v=spf1 include:spf.improvmx.com ~all")

        shot(cf, "dns-done.png")
        print("DONE BODY\n", cf.inner_text("body")[:4000])

        # Verify aliases
        imx = ctx.new_page()
        imx.goto(f"https://app.improvmx.com/domains/{DOMAIN}/aliases", wait_until="domcontentloaded")
        time.sleep(2)
        # ensure support alias
        text = imx.inner_text("body")
        print("ALIASES\n", text[:2000])
        if "support@" not in text and "support" not in text.lower():
            alias_in = imx.locator("input[placeholder='new-alias']")
            dest_in = imx.locator("input[placeholder*='Email']")
            if alias_in.count() and dest_in.count():
                alias_in.first.fill("support")
                dest_in.first.fill("xxtheshadowcraft@gmail.com")
                imx.locator("input[type='submit']").first.click()
                time.sleep(2)
                print("alias re-added")
        shot(imx, "aliases-final.png")
        print(imx.inner_text("body")[:1500])

        # Check DNS status on ImprovMX
        imx.goto(f"https://app.improvmx.com/domains/{DOMAIN}/dns")
        time.sleep(2)
        if imx.locator("button:has-text('Check again'), text=Check again").count():
            imx.locator("button:has-text('Check again'), text=Check again").first.click()
            time.sleep(6)
        shot(imx, "imx-final-check.png")
        print("IMX DNS\n", imx.inner_text("body")[:2500])


def add_mx(cf, server: str, prio: str) -> None:
    print("=== MX", prio, server)
    cf.locator("button:has-text('Add record')").first.click(force=True, timeout=15000)
    time.sleep(1.5)
    shot(cf, f"dlg-{prio}.png")

    dialog = cf.locator("[role='dialog']")
    assert dialog.count(), "no dialog"

    # Type field is first input with value A
    type_input = dialog.locator("input").first
    print("type val before", type_input.input_value())
    type_input.click()
    time.sleep(0.3)
    # clear and type MX
    type_input.fill("")
    type_input.type("MX", delay=50)
    time.sleep(0.5)
    # select from listbox
    opt = cf.locator("[role='option']:has-text('MX'), [data-value='MX'], li:has-text('MX')")
    if opt.count():
        opt.first.click()
        print("picked MX option")
    else:
        cf.keyboard.press("Enter")
        print("enter after MX")
    time.sleep(0.8)
    shot(cf, f"dlg-typed-{prio}.png")

    # Dump inputs after type change
    vis = dialog.locator("input:visible")
    print("inputs after type", vis.count())
    for i in range(min(vis.count(), 12)):
        try:
            print(
                i,
                "name=",
                vis.nth(i).get_attribute("name"),
                "ph=",
                vis.nth(i).get_attribute("placeholder"),
                "aria=",
                vis.nth(i).get_attribute("aria-label"),
                "val=",
                vis.nth(i).input_value(),
            )
        except Exception as e:
            print(i, e)

    # Fill by walking inputs
    for i in range(min(vis.count(), 12)):
        try:
            ph = (vis.nth(i).get_attribute("placeholder") or "").lower()
            name = (vis.nth(i).get_attribute("name") or "").lower()
            aria = (vis.nth(i).get_attribute("aria-label") or "").lower()
            blob = f"{ph} {name} {aria}"
            if "prio" in blob:
                vis.nth(i).fill(prio)
                print("set prio", i)
            elif any(k in blob for k in ("mail", "server", "content", "target", "value")) and "ttl" not in blob:
                vis.nth(i).fill(server)
                print("set server", i)
            elif "name" in blob or "use @ for root" in ph:
                vis.nth(i).fill("@")
                print("set name", i)
        except Exception as e:
            print("fill", i, e)

    # If type still A, force via JS
    try:
        vals = [vis.nth(i).input_value() for i in range(min(vis.count(), 5))]
        print("values", vals)
        if vals and vals[0] == "A":
            print("WARNING still A — clicking type dropdown items")
            type_input.click()
            time.sleep(0.2)
            cf.locator("text='MX'").first.click(timeout=3000)
            time.sleep(0.5)
            # re-fill server
            vis = dialog.locator("input:visible")
            for i in range(min(vis.count(), 12)):
                ph = (vis.nth(i).get_attribute("placeholder") or "").lower()
                if "mail" in ph or "server" in ph or "ipv4" not in ph:
                    if "name" not in ph and "ttl" not in ph and "prio" not in (
                        vis.nth(i).get_attribute("name") or ""
                    ):
                        try:
                            if "use @ for root" not in ph:
                                vis.nth(i).fill(server)
                        except Exception:
                            pass
    except Exception as e:
        print(e)

    dialog.locator("button:has-text('Save')").first.click(force=True, timeout=10000)
    time.sleep(2.5)
    # dismiss errors
    shot(cf, f"saved-{prio}.png")
    print("after save snippet", cf.inner_text("body")[:500])


def add_txt(cf, content: str) -> None:
    print("=== TXT", content)
    cf.locator("button:has-text('Add record')").first.click(force=True, timeout=15000)
    time.sleep(1.2)
    dialog = cf.locator("[role='dialog']")
    type_input = dialog.locator("input").first
    type_input.click()
    type_input.fill("TXT")
    time.sleep(0.4)
    opt = cf.locator("[role='option']:has-text('TXT')")
    if opt.count():
        opt.first.click()
    else:
        cf.keyboard.press("Enter")
    time.sleep(0.5)
    vis = dialog.locator("input:visible, textarea:visible")
    for i in range(min(vis.count(), 12)):
        try:
            ph = (vis.nth(i).get_attribute("placeholder") or "").lower()
            name = (vis.nth(i).get_attribute("name") or "").lower()
            if "name" in name or "use @ for root" in ph:
                vis.nth(i).fill("@")
            elif "content" in name or "content" in ph or vis.nth(i).evaluate("e => e.tagName") == "TEXTAREA":
                vis.nth(i).fill(content)
        except Exception as e:
            print(e)
    # last textarea
    ta = dialog.locator("textarea:visible")
    if ta.count():
        ta.first.fill(content)
    dialog.locator("button:has-text('Save')").first.click(force=True)
    time.sleep(2)
    shot(cf, "saved-txt2.png")


if __name__ == "__main__":
    main()
