from datetime import datetime

base_url = 'https://agentapigw.dpdns.org'
now = datetime.utcnow().strftime('%Y-%m-%d')

routes = [
    {'path': '/', 'priority': '1.0', 'changefreq': 'daily'},
    {'path': '/docs', 'priority': '0.9', 'changefreq': 'weekly'},
    {'path': '/pricing', 'priority': '0.9', 'changefreq': 'monthly'},
    {'path': '/blog', 'priority': '0.8', 'changefreq': 'weekly'},
    {'path': '/for-agents', 'priority': '0.8', 'changefreq': 'monthly'},
    {'path': '/auth/signin', 'priority': '0.6', 'changefreq': 'monthly'},
    {'path': '/auth/signup', 'priority': '0.6', 'changefreq': 'monthly'},
    {'path': '/legal/privacy', 'priority': '0.5', 'changefreq': 'monthly'},
    {'path': '/legal/terms', 'priority': '0.5', 'changefreq': 'monthly'},
]

sitemap = '''<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
'''

for route in routes:
    sitemap += f'''  <url>
    <loc>{base_url}{route['path']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{route['changefreq']}</changefreq>
    <priority>{route['priority']}</priority>
  </url>
'''

sitemap += '</urlset>'

with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap)

print('Generated sitemap.xml')
