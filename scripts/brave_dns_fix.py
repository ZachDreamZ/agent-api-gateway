#!/usr/bin/env python3
"""Fix ImprovMX support alias + Cloudflare DNS MX using correct CF URL paths."""
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

        # --- ImprovMX alias: fill correct inputs (1=alias, 2=forward) ---
        imx = ctx.new_page()
        imx.goto(
            f"https://app.improvmx.com/domains/{DOMAIN}/aliases",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        time.sleep(2)
        # placeholder new-alias
        alias_in = imx.locator("input[placeholder='new-alias']")
        dest_in = imx.locator(
            "input[placeholder*='Email address'], input[placeholder*='Email, HTTP']"
        )
        print("alias inputs", alias_in.count(), "dest", dest_in.count())
        if alias_in.count() and dest_in.count():
            alias_in.first.fill("support")
            dest_in.first.fill("xxtheshadowcraft@gmail.com")
            # submit button name=add
            sub = imx.locator("input[type='submit'][name='add'], button:has-text('Add'), input[value='Add']")
            if sub.count():
                sub.first.click()
            else:
                imx.locator("input[type='submit']").first.click()
            time.sleep(2)
            print("submitted support alias")
        shot(imx, "alias-support.png")
        print(imx.inner_text("body")[:2000])

        # --- Cloudflare DNS records page (domain slug path, not zone-id=account) ---
        cf = ctx.new_page()
        urls = [
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/dns/records",
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/dns",
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}",
        ]
        for url in urls:
            cf.goto(url, wait_until="domcontentloaded", timeout=90000)
            time.sleep(3)
            body = cf.inner_text("body")
            print("TRY", url, "->", cf.url)
            print(body[:800])
            shot(cf, "cf-try.png")
            if "404" in body or "can't find" in body.lower():
                continue
            if "Add record" in body or "DNS management" in body or "Records" in body:
                break

        # If on overview, click DNS Records
        if "Add record" not in cf.inner_text("body"):
            for name in ["DNS", "Records"]:
                try:
                    cf.get_by_role("link", name=name).first.click(force=True, timeout=5000)
                    time.sleep(2)
                    print("clicked", name, cf.url)
                except Exception as e:
                    print(e)

        # Also try URL with /dns/records after zone loads
        if "/dns" not in cf.url:
            cf.goto(
                f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/dns/records",
                wait_until="domcontentloaded",
                timeout=60000,
            )
            time.sleep(3)

        body = cf.inner_text("body")
        print("DNS PAGE", cf.url)
        print(body[:3500])
        shot(cf, "cf-dns-good.png")

        if "Add record" in body:
            if "mx1.improvmx.com" not in body.lower():
                add_mx(cf, "mx1.improvmx.com", "10")
                time.sleep(2)
                add_mx(cf, "mx2.improvmx.com", "20")
                time.sleep(2)
                add_txt(cf, "v=spf1 include:spf.improvmx.com ~all")
            else:
                print("MX already configured")
        else:
            # Create API token path for fallback
            print("DNS UI not ready — trying API token create page")
            create_api_token_and_set_dns(cf, ctx)

        shot(cf, "cf-final.png")
        print("FINAL\n", cf.inner_text("body")[:3000])

        # Re-check ImprovMX
        imx2 = ctx.new_page()
        imx2.goto(f"https://app.improvmx.com/domains/{DOMAIN}/dns", wait_until="domcontentloaded")
        time.sleep(2)
        if imx2.locator("text=Check again").count():
            imx2.locator("text=Check again").click()
            time.sleep(5)
        shot(imx2, "imx-check2.png")
        print("IMX CHECK\n", imx2.inner_text("body")[:2000])


def add_mx(cf, server: str, prio: str) -> None:
    print("add_mx", prio, server)
    cf.get_by_role("button", name="Add record").first.click(force=True, timeout=10000)
    time.sleep(1.5)
    shot(cf, f"addmx-{prio}.png")
    # Type MX
    try:
        # open type selector
        dialog = cf.locator("[role='dialog']")
        combos = dialog.locator("[role='combobox'], button")
        print("combos", combos.count())
        # click first button that looks like type (often shows A)
        for i in range(min(combos.count(), 6)):
            t = combos.nth(i).inner_text()
            print("combo", i, t[:40])
            if t.strip() in ("A", "Type", "AAAA", "CNAME", "TXT", "MX") or i == 0:
                combos.nth(i).click()
                time.sleep(0.3)
                break
        opt = cf.locator("[role='option']").filter(has_text="MX")
        if opt.count():
            opt.first.click()
        else:
            cf.keyboard.type("MX")
            time.sleep(0.2)
            cf.keyboard.press("Enter")
    except Exception as e:
        print("type", e)

    # Labels
    for label, value in [("Name", "@"), ("Mail server", server), ("Priority", prio), ("Content", server)]:
        try:
            loc = cf.get_by_label(label, exact=False)
            if loc.count():
                loc.first.fill(value)
                print("label", label, value)
        except Exception as e:
            print(label, e)

    # Fallback: all visible inputs in dialog
    vis = cf.locator("[role='dialog'] input:visible")
    for i in range(min(vis.count(), 10)):
        try:
            ph = (vis.nth(i).get_attribute("placeholder") or "").lower()
            name = (vis.nth(i).get_attribute("name") or "").lower()
            aria = (vis.nth(i).get_attribute("aria-label") or "").lower()
            blob = ph + name + aria
            val = vis.nth(i).input_value()
            print(f"in[{i}] blob={blob!r} val={val!r}")
            if "prio" in blob and (not val or val in ("0", "10")):
                vis.nth(i).fill(prio)
            elif any(k in blob for k in ("mail", "content", "target", "server", "value")) and (
                not val or "." not in val
            ):
                vis.nth(i).fill(server)
            elif "name" in blob and (not val or val in ("", "@")):
                vis.nth(i).fill("@")
        except Exception as e:
            print(e)

    try:
        cf.get_by_role("button", name="Save").first.click(force=True, timeout=5000)
        time.sleep(2)
        print("saved mx")
    except Exception as e:
        print("save", e)
    shot(cf, f"after-mx-{prio}.png")


def add_txt(cf, content: str) -> None:
    print("add_txt", content)
    cf.get_by_role("button", name="Add record").first.click(force=True, timeout=8000)
    time.sleep(1)
    try:
        combos = cf.locator("[role='dialog'] [role='combobox'], [role='dialog'] button")
        combos.first.click()
        time.sleep(0.3)
        opt = cf.locator("[role='option']").filter(has_text="TXT")
        if opt.count():
            opt.first.click()
        else:
            cf.keyboard.type("TXT")
            cf.keyboard.press("Enter")
    except Exception as e:
        print(e)
    try:
        cf.get_by_label("Name", exact=False).first.fill("@")
    except Exception:
        pass
    try:
        cf.get_by_label("Content", exact=False).first.fill(content)
    except Exception:
        ta = cf.locator("[role='dialog'] textarea:visible, [role='dialog'] input:visible")
        if ta.count():
            ta.last.fill(content)
    try:
        cf.get_by_role("button", name="Save").first.click(force=True)
        time.sleep(2)
        print("saved txt")
    except Exception as e:
        print(e)
    shot(cf, "after-txt.png")


def create_api_token_and_set_dns(cf, ctx) -> None:
    print("API token path skipped for now")


if __name__ == "__main__":
    main()
