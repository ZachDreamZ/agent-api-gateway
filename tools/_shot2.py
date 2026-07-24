from pathlib import Path
from playwright.sync_api import sync_playwright
out = Path('growth/assets'); out.mkdir(parents=True, exist_ok=True)
targets = [
 ('pricing-1440x900.png','https://agentapigw.dpdns.org/pricing',1440,900),
 ('mcp-1440x900.png','https://agentapigw.dpdns.org/mcp',1440,900),
]
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    for name,url,w,h in targets:
        page.set_viewport_size({'width':w,'height':h})
        page.goto(url, wait_until='domcontentloaded', timeout=45000)
        page.wait_for_timeout(1500)
        path = out/name
        page.screenshot(path=str(path), full_page=False)
        print('saved', path, path.stat().st_size)
    browser.close()
