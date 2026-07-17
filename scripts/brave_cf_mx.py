#!/usr/bin/env python3
"""Finish support@agentapigw.dpdns.org via Brave CDP: ImprovMX alias + Cloudflare MX."""
from __future__ import annotations

import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
DOMAIN = "agentapigw.dpdns.org"
SUPPORT_LOCAL = "support"
FORWARD = "xxtheshadowcraft@gmail.com"
CF_ACCOUNT = "c13ece43fe55a8396292a53ab4d189be"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
OUT.mkdir(parents=True, exist_ok=True)


def shot(page, name: str) -> None:
    p = OUT / name
    page.screenshot(path=str(p))
    print("shot", p)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]

        # --- ImprovMX domain setup ---
        imx = ctx.new_page()
        imx.goto("https://app.improvmx.com/", wait_until="domcontentloaded", timeout=60000)
        time.sleep(2)
        print("IMX", imx.url, imx.inner_text("body")[:800])

        # Click domain row / Setup
        for sel in [
            f"text={DOMAIN}",
            "text=Setup",
            "a:has-text('Setup')",
            "button:has-text('Setup')",
        ]:
            loc = imx.locator(sel)
            if loc.count():
                try:
                    # Prefer domain text first
                    if DOMAIN in sel or sel == f"text={DOMAIN}":
                        loc.first.click(timeout=5000)
                        print("clicked domain")
                        time.sleep(2)
                        break
                except Exception as e:
                    print(e)
        # if still on list, click Setup next to domain
        if "setup" not in imx.url.lower() and DOMAIN not in imx.url:
            loc = imx.locator("text=Setup")
            if loc.count():
                loc.first.click(timeout=5000)
                time.sleep(2)

        print("IMX after", imx.url)
        shot(imx, "imx-domain.png")
        print(imx.inner_text("body")[:3000])

        # Add alias support -> gmail
        # Look for alias inputs
        for sel in [
            "text=Add an alias",
            "text=Add alias",
            "button:has-text('Add alias')",
            "a:has-text('Add alias')",
            "button:has-text('Add')",
        ]:
            loc = imx.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=4000)
                    print("alias click", sel)
                    time.sleep(1)
                except Exception as e:
                    print("alias", e)

        # Fill alias form fields if present
        inputs = imx.locator("input")
        print("inputs", inputs.count())
        for i in range(min(inputs.count(), 15)):
            try:
                ph = (inputs.nth(i).get_attribute("placeholder") or "")
                name = (inputs.nth(i).get_attribute("name") or "")
                typ = (inputs.nth(i).get_attribute("type") or "")
                print(f" input[{i}] type={typ} name={name} ph={ph}")
            except Exception:
                pass

        # Common ImprovMX alias: left box alias, right box forward
        alias_filled = False
        for i in range(min(inputs.count(), 15)):
            try:
                ph = (inputs.nth(i).get_attribute("placeholder") or "").lower()
                name = (inputs.nth(i).get_attribute("name") or "").lower()
                if any(k in ph or k in name for k in ("alias", "local", "user", "prefix")):
                    inputs.nth(i).fill(SUPPORT_LOCAL)
                    alias_filled = True
                    print("filled alias local")
                if any(k in ph or k in name for k in ("forward", "destination", "email", "to")):
                    inputs.nth(i).fill(FORWARD)
                    print("filled forward")
            except Exception as e:
                print(e)

        if not alias_filled and inputs.count() >= 2:
            try:
                inputs.nth(0).fill(SUPPORT_LOCAL)
                inputs.nth(1).fill(FORWARD)
                print("filled first two inputs as alias/forward")
            except Exception as e:
                print(e)

        for sel in ["button:has-text('Add')", "button:has-text('Save')", "button:has-text('Create')", "button[type='submit']"]:
            loc = imx.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=4000)
                    print("submit alias", sel)
                    time.sleep(2)
                    break
                except Exception as e:
                    print(e)

        shot(imx, "imx-alias.png")
        print("IMX FINAL:\n", imx.inner_text("body")[:3000])

        # --- Cloudflare DNS ---
        cf = ctx.new_page()
        # Click domain from overview
        cf.goto(
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/domains/overview",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(3)
        # Click the domain link by text
        link = cf.get_by_text(DOMAIN, exact=True)
        if link.count():
            link.first.click(timeout=8000)
            time.sleep(3)
            print("zone url", cf.url)
        else:
            # try row click
            cf.locator(f"text={DOMAIN}").first.click(timeout=8000)
            time.sleep(3)
            print("zone url2", cf.url)

        shot(cf, "cf-zone.png")
        print("ZONE BODY:\n", cf.inner_text("body")[:1500])

        # Navigate to DNS — use sidebar
        for sel in ["a:has-text('DNS')", "text=Records", "nav >> text=DNS"]:
            loc = cf.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=5000)
                    time.sleep(2)
                    print("dns nav", sel, cf.url)
                    break
                except Exception as e:
                    print(e)

        # If still not on DNS, construct from current URL
        if "/dns" not in cf.url:
            # URL often: /{account}/{zone_id}/...
            parts = cf.url.strip("/").split("/")
            # find 32-char hex zone id
            zid = None
            for part in parts:
                if len(part) == 32 and all(c in "0123456789abcdef" for c in part):
                    zid = part
            if zid:
                url = f"https://dash.cloudflare.com/{CF_ACCOUNT}/{zid}/dns/records"
                cf.goto(url, wait_until="domcontentloaded", timeout=60000)
                time.sleep(3)
                print("dns direct", cf.url)
            else:
                # try account/domain path
                cf.goto(
                    f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/dns/records",
                    wait_until="domcontentloaded",
                    timeout=60000,
                )
                time.sleep(3)
                print("dns domain path", cf.url)

        shot(cf, "cf-dns.png")
        body = cf.inner_text("body")
        print("DNS BODY:\n", body[:3500])

        # Check if MX already present
        if "mx1.improvmx.com" in body.lower() and "mx2.improvmx.com" in body.lower():
            print("MX records already present")
        else:
            add_one_mx(cf, "mx1.improvmx.com", "10")
            time.sleep(1)
            add_one_mx(cf, "mx2.improvmx.com", "20")
            time.sleep(1)
            # SPF TXT
            add_txt(cf, "v=spf1 include:spf.improvmx.com ~all")

        shot(cf, "cf-dns-after.png")
        print("DNS AFTER:\n", cf.inner_text("body")[:3500])

        # Email Routing (optional alternative to ImprovMX)
        try_email_routing(cf)

        print("DONE")


