from pathlib import Path
import re

# Wire routes
app = Path('src/dashboard/src/app.tsx')
t = app.read_text(encoding='utf-8')
if "const UseCases = lazy" not in t:
    t = t.replace(
        "const Alternatives = lazy(() => import('./pages/Alternatives'));\n",
        "const Alternatives = lazy(() => import('./pages/Alternatives'));\nconst UseCases = lazy(() => import('./pages/UseCases'));\n",
        1,
    )
if 'path="/use-cases"' not in t:
    t = t.replace(
        '        <Route path="/alternatives/:slug" element={<Alternatives />} />\n',
        '        <Route path="/alternatives/:slug" element={<Alternatives />} />\n        <Route path="/use-cases" element={<UseCases />} />\n        <Route path="/use-cases/:slug" element={<UseCases />} />\n',
        1,
    )
app.write_text(t, encoding='utf-8')
print('app routes wired')

# Landing footer + nav links
landing = Path('src/dashboard/src/pages/AuraLanding.tsx')
lt = landing.read_text(encoding='utf-8')
if 'to="/use-cases"' not in lt:
    lt = lt.replace(
        '<Link to="/alternatives" className="link text-sm">Alternatives</Link>\n          <Link to="/blog" className="link text-sm">Blog</Link>',
        '<Link to="/alternatives" className="link text-sm">Alternatives</Link>\n          <Link to="/use-cases" className="link text-sm">Use cases</Link>\n          <Link to="/blog" className="link text-sm">Blog</Link>',
        1,
    )
    lt = lt.replace(
        '''                <Link to="/alternatives" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Alternatives
                </Link>
                <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Blog
                </Link>''',
        '''                <Link to="/alternatives" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Alternatives
                </Link>
                <Link to="/use-cases" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Use cases
                </Link>
                <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Blog
                </Link>''',
        1,
    )
    lt = lt.replace(
        '<Link to="/alternatives" className="link">Alternatives</Link>\n          <a href="/health" className="link">Status</a>',
        '<Link to="/alternatives" className="link">Alternatives</Link>\n          <Link to="/use-cases" className="link">Use cases</Link>\n          <a href="/health" className="link">Status</a>',
        1,
    )

# Ensure FAQPage JSON-LD exists on landing
if 'FAQPage' not in lt:
    # find existing ld+json script and append another, or inject near first script
    faq_block = '''
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is Agent API Gateway?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Agent API Gateway turns public product, article, and company pages into validated JSON for AI agents via REST or MCP.',
                },
              },
              {
                '@type': 'Question',
                name: 'Does it support MCP?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Install the published package agent-api-gateway-mcp from the /mcp hub for Cursor and Claude Desktop.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does pricing work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'There is a free tier, subscriptions for higher monthly limits, and one-time credit packs starting at $1.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is it a Firecrawl alternative?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'For agent-first single-URL structured extraction, yes. For full-site crawl orchestration, Firecrawl may still be a better fit. See /alternatives/firecrawl.',
                },
              },
            ],
          }),
        }}
      />
'''
    # insert after first ld+json script close if present
    idx = lt.find('type="application/ld+json"')
    if idx != -1:
        # find the end of that script tag block
        end = lt.find('/>', idx)
        if end == -1:
            end = lt.find('</script>', idx)
            end = lt.find('\n', end)
        else:
            end = lt.find('\n', end)
        lt = lt[:end+1] + faq_block + lt[end+1:]
    else:
        # insert near top of Landing return
        lt = lt.replace('<div\n      className="landing-shell relative min-h-screen"', faq_block + '\n    <div\n      className="landing-shell relative min-h-screen"', 1)

landing.write_text(lt, encoding='utf-8')
print('landing updated; FAQPage', 'FAQPage' in lt)
