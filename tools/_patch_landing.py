from pathlib import Path

landing = Path('src/dashboard/src/pages/AuraLanding.tsx')
t = landing.read_text(encoding='utf-8')

# Desktop nav: keep #pricing but also add dedicated Pricing + MCP + Alternatives
old_nav = '''          <a href="#pricing" className="link text-sm">Pricing</a>
          <Link to="/docs" className="link text-sm">Docs</Link>
          <Link to="/blog" className="link text-sm">Blog</Link>
          <Link to="/agents" className="link text-sm">For agents</Link>'''
new_nav = '''          <Link to="/pricing" className="link text-sm">Pricing</Link>
          <Link to="/docs" className="link text-sm">Docs</Link>
          <Link to="/mcp" className="link text-sm">MCP</Link>
          <Link to="/alternatives" className="link text-sm">Alternatives</Link>
          <Link to="/blog" className="link text-sm">Blog</Link>
          <Link to="/agents" className="link text-sm">For agents</Link>'''
if old_nav not in t:
    raise SystemExit('desktop nav block missing')
t = t.replace(old_nav, new_nav, 1)

old_mobile = '''                <Link to="/docs" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Docs
                </Link>
                <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Blog
                </Link>
                <Link to="/agents" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  For agents
                </Link>'''
new_mobile = '''                <Link to="/pricing" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Pricing
                </Link>
                <Link to="/docs" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Docs
                </Link>
                <Link to="/mcp" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  MCP
                </Link>
                <Link to="/alternatives" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Alternatives
                </Link>
                <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  Blog
                </Link>
                <Link to="/agents" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm link" style={{ color: 'var(--color-text-secondary)' }}>
                  For agents
                </Link>'''
if old_mobile not in t:
    raise SystemExit('mobile nav block missing')
t = t.replace(old_mobile, new_mobile, 1)

# Footer: point Pricing to /pricing and add alternatives
old_footer = '''          <Link to="/docs" className="link">Docs</Link>
          <Link to="/blog" className="link">Blog</Link>
          <Link to="/agents" className="link">For agents</Link>
          <a href="/llms.txt" className="link">llms.txt</a>
          <a href="/agent.json" className="link">agent.json</a>
          <Link to="/dashboard" className="link">Dashboard</Link>
          <a href="#pricing" className="link">Pricing</a>
          <a href="/health" className="link">Status</a>
          <Link to="/privacy" className="link">Privacy</Link>
          <Link to="/terms" className="link">Terms</Link>
          <Link to="/aup" className="link">AUP</Link>
          <Link to="/mcp" className="link">MCP</Link>'''
new_footer = '''          <Link to="/docs" className="link">Docs</Link>
          <Link to="/blog" className="link">Blog</Link>
          <Link to="/agents" className="link">For agents</Link>
          <a href="/llms.txt" className="link">llms.txt</a>
          <a href="/agent.json" className="link">agent.json</a>
          <Link to="/dashboard" className="link">Dashboard</Link>
          <Link to="/pricing" className="link">Pricing</Link>
          <Link to="/alternatives" className="link">Alternatives</Link>
          <a href="/health" className="link">Status</a>
          <Link to="/privacy" className="link">Privacy</Link>
          <Link to="/terms" className="link">Terms</Link>
          <Link to="/aup" className="link">AUP</Link>
          <Link to="/mcp" className="link">MCP</Link>'''
if old_footer not in t:
    raise SystemExit('footer block missing')
t = t.replace(old_footer, new_footer, 1)

landing.write_text(t, encoding='utf-8')
print('AuraLanding links updated')
