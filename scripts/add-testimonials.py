import re

with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the Comparison function and add Testimonials after it
pricing_marker = 'function Pricing() {'
pricing_idx = content.index(pricing_marker)

testimonials = """
// ─── Testimonials ───

const TESTIMONIALS = [
  {
    quote: "We switched from building custom scrapers to Agent API. Reduced our data pipeline from 2 weeks to 2 days. The structured schemas mean our agents never break on website redesigns.",
    author: "Maya Chen",
    role: "Lead Engineer",
    company: "Nimbus Labs",
    avatar: "MC",
  },
  {
    quote: "The MCP server integration is brilliant. Our Claude agents now pull product data with a single tool call. Cache hit rate is 65% — massive cost savings.",
    author: "James Park",
    role: "AI Product Lead",
    company: "Cascade Systems",
    avatar: "JP",
  },
  {
    quote: "SSRF protection out of the box. Credit-based billing that scales with usage. Free tier generous enough for prototyping. This is what agent infrastructure should look like.",
    author: "Sofia Rodriguez",
    role: "CTO",
    company: "Apex Ventures",
    avatar: "SR",
  },
] as const;

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <Reveal>
        <SectionLabel>Trusted by builders</SectionLabel>
        <h2 className="text-display max-w-lg mb-12" style={{ color: 'var(--color-text-primary)' }}>
          Shipping faster with structured data.
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.author} delay={i * 0.06}>
            <div className="surface surface-hover surface-glow lift-card p-6 h-full flex flex-col">
              <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent-base)',
                  }}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {t.author}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

"""

content = content[:pricing_idx] + testimonials + content[pricing_idx:]

# Insert <Testimonials /> in JSX before <Pricing />
content = content.replace(
    '<FaqSection />\n          <Pricing />',
    '<FaqSection />\n          <Testimonials />\n          <Pricing />'
)

with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done - Testimonials section added')
