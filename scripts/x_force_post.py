from playwright.sync_api import sync_playwright
import time
from pathlib import Path

OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
TWEET = (
    "Shipped: Agent API Gateway — structured web data for AI agents.\n\n"
    "Send a URL + schema → clean JSON (product / article / company).\n\n"
    "Live: https://agentapigw.dpdns.org\n"
    "Buy $1 Starter: https://agentapigw.dpdns.org/buy\n\n"
    "#buildinpublic #saas #aiagents"
)

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
    ctx = b.contexts[0]
    page = next((pg for pg in ctx.pages if "x.com" in pg.url), None)
    if page is None:
        page = ctx.new_page()
        page.goto("https://x.com/compose/post", wait_until="domcontentloaded", timeout=90000)
    page.keyboard.press("Escape")
    time.sleep(0.5)
    if "compose" not in page.url:
        page.goto("https://x.com/compose/post", wait_until="domcontentloaded", timeout=90000)
        time.sleep(2)
    ed = page.locator('[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]').first
    ed.click()
    txt = ed.inner_text()
    print("editor", repr(txt[:120]))
    if "Agent API Gateway" not in txt:
        ed.fill(TWEET)
        time.sleep(1)
    btn = page.locator('[data-testid="tweetButton"]')
    print("btn count", btn.count())
    btn.first.click(force=True, timeout=15000)
    time.sleep(5)
    print("url", page.url)
    page.screenshot(path=str(OUT / "x-posted.png"))
    body = page.inner_text("body")
    print(body[:1500])
    # status URL if redirected
    links = page.locator('a[href*="/status/"]')
    status = ""
    if links.count():
        status = links.first.get_attribute("href") or ""
    (OUT / "x-post-result.txt").write_text(
        f"url={page.url}\nstatus_link={status}\n", encoding="utf-8"
    )
    print("status_link", status)
