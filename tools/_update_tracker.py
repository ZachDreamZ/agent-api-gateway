from pathlib import Path
import csv
from datetime import datetime, timezone

# Update tracker with actual status from browser recon
rows = [
    ['Directory','Tier','URL','Category','Positioning Variant','Preferred Landing URL','Status','Notes','Action Needed'],
    ['DevHunt','1','https://devhunt.org/','Launch','Dev','https://agentapigw.dpdns.org/mcp','Needs login','/submit 404; use "Submit your Dev Tool" + Sign In','Sign in then submit'],
    ['SaaSHub','2','https://www.saashub.com/submit','SaaS','SaaS alternative','https://agentapigw.dpdns.org/alternatives/firecrawl','Needs login','Submit Product requires Login/Register','Create account + submit'],
    ['AlternativeTo','2','https://alternativeto.net/software/_/add/','SaaS','SaaS alternative','https://agentapigw.dpdns.org/alternatives','Needs login','Account required for software add','Login + claim alternatives'],
    ['TAAFT','3','https://theresanaiforthat.com/submit/','AI','AI directory','https://agentapigw.dpdns.org/','Ready to paste','Use AI directory copy variant','Submit form'],
    ['Futurepedia','3','https://www.futurepedia.io/submit-tool','AI','AI directory','https://agentapigw.dpdns.org/pricing','Ready to paste','Pricing page live','Submit form'],
    ['Toolify','3','https://www.toolify.ai/','AI','AI directory','https://agentapigw.dpdns.org/','Ready to paste','Find submit tool form','Submit form'],
    ['Glama MCP','4','https://glama.ai/mcp','Agent/MCP','Agent/MCP','https://agentapigw.dpdns.org/mcp','Ready to paste','Package agent-api-gateway-mcp','List MCP server'],
    ['MCP Registry','4','https://registry.modelcontextprotocol.io/','Agent/MCP','Agent/MCP','https://agentapigw.dpdns.org/mcp','Live','io.github.ZachDreamZ/agent-api-gateway','Already published'],
    ['npm package page','4','https://www.npmjs.com/package/agent-api-gateway-mcp','Agent/MCP','Agent/MCP','https://agentapigw.dpdns.org/mcp','Live','Published package','Keep README current'],
    ['Indie Hackers','8','https://www.indiehackers.com/products','Community','Startup','https://agentapigw.dpdns.org/','Needs login','Product page after auth','Create product'],
    ['Product Hunt','1','https://www.producthunt.com/posts/new','Launch','Startup','https://agentapigw.dpdns.org/','Assets ready / launch blocked','Screenshots captured; need demo video + warm-up','See product-hunt-pack.md'],
    ['Hacker News Show HN','1','https://news.ycombinator.com/submit','Launch','Dev','https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor','Draft ready','Use show-hn-draft.md technical angle only','Post when ready'],
]
with Path('growth/directory-tracker.csv').open('w', encoding='utf-8', newline='') as f:
    csv.writer(f).writerows(rows)

# One-click operator checklist
checklist = f'''# Operator checklist — next 60 minutes

Generated: {datetime.now(timezone.utc).isoformat()}

## Already done by Codex
- Use-case SEO pages prepared (`/use-cases/*`)
- FAQ schema on landing
- Product screenshots in `growth/assets/`
- PH / Show HN / submission copy packs
- MCP registry + npm already live

## You must click (auth required)
1. **DevHunt** — https://devhunt.org/ → Sign In → Submit your Dev Tool
   - Landing: /mcp
   - Copy: growth/submission-batch.md §1
2. **SaaSHub** — https://www.saashub.com/submit → Login → Submit Product
   - Landing: /alternatives/firecrawl
   - Copy: §2
3. **AlternativeTo** — https://alternativeto.net/software/_/add/
   - Alternatives to: Firecrawl, Browse AI, Scrapy, Browserless
4. **TAAFT / Futurepedia / Toolify** — AI directory variants in submission-batch.md
5. **Glama MCP** — package `agent-api-gateway-mcp`
6. **Indie Hackers product page**
7. **Show HN** when you want technical launch (draft ready)
8. **Product Hunt** after 60–90s demo video + 2–3 week account warm-up

## Assets to upload
- Logo: src/dashboard/public/brand/agent-api-gateway-mark-512.png
- Screenshots: growth/assets/*.png
- Gallery (PH size): growth/assets/ph-*-1270x760.png
'''
Path('growth/operator-checklist.md').write_text(checklist, encoding='utf-8')

# Assets readme
assets_readme = '''# Launch assets

## Screenshots captured
- home-1440x900.png
- pricing-1440x900.png
- mcp-1440x900.png
- alternatives-firecrawl-1440x900.png
- docs-1440x900.png
- use-cases-1440x900.png
- ph-home-1270x760.png
- ph-mcp-1270x760.png
- ph-pricing-1270x760.png

## Logo
Use repo brand marks:
- ../../src/dashboard/public/brand/agent-api-gateway-mark-512.png
- ../../src/dashboard/public/brand/agent-api-gateway-mark-256.png
- ../../src/dashboard/public/favicon.svg

## Still missing for Product Hunt
- 60–90 second demo video (record MCP install + extract call)
'''
Path('growth/assets/README.md').write_text(assets_readme, encoding='utf-8')
print('tracker + checklist updated')
