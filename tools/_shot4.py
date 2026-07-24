from pathlib import Path
from playwright.sync_api import sync_playwright
out = Path('growth/assets')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    for name,url in [('ph-mcp-1270x760.png','https://agentapigw.dpdns.org/mcp'),('ph-pricing-1270x760.png','https://agentapigw.dpdns.org/pricing'),('use-cases-1440x900.png','https://agentapigw.dpdns.org/use-cases')]:
        w,h = (1270,760) if name.startswith('ph-') else (1440,900)
        page.set_viewport_size({'width':w,'height':h})
        page.goto(url, wait_until='domcontentloaded', timeout=45000)
        page.wait_for_timeout(1500)
        path = out/name
        page.screenshot(path=str(path), full_page=False)
        print('saved', path, path.stat().st_size)
    browser.close()
print('done')
