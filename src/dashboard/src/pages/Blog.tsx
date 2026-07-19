import { Link } from 'react-router-dom';
import { BrandLockup, AmbientBg, SectionLabel } from '../components/Brand';
import { BookOpen, Calendar, Clock } from 'lucide-react';

const POSTS = [
  {
    slug: 'structured-data-for-ai-agents',
    title: 'Why AI agents need structured data, not HTML',
    excerpt: 'Raw HTML parsing is brittle and expensive. Here\'s how structured extraction APIs solve the reliability problem for agent tool-calling.',
    date: '2026-07-15',
    readTime: '4 min',
    tags: ['agents', 'architecture'],
  },
  {
    slug: 'ssrf-protection-for-extraction-apis',
    title: 'SSRF protection for web extraction APIs',
    excerpt: 'How we block private hosts, metadata endpoints, and credentialed URLs at every layer of the extraction pipeline.',
    date: '2026-07-10',
    readTime: '5 min',
    tags: ['security', 'engineering'],
  },
  {
    slug: 'choosing-extraction-schema',
    title: 'Choosing the right extraction schema: product, article, or company',
    excerpt: 'A guide to the three built-in schemas and when to use each one for your agent workflows.',
    date: '2026-07-05',
    readTime: '3 min',
    tags: ['guides', 'schema'],
  },
];

function Blog() {
  return (
    <div
      className="landing-shell relative min-h-screen"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <AmbientBg intensity="strong" />
      <div className="landing-mesh" aria-hidden />
      <div className="relative z-10">
        <header className="nav-float">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <BrandLockup variant="product" showOrgSubline to="/" />
            <Link to="/docs" className="link text-sm">Docs</Link>
          </nav>
        </header>

        <main className="mx-auto max-w-3xl px-5 md:px-6 pt-32 pb-20">
          <SectionLabel>Blog</SectionLabel>
          <h1 className="text-display mt-4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Engineering & updates
          </h1>
          <p className="text-sm mb-12 max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Building structured data extraction for AI agents — architecture, security, and product updates.
          </p>

          <div className="flex flex-col gap-6">
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="surface surface-hover lift-card p-6"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <div className="flex gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: 'var(--color-accent-subtle)',
                            color: 'var(--color-accent-base)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <BookOpen className="w-3 h-3 inline mr-1" />
              More posts coming soon.
            </p>
          </div>
        </main>

        <footer
          className="relative z-10"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <div className="mx-auto max-w-6xl px-5 md:px-6 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <Link to="/" className="link">Home</Link>
            <span className="mx-3">·</span>
            <Link to="/docs" className="link">Docs</Link>
            <span className="mx-3">·</span>
            <span>© {new Date().getFullYear()} NexusCore</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Blog;