def add_one_mx(cf, target: str, priority: str) -> None:
    print(f"Adding MX {priority} {target}")
    btn = cf.locator("button:has-text('Add record')")
    if not btn.count():
        print("no Add record")
        return
    btn.first.click(timeout=8000)
    time.sleep(1.5)
    shot(cf, f"cf-add-form-{priority}.png")

    # Open type dropdown and choose MX
    # Cloudflare UI: often a button showing "A" or Type
    for sel in [
        "button:has-text('Type')",
        "[data-testid='dns-record-form-type']",
        "div[role='dialog'] button",
    ]:
        loc = cf.locator(sel)
        # skip
    # Click the Type control - usually first combobox in dialog
    dialog = cf.locator("[role='dialog'], form")
    # Try select option MX via keyboard on type field
    type_controls = cf.locator("[role='dialog'] button, [role='dialog'] [role='combobox']")
    print("dialog controls", type_controls.count())
    if type_controls.count():
        try:
            type_controls.first.click(timeout=3000)
            time.sleep(0.5)
            opt = cf.locator("[role='option']:has-text('MX'), li:has-text('MX'), text='MX'")
            if opt.count():
                opt.first.click(timeout=3000)
                print("selected MX type")
            else:
                # type MX with keyboard
                cf.keyboard.type("MX")
                cf.keyboard.press("Enter")
                print("typed MX")
        except Exception as e:
            print("type select err", e)

    # Name field — leave @ or fill
    for sel in [
        "input[name='name']",
        "input[placeholder='@']",
        "input[value='@']",
        "[data-testid='dns-record-form-name'] input",
    ]:
        loc = cf.locator(sel)
        if loc.count():
            try:
                loc.first.fill("@")
                print("name @")
                break
            except Exception as e:
                print(e)

    # Mail server / content / target
    for sel in [
        "input[name='content']",
        "input[name='target']",
        "input[placeholder*='mail' i]",
        "input[placeholder*='mx' i]",
        "input[placeholder*='server' i]",
        "[data-testid='dns-record-form-content'] input",
        "[data-testid='dns-record-form-value'] input",
    ]:
        loc = cf.locator(sel)
        if loc.count():
            try:
                loc.first.fill(target)
                print("content", target, sel)
                break
            except Exception as e:
                print(e)

    # Priority
    for sel in [
        "input[name='priority']",
        "input[placeholder*='priority' i]",
        "[data-testid*='priority'] input",
    ]:
        loc = cf.locator(sel)
        if loc.count():
            try:
                loc.first.fill(priority)
                print("priority", priority)
                break
            except Exception as e:
                print(e)

    # Proxy must be DNS only for MX (usually automatic)

    save = cf.locator("button:has-text('Save')")
    if save.count():
        try:
            save.first.click(timeout=5000)
            print("saved MX", target)
            time.sleep(2)
        except Exception as e:
            print("save err", e)
    shot(cf, f"cf-mx-saved-{priority}.png")


def add_txt(cf, content: str) -> None:
    print("Adding TXT SPF", content)
    btn = cf.locator("button:has-text('Add record')")
    if not btn.count():
        return
    btn.first.click(timeout=5000)
    time.sleep(1)
    type_controls = cf.locator("[role='dialog'] button, [role='dialog'] [role='combobox']")
    if type_controls.count():
        try:
            type_controls.first.click()
            time.sleep(0.3)
            opt = cf.locator("[role='option']:has-text('TXT')")
            if opt.count():
                opt.first.click()
            else:
                cf.keyboard.type("TXT")
                cf.keyboard.press("Enter")
        except Exception as e:
            print(e)
    for sel in ["input[name='name']", "input[placeholder='@']"]:
        if cf.locator(sel).count():
            cf.locator(sel).first.fill("@")
            break
    for sel in ["input[name='content']", "textarea", "input[placeholder*='content' i]"]:
        if cf.locator(sel).count():
            try:
                cf.locator(sel).first.fill(content)
                break
            except Exception:
                pass
    if cf.locator("button:has-text('Save')").count():
        cf.locator("button:has-text('Save')").first.click()
        time.sleep(2)
        print("saved TXT")
    shot(cf, "cf-txt-spf.png")


def try_email_routing(cf) -> None:
    # From DNS page, try Email sidebar
    for sel in ["a:has-text('Email')", "text=Email Routing"]:
        loc = cf.locator(sel)
        if loc.count():
            try:
                loc.first.click(timeout=4000)
                time.sleep(2)
                print("email nav", cf.url)
                shot(cf, "cf-email-nav.png")
                print(cf.inner_text("body")[:2000])
            except Exception as e:
                print(e)


if __name__ == "__main__":
    main()
