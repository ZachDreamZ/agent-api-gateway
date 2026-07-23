robots_content = '''# Agent API Gateway robots.txt
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/

# Sitemaps
Sitemap: https://agentapigw.dpdns.org/sitemap.xml

# AI Crawlers
User-agent: GPTBot
Allow: /
Disallow: /dashboard
Disallow: /api/

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Disallow: /

User-agent: Yandex
Disallow: /
'''

with open('public/robots.txt', 'w', encoding='utf-8') as f:
    f.write(robots_content)

print('Generated robots.txt')
