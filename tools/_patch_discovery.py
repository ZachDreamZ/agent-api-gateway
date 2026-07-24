from pathlib import Path
import json

# --- llms.txt ---
llms = Path('src/dashboard/public/llms.txt').read_text(encoding='utf-8')
if 'https://agentapigw.dpdns.org/pricing' not in llms:
    llms = llms.replace(
        '- MCP install hub: https://agentapigw.dpdns.org/mcp\n',
        '- MCP install hub: https://agentapigw.dpdns.org/mcp\n- Pricing page: https://agentapigw.dpdns.org/pricing\n- Alternatives: https://agentapigw.dpdns.org/alternatives\n- Firecrawl alternative: https://agentapigw.dpdns.org/alternatives/firecrawl\n',
        1,
    )
Path('src/dashboard/public/llms.txt').write_text(llms, encoding='utf-8')

# --- llms-full.txt ---
full = Path('src/dashboard/public/llms-full.txt').read_text(encoding='utf-8')
if 'https://agentapigw.dpdns.org/pricing' not in full:
    full = full.replace(
        '- MCP install hub: https://agentapigw.dpdns.org/mcp\n',
        '- MCP install hub: https://agentapigw.dpdns.org/mcp\n- Pricing page: https://agentapigw.dpdns.org/pricing\n- Alternatives index: https://agentapigw.dpdns.org/alternatives\n- Firecrawl alternative: https://agentapigw.dpdns.org/alternatives/firecrawl\n- Browse AI alternative: https://agentapigw.dpdns.org/alternatives/browse-ai\n',
        1,
    )
if 'install-agent-api-gateway-mcp-in-cursor' not in full:
    full = full.replace(
        '## Engineering blog\n',
        '''## Comparisons (high-intent SEO)
- Alternatives index: https://agentapigw.dpdns.org/alternatives
- Firecrawl alternative: https://agentapigw.dpdns.org/alternatives/firecrawl
- Browse AI alternative: https://agentapigw.dpdns.org/alternatives/browse-ai
- Scrapy alternative: https://agentapigw.dpdns.org/alternatives/scrapy
- Browserless alternative: https://agentapigw.dpdns.org/alternatives/browserless
- Pricing: https://agentapigw.dpdns.org/pricing

## Engineering blog
- Install MCP in Cursor: https://agentapigw.dpdns.org/blog/install-agent-api-gateway-mcp-in-cursor
''',
        1,
    )
Path('src/dashboard/public/llms-full.txt').write_text(full, encoding='utf-8')

# --- agent.json ---
agent_path = Path('src/dashboard/public/agent.json')
agent = json.loads(agent_path.read_text(encoding='utf-8'))
agent['pricing_page'] = 'https://agentapigw.dpdns.org/pricing'
agent['alternatives'] = {
    'index': 'https://agentapigw.dpdns.org/alternatives',
    'firecrawl': 'https://agentapigw.dpdns.org/alternatives/firecrawl',
    'browse_ai': 'https://agentapigw.dpdns.org/alternatives/browse-ai',
    'scrapy': 'https://agentapigw.dpdns.org/alternatives/scrapy',
    'browserless': 'https://agentapigw.dpdns.org/alternatives/browserless',
}
agent['blog'] = {
    'index': 'https://agentapigw.dpdns.org/blog',
    'rss': 'https://agentapigw.dpdns.org/blog/rss.xml',
    'json_feed': 'https://agentapigw.dpdns.org/blog/feed.json',
}
agent_path.write_text(json.dumps(agent, indent=2) + '\n', encoding='utf-8')
print('llms + agent.json updated')
