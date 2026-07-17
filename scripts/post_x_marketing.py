#!/usr/bin/env python3
"""Post marketing tweet from logged-in X session in Brave CDP."""
from __future__ import annotations

import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CDP = "http://127.0.0.1:9222"
OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
TWEET = (
    "Shipped: Agent API Gateway — structured web data for AI agents.\n\n"
    "Send a URL + schema → clean JSON (product / article / company).\n\n"
    "Live: https://agentapigw.dpdns.org\n"
    "Buy $1 Starter: https://agentapigw.dpdns.org/buy\n\n"
    "#buildinpublic #saas #aiagents"
)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]
        page = None
        for pg in ctx.pages:
            if "x.com" in pg.url or "twitter.com" in pg.url:
                page = pg
                break
        if page is None:
            page = ctx.new_page()
        page.goto("https://x.com/compose/post", wait_until="domcontentloaded", timeout=90000)
        time.sleep(3)
        print("url", page.url)
        page.screenshot(path=str(OUT / "x-compose.png"))
        # draft editor
        editors = page.locator(
            '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]'
        )
        print("editors", editors.count())
        if not editors.count():
            # try home compose
            page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=90000)
            time.sleep(3)
            page.locator('[data-testid="SideNav_NewTweet_Button"], a[href="/compose/post"]').first.click(
                timeout=10000
            )
            time.sleep(2)
            editors = page.locator(
                '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]'
            )
            print("editors2", editors.count())
        if editors.count():
            editors.first.click()
            editors.first.fill(TWEET)
            time.sleep(1)
            page.screenshot(path=str(OUT / "x-filled.png"))
            post_btn = page.locator(
                '[data-testid="tweetButton"], [data-testid="tweetButtonInline"]'
            )
            print("post buttons", post_btn.count())
            if post_btn.count():
                # only click if enabled
                try:
                    disabled = post_btn.first.get_attribute("aria-disabled")
                    print("aria-disabled", disabled)
                    post_btn.first.click(timeout=10000)
                    time.sleep(4)
                    print("clicked post")
                except Exception as e:
                    print("post click", e)
        page.screenshot(path=str(OUT / "x-after.png"))
        print("final", page.url)
        print(page.inner_text("body")[:1500])
        (OUT / "x-marketing.txt").write_text(
            f"url={page.url}\ntweet=\n{TWEET}\n", encoding="utf-8"
        )


if __name__ == "__main__":
    main()
