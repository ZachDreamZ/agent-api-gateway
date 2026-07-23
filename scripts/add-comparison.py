import re

with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert Comparison component before SDKSection function
sdk_marker = 'function SDKSection() {'
sdk_idx = content.index(sdk_marker)

comparison = """
// \u2500\u2500\u2500 Comparison Table \u2500\u2500\u2500

const COMPARISON_ROWS = [
  { feature: 'Typed JSON output', us: true, generic: false, custom: 'Varies' },
  { feature: 'Built-in schemas (product, article, company)', us: true, generic: false, custom: false },
  { feature: 'Schema validation before return', us: true, generic: false, custom: false },
  { feature: 'SSRF protection', us: true, generic: 'Partial', custom: false },
  { feature: 'MCP server for agent tool-calling', us: true, generic: false, custom: false },
  { feature: 'Credit packs (no subscription required)', us: true, generic: false, custom: false },
  { feature: 'Free tier (100 queries/mo)', us: true, generic: false, custom: false },
  { feature: 'Cache with TTL', us: true, generic: true, custom: 'Build yourself' },
  { feature: '24/7 managed infrastructure', us: true, generic: true, custom: false },
] as const;

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} strokeWidth={2.5} />;
  if (value === false) return <X className="w-4 h-4" style={{ color: 'var(--color-text-disabled)' }} strokeWidth={2} />;
  return <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{value}</span>;
}

function Comparison() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Why Agent API</SectionLabel>
        <h2 className="text-display max-w-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Structured extraction, not another scraper.
        </h2>
        <p className="text-sm mb-10 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          Generic scraping APIs return raw HTML. Agent API returns typed, validated JSON \u2014 purpose-built for agents.
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="overflow-x-auto surface surface-glow rounded-xl">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className="px-5 py-3.5 text-left text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Feature</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold" style={{ color: 'var(--color-accent-base)' }}>
                  <span className="flex items-center justify-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" /> Agent API
                  </span>
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Generic scraping APIs</th>
                <th className="px-5 py-3.5 text-center text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Custom scraper</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{row.feature}</td>
                  <td className="px-5 py-3 text-center"><ComparisonCell value={row.us} /></td>
                  <td className="px-5 py-3 text-center"><ComparisonCell value={row.generic} /></td>
                  <td className="px-5 py-3 text-center"><ComparisonCell value={row.custom} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}

"""

content = content[:sdk_idx] + comparison + content[sdk_idx:]

# 2. Insert <Comparison /> in JSX after <Features />
content = content.replace(
    '<Features />\n          <SDKSection />',
    '<Features />\n          <Comparison />\n          <SDKSection />'
)

with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done - Comparison section added')
