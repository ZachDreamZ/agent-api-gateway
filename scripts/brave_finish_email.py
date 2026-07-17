#!/usr/bin/env python3
"""Use logged-in Brave CDP session to finish support email setup."""
from __future__ import annotations

import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
DOMAIN = "agentapigw.dpdns.org"
SUPPORT = "support@agentapigw.dpdns.org"
FORWARD = "xxtheshadowcraft@gmail.com"
CF_ACCOUNT = "c13ece43fe55a8396292a53ab4d189be"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
OUT.mkdir(parents=True, exist_ok=True)


def shot(page, name: str) -> None:
    path = OUT / name
    page.screenshot(path=str(path), full_page=False)
    print(f"screenshot {path}")


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]

        # 1) Gmail ImprovMX confirmation
        gmail = None
        for page in ctx.pages:
            if "mail.google.com" in page.url:
                gmail = page
                break
        if gmail is None:
            gmail = ctx.new_page()
        gmail.goto(
            "https://mail.google.com/mail/u/0/#search/from%3Aimprovmx+OR+subject%3AImprovMX",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(4)
        print("GMAIL", gmail.url)
        shot(gmail, "gmail-improvmx.png")
        print("GMAIL TEXT:\n", gmail.inner_text("body")[:2000])

        # Open first message if list view
        for sel in [
            "tr.zA",
            "div[role='main'] tr",
            "span:has-text('ImprovMX')",
            "span:has-text('Confirm')",
        ]:
            loc = gmail.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=5000)
                    time.sleep(2)
                    print("opened message via", sel)
                    break
                except Exception as e:
                    print("msg click", e)

        # Click activation link
        clicked = False
        for sel in [
            "a[href*='improvmx.com']",
            "a:has-text('Confirm')",
            "a:has-text('Activate')",
            "a:has-text('Verify')",
            "a:has-text('confirm your email')",
        ]:
            loc = gmail.locator(sel)
            n = loc.count()
            print(f"candidates {sel}: {n}")
            for i in range(min(n, 15)):
                try:
                    href = loc.nth(i).get_attribute("href") or ""
                    txt = (loc.nth(i).inner_text() or "")[:60]
                    print(f"  [{i}] {txt!r} {href[:140]}")
                    if href and any(
                        k in href.lower()
                        for k in ("confirm", "activate", "verify", "token", "validate", "signup")
                    ):
                        with ctx.expect_page(timeout=10000) as newp:
                            loc.nth(i).click(timeout=5000)
                        page = newp.value
                        page.wait_for_load_state("domcontentloaded")
                        print("CONFIRM PAGE", page.url)
                        shot(page, "improvmx-confirmed.png")
                        clicked = True
                        break
                except Exception as e:
                    print("  fail", e)
            if clicked:
                break

        if not clicked:
            # fallback: click any improvmx link that isn't homepage marketing
            loc = gmail.locator("a[href*='improvmx']")
            for i in range(min(loc.count(), 20)):
                href = loc.nth(i).get_attribute("href") or ""
                if "app.improvmx.com" in href or "confirm" in href:
                    try:
                        loc.nth(i).click(timeout=5000)
                        time.sleep(3)
                        print("clicked fallback", href[:120])
                        clicked = True
                        break
                    except Exception as e:
                        print(e)

        # 2) ImprovMX dashboard — add domain + alias
        imx = ctx.new_page()
        imx.goto("https://app.improvmx.com/", wait_until="domcontentloaded", timeout=60000)
        time.sleep(3)
        print("IMX", imx.url)
        shot(imx, "improvmx-dash.png")
        print("IMX TEXT:\n", imx.inner_text("body")[:2500])

        # Login form if needed
        if "login" in imx.url or imx.locator("input[type='password']").count():
            print("ImprovMX needs login — trying email field")
            if imx.locator("input[type='email']").count():
                imx.fill("input[type='email']", FORWARD)
            # password unknown from confirmation-only signup — user may already be logged in via cookie
            shot(imx, "improvmx-login.png")

        for sel in [
            "text=Add a domain",
            "text=Add domain",
            "button:has-text('Add a domain')",
            "a:has-text('Add a domain')",
            "button:has-text('Add')",
        ]:
            loc = imx.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=5000)
                    print("clicked", sel)
                    time.sleep(2)
                    break
                except Exception as e:
                    print("add click", e)

        filled = False
        for sel in [
            "input[name='domain']",
            "input[placeholder*='domain' i]",
            "input[placeholder*='example.com' i]",
            "input[type='text']",
        ]:
            loc = imx.locator(sel)
            if loc.count():
                try:
                    loc.first.fill(DOMAIN)
                    print("filled", sel)
                    filled = True
                    break
                except Exception as e:
                    print("fill", e)

        if filled:
            for sel in [
                "button:has-text('Add')",
                "button:has-text('Create')",
                "button:has-text('Continue')",
                "button[type='submit']",
            ]:
                loc = imx.locator(sel)
                if loc.count():
                    try:
                        loc.first.click(timeout=5000)
                        print("submit", sel)
                        time.sleep(3)
                        break
                    except Exception as e:
                        print("submit", e)

        shot(imx, "improvmx-after-domain.png")
        print("IMX AFTER DOMAIN:\n", imx.inner_text("body")[:3000])

        # Try add alias support -> forward
        for sel in [
            "text=Add an alias",
            "text=Add alias",
            "button:has-text('Alias')",
            "a:has-text('alias')",
        ]:
            loc = imx.locator(sel)
            if loc.count():
                try:
                    loc.first.click(timeout=4000)
                    time.sleep(1)
                    print("alias ui", sel)
                except Exception:
                    pass

        # 3) Cloudflare zone DNS for domain
        cf = ctx.new_page()
        # Find zone via domains overview search
        cf.goto(
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/domains/overview",
            wait_until="domcontentloaded",
            timeout=90000,
        )
        time.sleep(4)
        print("CF", cf.url)
        shot(cf, "cf-overview.png")
        text = cf.inner_text("body")
        print("CF TEXT:\n", text[:2500])

        # Click domain if listed
        loc = cf.locator(f"a:has-text('{DOMAIN}'), text={DOMAIN}")
        if loc.count():
            loc.first.click(timeout=8000)
            time.sleep(3)
            print("opened zone", cf.url)

        # Direct DNS URLs to try
        html = cf.content()
        zone_ids = re.findall(r"/([a-f0-9]{32})/" + re.escape(DOMAIN), html)
        zone_ids += re.findall(rf"/{CF_ACCOUNT}/([a-f0-9]{{32}})/", html)
        print("zone candidates", zone_ids[:10])

        dns_urls = [
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/dns/records",
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/agentapigw.dpdns.org/dns/records",
        ]
        for zid in zone_ids[:5]:
            dns_urls.append(f"https://dash.cloudflare.com/{CF_ACCOUNT}/{zid}/dns/records")

        for url in dns_urls:
            cf.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            print("DNS try", url, "->", cf.url)
            body = cf.inner_text("body")
            if "DNS" in body or "Add record" in body or "records" in cf.url:
                shot(cf, "cf-dns-records.png")
                print("DNS BODY:\n", body[:3000])
                # Try add MX records
                add_mx_records(cf)
                break

        # Email routing page
        for url in [
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/{DOMAIN}/email/routing/routes",
            f"https://dash.cloudflare.com/{CF_ACCOUNT}/agentapigw.dpdns.org/email/routing",
        ]:
            cf.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            print("EMAIL ROUTING", cf.url)
            shot(cf, "cf-email-routing.png")
            print(cf.inner_text("body")[:2000])
            if "Email Routing" in cf.inner_text("body") or "routing" in cf.url:
                enable_cf_email_routing(cf)
                break

        # 4) Polar settings discovery
        polar = ctx.new_page()
        for url in [
            "https://polar.sh/dashboard/nexuscore/settings/general",
            "https://polar.sh/dashboard/nexuscore/settings/about",
            "https://polar.sh/dashboard/nexuscore/settings/organization",
            "https://polar.sh/dashboard/nexuscore/finance/account",
            "https://polar.sh/dashboard/nexuscore",
        ]:
            polar.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(2)
            body = polar.inner_text("body")
            print("POLAR", polar.url, "len", len(body))
            print(body[:600])
            if "not found" not in body.lower():
                shot(polar, "polar-live.png")
                # fill email/website if inputs exist
                for sel, val in [
                    ("input[type='email']", SUPPORT),
                    ("input[name='email']", SUPPORT),
                    ("input[name='website']", f"https://{DOMAIN}"),
                    ("input[type='url']", f"https://{DOMAIN}"),
                ]:
                    loc = polar.locator(sel)
                    if loc.count():
                        try:
                            loc.first.fill(val)
                            print("filled", sel, val)
                        except Exception as e:
                            print(e)
                # save buttons
                for sel in ["button:has-text('Save')", "button:has-text('Update')", "button[type='submit']"]:
                    loc = polar.locator(sel)
                    if loc.count():
                        try:
                            loc.first.click(timeout=4000)
                            print("saved via", sel)
                            time.sleep(2)
                        except Exception as e:
                            print(e)
                break

        print("DONE")


