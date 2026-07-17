#!/usr/bin/env python3
"""Add ImprovMX MX via Cloudflare dashboard DNS (Brave CDP) + set alias."""
from __future__ import annotations

import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
DOMAIN = "agentapigw.dpdns.org"
CF_ACCOUNT = "c13ece43fe55a8396292a53ab4d189be"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
OUT.mkdir(parents=True, exist_ok=True)


def shot(page, name: str) -> None:
    page.screenshot(path=str(OUT / name))
    print("shot", name)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]

        # ImprovMX aliases page
        imx = ctx.new_page()
        imx.goto(
            f"https://app.improvmx.com/domains/{DOMAIN}/aliases",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        time.sleep(2)
        print("ALIASES", imx.url)
        print(imx.inner_text("body")[:2500])
        shot(imx, "imx-aliases.png")

        # Try create support alias
        for sel in ["button:has-text('Add')", "text=Add an alias", "text=New alias", "a:has-text('Add')"]:
            if imx.locator(sel).count():
                try:
                    imx.locator(sel).first.click(timeout=4000)
                    time.sleep(1)
                    print("clicked", sel)
                except Exception as e:
                    print(e)

        inputs = imx.locator("input:visible")
        print("visible inputs", inputs.count())
        for i in range(min(inputs.count(), 10)):
            el = inputs.nth(i)
            print(
                i,
                el.get_attribute("name"),
                el.get_attribute("placeholder"),
                el.get_attribute("type"),
            )

        if inputs.count() >= 2:
            inputs.nth(0).fill("support")
            inputs.nth(1).fill("xxtheshadowcraft@gmail.com")
            if imx.locator("button:has-text('Add'), button:has-text('Save'), button[type='submit']").count():
                imx.locator("button:has-text('Add'), button:has-text('Save'), button[type='submit']").first.click()
                time.sleep(2)
        shot(imx, "imx-aliases-after.png")
        print("ALIASES AFTER\n", imx.inner_text("body")[:2000])

        # Cloudflare: go straight to DNS via search / recents
        cf = ctx.new_page()
        # Use quick search Ctrl+K
        cf.goto(
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/home/domains",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(3)
        print("CF home", cf.url)
        # Keyboard search
        cf.keyboard.press("Control+k")
        time.sleep(1)
        cf.keyboard.type(DOMAIN)
        time.sleep(1)
        cf.keyboard.press("Enter")
        time.sleep(3)
        print("after search", cf.url)
        shot(cf, "cf-after-search.png")

        # Force click domain if still on list
        if DOMAIN not in cf.url and "dns" not in cf.url:
            try:
                cf.locator(f"span:text-is('{DOMAIN}')").first.click(force=True, timeout=5000)
                time.sleep(2)
            except Exception as e:
                print("force click", e)
            try:
                cf.get_by_role("link", name=DOMAIN).first.click(force=True, timeout=5000)
                time.sleep(2)
            except Exception as e:
                print("link click", e)

        print("zone?", cf.url)
        shot(cf, "cf-zone2.png")

        # Click DNS in sidebar with force
        for label in ["DNS", "Records"]:
            try:
                cf.get_by_role("link", name=label).first.click(force=True, timeout=4000)
                time.sleep(2)
                print("nav", label, cf.url)
                break
            except Exception as e:
                print(label, e)

        # Parse zone id from URL
        parts = [x for x in cf.url.split("/") if len(x) == 32 and all(c in "0123456789abcdef" for c in x)]
        print("hex parts", parts)
        zid = parts[-1] if parts else None
        if zid:
            dns_url = f"https://dash.cloudflare.com/{CF_ACCOUNT}/{zid}/dns/records"
            cf.goto(dns_url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            print("DNS URL", cf.url)
        else:
            # try known path pattern from recents "Records"
            cf.goto(
                f"https://dash.cloudflare.com/{CF_ACCOUNT}/domains/overview",
                wait_until="domcontentloaded",
                timeout=60000,
            )
            time.sleep(2)
            # click Records under recents
            try:
                cf.get_by_text("Records", exact=True).first.click(force=True, timeout=5000)
                time.sleep(3)
                print("records click", cf.url)
            except Exception as e:
                print(e)

        shot(cf, "cf-dns2.png")
        body = cf.inner_text("body")
        print("DNS PAGE\n", body[:4000])

        if "mx1.improvmx.com" not in body.lower():
            add_mx(cf, "mx1.improvmx.com", "10")
            time.sleep(1.5)
            add_mx(cf, "mx2.improvmx.com", "20")
            time.sleep(1.5)
            add_txt(cf, "v=spf1 include:spf.improvmx.com ~all")
        else:
            print("MX already there")

        shot(cf, "cf-dns-final.png")
        print("FINAL DNS\n", cf.inner_text("body")[:4000])

        # Check again on ImprovMX
        imx2 = ctx.new_page()
        imx2.goto(
            f"https://app.improvmx.com/domains/{DOMAIN}/dns",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        time.sleep(2)
        if imx2.locator("text=Check again").count():
            imx2.locator("text=Check again").first.click()
            time.sleep(4)
        shot(imx2, "imx-dns-check.png")
        print("IMX DNS CHECK\n", imx2.inner_text("body")[:2500])
        print("DONE")


def add_mx(cf, server: str, prio: str) -> None:
    print("ADD MX", prio, server)
    add = cf.get_by_role("button", name="Add record")
    if not add.count():
        add = cf.locator("button:has-text('Add record')")
    if not add.count():
        print("no add button")
        return
    add.first.click(force=True, timeout=8000)
    time.sleep(1.5)
    shot(cf, f"form-mx-{prio}.png")

    # Type dropdown - first combobox in dialog
    dlg = cf.locator("[role='dialog']")
    print("dialog", dlg.count(), "text", dlg.inner_text()[:500] if dlg.count() else "")

    # Click type, choose MX
    try:
        # Many CF UIs: button showing current type "A"
        type_btn = cf.locator("[role='dialog'] button").filter(has_text="A")
        if type_btn.count():
            type_btn.first.click()
        else:
            cf.locator("[role='dialog'] [role='combobox']").first.click()
        time.sleep(0.4)
        mx = cf.get_by_role("option", name="MX")
        if mx.count():
            mx.first.click()
        else:
            cf.locator("text=MX").first.click()
        print("type MX ok")
    except Exception as e:
        print("type err", e)
        try:
            cf.keyboard.type("MX")
            cf.keyboard.press("Enter")
        except Exception:
            pass

    # Fill fields by label
    try:
        name = cf.get_by_label("Name", exact=False)
        if name.count():
            name.first.fill("@")
    except Exception:
        pass
    try:
        # Mail server field
        for label in ["Mail server", "Content", "Target", "Value"]:
            loc = cf.get_by_label(label, exact=False)
            if loc.count():
                loc.first.fill(server)
                print("filled", label)
                break
    except Exception as e:
        print(e)
    try:
        p = cf.get_by_label("Priority", exact=False)
        if p.count():
            p.first.fill(prio)
            print("prio ok")
    except Exception as e:
        print(e)

    # generic inputs fallback
    vis = cf.locator("[role='dialog'] input:visible")
    print("dialog inputs", vis.count())
    for i in range(min(vis.count(), 8)):
        try:
            val = vis.nth(i).input_value()
            name = vis.nth(i).get_attribute("name")
            ph = vis.nth(i).get_attribute("placeholder")
            print(f"  in[{i}] name={name} ph={ph} val={val}")
        except Exception:
            pass

    # If content empty, fill likely fields
    for i in range(min(vis.count(), 8)):
        try:
            ph = (vis.nth(i).get_attribute("placeholder") or "").lower()
            name = (vis.nth(i).get_attribute("name") or "").lower()
            val = vis.nth(i).input_value()
            if not val and ("mail" in ph or "content" in name or "target" in name or "server" in ph):
                vis.nth(i).fill(server)
            if (not val or val == "0") and "prio" in (ph + name):
                vis.nth(i).fill(prio)
            if (not val or val == "") and name == "name":
                vis.nth(i).fill("@")
        except Exception:
            pass

    save = cf.get_by_role("button", name="Save")
    if save.count():
        save.first.click(force=True)
        time.sleep(2)
        print("saved")
    shot(cf, f"saved-mx-{prio}.png")


def add_txt(cf, content: str) -> None:
    print("ADD TXT", content)
    add = cf.locator("button:has-text('Add record')")
    if not add.count():
        return
    add.first.click(force=True)
    time.sleep(1)
    try:
        type_btn = cf.locator("[role='dialog'] button").filter(has_text="A")
        if type_btn.count():
            type_btn.first.click()
        else:
            cf.locator("[role='dialog'] [role='combobox']").first.click()
        time.sleep(0.3)
        opt = cf.get_by_role("option", name="TXT")
        if opt.count():
            opt.first.click()
        else:
            cf.locator("text=TXT").first.click()
    except Exception as e:
        print(e)
    try:
        cf.get_by_label("Name", exact=False).first.fill("@")
    except Exception:
        pass
    try:
        cf.get_by_label("Content", exact=False).first.fill(content)
    except Exception:
        vis = cf.locator("[role='dialog'] input:visible, [role='dialog'] textarea:visible")
        if vis.count() >= 2:
            vis.nth(-1).fill(content)
    if cf.get_by_role("button", name="Save").count():
        cf.get_by_role("button", name="Save").first.click(force=True)
        time.sleep(2)
    shot(cf, "saved-txt.png")


if __name__ == "__main__":
    main()
