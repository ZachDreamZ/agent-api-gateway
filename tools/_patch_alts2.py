from pathlib import Path

p = Path('src/dashboard/src/pages/Alternatives.tsx')
text = p.read_text(encoding='utf-8')
start = text.index('function AlternativeDetail')
prefix = text[:start]

detail = """function AlternativeDetail({ item }: { item: Alternative }) {
  return (
    <div className=\"relative min-h-screen\" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity=\"subtle\" />
      <div className=\"relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16\">
        <BrandLockup variant=\"product\" showOrgSubline to=\"/\" />
        <SectionLabel>Comparisons</SectionLabel>
        <h1 className=\"text-display-sm mb-3\">{item.name} alternative for AI agents</h1>
        <p className=\"text-body mb-6\" style={{ color: 'var(--color-text-secondary)' }}>
          {item.summary}
        </p>
        <p className=\"text-sm mb-8\" style={{ color: 'var(--color-text-tertiary)' }}>
          Best for: {item.bestFor}
        </p>

        <div className=\"table-wrap mb-8 overflow-x-auto\">
          <table className=\"w-full text-left text-sm\" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className=\"py-2 pr-3 font-medium\">Feature</th>
                <th className=\"py-2 px-2 font-medium text-center\">Agent API Gateway</th>
                <th className=\"py-2 pl-2 font-medium text-center\">{item.name}</th>
              </tr>
            </thead>
            <tbody>
              {item.rows.map((row) => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td className=\"py-2.5 pr-3\" style={{ color: 'var(--color-text-secondary)' }}>{row.feature}</td>
                  <td className=\"py-2.5 px-2 text-center\">
                    <CellValue value={row.us} />
                  </td>
                  <td className=\"py-2.5 pl-2 text-center\">
                    <CellValue value={row.them} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className=\"grid gap-4 md:grid-cols-2 mb-10\">
          <div className=\"surface p-5\">
            <h2 className=\"text-heading mb-3\">Choose Agent API Gateway when</h2>
            <ul className=\"space-y-2 text-sm\" style={{ color: 'var(--color-text-secondary)' }}>
              {item.whenChooseUs.map((line) => (
                <li key={line} className=\"flex gap-2\">
                  <Check className=\"w-4 h-4 shrink-0 mt-0.5\" style={{ color: 'var(--color-accent-base)' }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className=\"surface p-5\">
            <h2 className=\"text-heading mb-3\">Choose {item.name} when</h2>
            <ul className=\"space-y-2 text-sm\" style={{ color: 'var(--color-text-secondary)' }}>
              {item.whenChooseThem.map((line) => (
                <li key={line} className=\"flex gap-2\">
                  <ArrowRight className=\"w-4 h-4 shrink-0 mt-0.5\" style={{ color: 'var(--color-text-disabled)' }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className=\"surface surface-glow p-6 text-center mb-8\">
          <h2 className=\"text-title mb-2\">Try the agent-first extract path</h2>
          <p className=\"text-body mb-5\" style={{ color: 'var(--color-text-secondary)' }}>
            Free tier, credit packs from $1, REST + MCP. Public URLs only.
          </p>
          <div className=\"flex flex-wrap justify-center gap-3\">
            <Link to=\"/login\" className=\"btn btn-primary text-sm\">Start free</Link>
            <Link to=\"/mcp\" className=\"btn btn-secondary text-sm\">Install MCP</Link>
            <Link to=\"/docs\" className=\"btn btn-ghost text-sm\">Read docs</Link>
          </div>
        </div>

        <p className=\"text-xs\" style={{ color: 'var(--color-text-disabled)' }}>
          <Link to=\"/alternatives\" className=\"link-accent\">All alternatives</Link>
          {' · '}
          <Link to=\"/\" className=\"link-accent\">Home</Link>
          {' · '}
          <Link to=\"/pricing\" className=\"link-accent\">Pricing</Link>
        </p>
      </div>
    </div>
  );
}

"""

rest = """export default function Alternatives() {
  const { slug } = useParams<{ slug?: string }>();
  const item = slug ? ALTERNATIVES.find((a) => a.slug === slug) : undefined;

  useSEO({
    title: item ? item.title : slug ? 'Comparison not found' : 'Alternatives',
    description: item
      ? item.description
      : 'Compare Agent API Gateway with Firecrawl, Browse AI, Scrapy, and headless browser APIs. Structured extraction for AI agents via REST and MCP.',
    keywords: item
      ? item.keywords
      : 'Firecrawl alternative, Browse AI alternative, Scrapy alternative, AI agent extraction API',
    canonical: item
      ? `https://agentapigw.dpdns.org/alternatives/${item.slug}`
      : 'https://agentapigw.dpdns.org/alternatives',
  });

  if (slug && !item) {
    return (
      <div className=\"relative min-h-screen flex items-center justify-center px-5\" style={{ background: 'var(--color-bg-app)' }}>
        <div className=\"text-center\">
          <h1 className=\"text-display-sm mb-3\">Comparison not found</h1>
          <Link to=\"/alternatives\" className=\"btn btn-primary text-sm\">View all alternatives</Link>
        </div>
      </div>
    );
  }

  if (item) return <AlternativeDetail item={item} />;

  return (
    <div className=\"relative min-h-screen\" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity=\"subtle\" />
      <div className=\"relative z-10 mx-auto max-w-3xl px-5 py-12 md:py-16\">
        <BrandLockup variant=\"product\" showOrgSubline to=\"/\" />
        <SectionLabel>Comparisons</SectionLabel>
        <h1 className=\"text-display-sm mb-3\">Agent API Gateway alternatives & comparisons</h1>
        <p className=\"text-body mb-8\" style={{ color: 'var(--color-text-secondary)' }}>
          High-intent pages for teams evaluating extraction stacks. Honest tradeoffs — when we win and when another tool is a better fit.
        </p>

        <ul className=\"space-y-3 mb-10\">
          {ALTERNATIVES.map((alt) => (
            <li key={alt.slug} className=\"surface p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2\">
              <div>
                <Link to={`/alternatives/${alt.slug}`} className=\"link-accent text-sm font-medium\">{alt.name} alternative</Link>
                <p className=\"text-caption mt-1\" style={{ color: 'var(--color-text-tertiary)' }}>{alt.bestFor}</p>
              </div>
              <Link to={`/alternatives/${alt.slug}`} className=\"text-xs link shrink-0\">Compare →</Link>
            </li>
          ))}
        </ul>

        <div className=\"flex flex-wrap gap-3\">
          <Link to=\"/login\" className=\"btn btn-primary text-sm\">Start free</Link>
          <Link to=\"/mcp\" className=\"btn btn-secondary text-sm\">MCP install</Link>
          <Link to=\"/pricing\" className=\"btn btn-ghost text-sm\">Pricing</Link>
          <Link to=\"/docs\" className=\"btn btn-ghost text-sm\">Docs</Link>
        </div>
      </div>
    </div>
  );
}
"""

p.write_text(prefix + detail + rest, encoding='utf-8')
print('Alternatives patched successfully')