def add_mx_records(cf) -> None:
    """Best-effort add ImprovMX MX records via Cloudflare UI."""
    records = [
        ("MX", "@", "mx1.improvmx.com", "10"),
        ("MX", "@", "mx2.improvmx.com", "20"),
    ]
    for rtype, name, content, prio in records:
        try:
            btn = cf.locator("button:has-text('Add record'), a:has-text('Add record')")
            if not btn.count():
                print("no Add record button")
                return
            btn.first.click(timeout=5000)
            time.sleep(1)
            # type select
            type_sel = cf.locator("select, [role='combobox']").first
            # Often CF uses a custom dropdown — click Type then MX
            type_btn = cf.locator("button:has-text('Type'), [data-testid*='type']")
            if type_btn.count():
                type_btn.first.click()
                time.sleep(0.5)
            mx_opt = cf.locator(f"text=MX")
            if mx_opt.count():
                mx_opt.first.click()
            # fill name/content
            for sel in ["input[name='name']", "input[placeholder='@']", "input[value='@']"]:
                if cf.locator(sel).count():
                    cf.locator(sel).first.fill(name)
                    break
            for sel in [
                "input[name='content']",
                "input[name='target']",
                "input[placeholder*='mail' i]",
                "input[placeholder*='mx' i]",
            ]:
                if cf.locator(sel).count():
                    cf.locator(sel).first.fill(content)
                    break
            for sel in ["input[name='priority']", "input[placeholder*='priority' i]"]:
                if cf.locator(sel).count():
                    cf.locator(sel).first.fill(prio)
                    break
            save = cf.locator("button:has-text('Save')")
            if save.count():
                save.first.click()
                time.sleep(2)
                print("added MX", content, prio)
            shot(cf, f"cf-mx-{prio}.png")
        except Exception as e:
            print("MX add error", e)


def enable_cf_email_routing(cf) -> None:
    try:
        for sel in [
            "button:has-text('Get started')",
            "button:has-text('Enable')",
            "button:has-text('Start')",
            "text=Enable Email Routing",
        ]:
            loc = cf.locator(sel)
            if loc.count():
                loc.first.click(timeout=5000)
                print("email routing", sel)
                time.sleep(2)
                break
        shot(cf, "cf-email-enabled.png")
        print(cf.inner_text("body")[:2000])
    except Exception as e:
        print("email routing error", e)


if __name__ == "__main__":
    main()
