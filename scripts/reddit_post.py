from playwright.sync_api import sync_playwright
import time
from pathlib import Path

OUT = Path(r"C:\Users\Vendex\AppData\Local\Temp\grok-goal-a829612189ba\implementer")
TITLE = "Agent API Gateway — $1 structured web data API for AI agents"
BODY = """I shipped a tiny SaaS for agent builders:

**Agent API Gateway** — send a URL + schema (`product` / `article` / `company`) and get validated JSON back (no HTML soup).

- Live: https://agentapigw.dpdns.org
- Docs/pricing: https://agentapigw.dpdns.org/#pricing
- Buy Starter Pack ($1 one-time via Polar): https://agentapigw.dpdns.org/buy
- Source: https://github.com/ZachDreamZ/agent-api-gateway

Feedback welcome.
"""

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
    page = b.contexts[0].new_page()
    page.goto(
        "https://www.reddit.com/r/SideProject/submit/?type=TEXT",
        wait_until="domcontentloaded",
        timeout=90000,
    )
    time.sleep(4)
    print("url", page.url)
    # title
    title = page.locator('textarea[name="title"], input[name="title"], div[name="title"] textarea, #innerTextArea')
    # Reddit new UI: contenteditable / placeholder Title
    candidates = [
        'textarea[placeholder="Title"]',
        'div[data-contents="true"] textarea',
        'faceplate-textarea-input textarea',
        'textarea',
    ]
    filled_title = False
    for sel in candidates:
        loc = page.locator(sel)
        if loc.count():
            try:
                loc.first.fill(TITLE)
                print("title via", sel)
                filled_title = True
                break
            except Exception as e:
                print("title fail", sel, e)
    # body
    body_sels = [
        'div[role="textbox"][contenteditable="true"]',
        'div[data-testid="rte"] div[contenteditable="true"]',
        'div[name="body"] div[contenteditable="true"]',
        'textarea[name="text"]',
        'textarea[placeholder*="Body" i]',
        'textarea[placeholder*="Text" i]',
    ]
    for sel in body_sels:
        loc = page.locator(sel)
        if loc.count():
            try:
                loc.first.click()
                loc.first.fill(BODY)
                print("body via", sel)
                break
            except Exception as e:
                print("body fail", sel, e)
    page.screenshot(path=str(OUT / "reddit-filled.png"), full_page=True)
    # submit
    for sel in [
        'button:has-text("Post")',
        'button[type="submit"]',
        'button:has-text("Submit")',
    ]:
        loc = page.locator(sel)
        if loc.count():
            try:
                loc.last.click(force=True, timeout=10000)
                print("clicked", sel)
                time.sleep(5)
                break
            except Exception as e:
                print("post", e)
    print("final", page.url)
    page.screenshot(path=str(OUT / "reddit-posted.png"), full_page=True)
    print(page.inner_text("body")[:1500])
    (OUT / "reddit-result.txt").write_text(f"url={page.url}\n", encoding="utf-8")
