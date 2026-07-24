from pathlib import Path
from playwright.sync_api import sync_playwright
out = Path('growth/assets'); out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('https://agentapigw.dpdns.org/', wait_until='domcontentloaded', timeout=45000)
    page.wait_for_timeout(2000)
    path = out / 'home-1440x900.png'
    page.screenshot(path=str(path), full_page=False)
    print('saved', path, path.stat().st_size)
    browser.close()
