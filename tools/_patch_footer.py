from pathlib import Path

# light footer component cleanup for real paths if used later
p = Path('src/dashboard/src/components/Footer.tsx')
t = p.read_text(encoding='utf-8')
t2 = t
t2 = t2.replace("{ label: 'Pricing', href: '/#pricing' },", "{ label: 'Pricing', href: '/pricing' },\n      { label: 'Alternatives', href: '/alternatives' },\n      { label: 'MCP', href: '/mcp' },")
t2 = t2.replace("{ label: 'For Agents', href: '/for-agents' },", "{ label: 'For Agents', href: '/agents' },")
t2 = t2.replace("{ label: 'Privacy Policy', href: '/legal#privacy' },", "{ label: 'Privacy Policy', href: '/privacy' },")
t2 = t2.replace("{ label: 'Terms of Service', href: '/legal#terms' },", "{ label: 'Terms of Service', href: '/terms' },")
if t2 != t:
    p.write_text(t2, encoding='utf-8')
    print('Footer.tsx defaults updated')
else:
    print('Footer.tsx unchanged')
