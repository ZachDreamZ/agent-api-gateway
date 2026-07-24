from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('growth/assets')
out.mkdir(parents=True, exist_ok=True)

pages = [
    ('home', 'https://agentapigw.dpdns.org/', 1440, 900),
    ('pricing', 'https://agentapigw.dpdns.org/pricing', 1440, 900),
    ('mcp', 'https://agentapigw.dpdns.org/mcp', 1440, 900),
    ('alternatives-firecrawl', 'https://agentapigw.dpdns.org/alternatives/firecrawl', 1440, 900),
    ('use-cases', 'https://agentapigw.dpdns.org/use-cases', 1440, 900),
    ('docs', 'https://agentapigw.dpdns.org/docs', 1440, 900),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
    page = context.new_page()
    for name, url, w, h in pages:
        page.set_viewport_size({'width': w, 'height': h})
        page.goto(url, wait_until='networkidle', timeout=60000)
        page.wait_for_timeout(1200)
        path = out / f'{name}-1440x900.png'
        page.screenshot(path=str(path), full_page=False)
        print('saved', path, path.stat().st_size)
    # Product Hunt gallery-ish 1270x760 crop via viewport
    page.set_viewport_size({'width': 1270, 'height': 760})
    for name, url in [('ph-home', 'https://agentapigw.dpdns.org/'), ('ph-mcp', 'https://agentapigw.dpdns.org/mcp'), ('ph-pricing', 'https://agentapigw.dpdns.org/pricing')]:
        page.goto(url, wait_until='networkidle', timeout=60000)
        page.wait_for_timeout(1000)
        path = out / f'{name}-1270x760.png'
        page.screenshot(path=str(path), full_page=False)
        print('saved', path, path.stat().st_size)
    browser.close()
print('screenshots complete')
