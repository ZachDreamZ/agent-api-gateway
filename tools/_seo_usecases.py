from pathlib import Path
import json

# Update sitemap with use-cases
sm = Path('src/dashboard/public/sitemap.xml').read_text(encoding='utf-8')
extra_urls = [
    ('https://agentapigw.dpdns.org/use-cases', 'weekly', '0.85'),
    ('https://agentapigw.dpdns.org/use-cases/price-intelligence', 'monthly', '0.8'),
    ('https://agentapigw.dpdns.org/use-cases/content-research', 'monthly', '0.8'),
    ('https://agentapigw.dpdns.org/use-cases/company-enrichment', 'monthly', '0.8'),
    ('https://agentapigw.dpdns.org/use-cases/mcp-agents', 'monthly', '0.8'),
]
if '/use-cases' not in sm:
    block = ''
    for loc, freq, pri in extra_urls:
        block += f'''  <url>
    <loc>{loc}</loc>
    <changefreq>{freq}</changefreq>
    <priority>{pri}</priority>
    <lastmod>2026-07-24</lastmod>
  </url>
'''
    sm = sm.replace('</urlset>', block + '</urlset>')
    Path('src/dashboard/public/sitemap.xml').write_text(sm, encoding='utf-8')
    print('sitemap updated')
else:
    print('sitemap already has use-cases')

# robots allow use-cases
rb = Path('src/dashboard/public/robots.txt').read_text(encoding='utf-8')
if 'Allow: /use-cases' not in rb:
    rb = rb.replace('Allow: /alternatives\n', 'Allow: /alternatives\nAllow: /use-cases\n')
    # also AI crawler blocks
    rb = rb.replace('Allow: /alternatives\n\nUser-agent: Claude-Web', 'Allow: /alternatives\nAllow: /use-cases\n\nUser-agent: Claude-Web')
    # simpler: append allow lines after each alternatives allow for AI bots
    rb = rb.replace('Allow: /alternatives\n', 'Allow: /alternatives\nAllow: /use-cases\n')
    Path('src/dashboard/public/robots.txt').write_text(rb, encoding='utf-8')
    print('robots updated')
else:
    print('robots already has use-cases')

# discovery files
for rel in ['src/dashboard/public/llms.txt', 'src/dashboard/public/llms-full.txt']:
    p = Path(rel)
    t = p.read_text(encoding='utf-8')
    if '/use-cases' not in t:
        t = t.replace(
            '- Alternatives: https://agentapigw.dpdns.org/alternatives\n',
            '- Alternatives: https://agentapigw.dpdns.org/alternatives\n- Use cases: https://agentapigw.dpdns.org/use-cases\n',
        )
        if 'Use cases:' not in t and '## Comparisons' in t:
            t = t.replace('## Comparisons (high-intent SEO)\n', '## Comparisons (high-intent SEO)\n- Use cases: https://agentapigw.dpdns.org/use-cases\n')
        if 'Use cases' not in t:
            t += '\n## Use cases\n- https://agentapigw.dpdns.org/use-cases\n- https://agentapigw.dpdns.org/use-cases/price-intelligence\n- https://agentapigw.dpdns.org/use-cases/content-research\n- https://agentapigw.dpdns.org/use-cases/company-enrichment\n- https://agentapigw.dpdns.org/use-cases/mcp-agents\n'
        p.write_text(t, encoding='utf-8')
        print(rel, 'updated')

agent_path = Path('src/dashboard/public/agent.json')
agent = json.loads(agent_path.read_text(encoding='utf-8'))
agent['use_cases'] = {
    'index': 'https://agentapigw.dpdns.org/use-cases',
    'price_intelligence': 'https://agentapigw.dpdns.org/use-cases/price-intelligence',
    'content_research': 'https://agentapigw.dpdns.org/use-cases/content-research',
    'company_enrichment': 'https://agentapigw.dpdns.org/use-cases/company-enrichment',
    'mcp_agents': 'https://agentapigw.dpdns.org/use-cases/mcp-agents',
}
agent_path.write_text(json.dumps(agent, indent=2) + '\n', encoding='utf-8')
print('agent.json updated')
