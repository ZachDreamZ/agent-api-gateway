import { Link } from 'react-router-dom';
import { AmbientBg, LogoMark, SectionLabel } from '../components/Brand';

type Kind = 'privacy' | 'terms';

const COPY: Record<Kind, { title: string; updated: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: 'Privacy',
    updated: '2026-07-17',
    sections: [
      {
        h: 'What we collect',
        p: 'Account email and name (from you or GitHub OAuth), session cookies, API key metadata, usage counts, and URLs you submit for extraction. Payment is handled by Polar; we do not store card numbers.',
      },
      {
        h: 'How we use data',
        p: 'To run the product: authenticate you, meter quotas, process extractions, and send operational notices. We do not sell personal data.',
      },
      {
        h: 'Extraction content',
        p: 'Page content is fetched only when you call the API. Results may be cached for a short TTL to serve repeats. Do not submit private or non-public URLs you are not allowed to access.',
      },
      {
        h: 'Contact',
        p: 'Questions: support@agentapigw.dpdns.org',
      },
    ],
  },
  terms: {
    title: 'Terms',
    updated: '2026-07-17',
    sections: [
      {
        h: 'Service',
        p: 'Agent API Gateway provides structured extraction from public web pages via an HTTP API. Free and paid tiers apply rate limits and monthly quotas.',
      },
      {
        h: 'Acceptable use',
        p: 'You must only extract from content you have the right to access. No abuse of rate limits, no probing private networks, no malware, and no unlawful scraping. We may suspend accounts that break these rules.',
      },
      {
        h: 'Billing',
        p: 'Paid plans and the Starter pack are billed through Polar. Refunds follow Polar and applicable law. Usage beyond plan limits may be blocked until the next period or an upgrade.',
      },
      {
        h: 'Disclaimer',
        p: 'The service is provided as-is. Extraction quality depends on source pages and models. We are not liable for downstream decisions made on extracted data.',
      },
      {
        h: 'Contact',
        p: 'support@agentapigw.dpdns.org',
      },
    ],
  },
};

export default function Legal({ kind }: { kind: Kind }) {
  const doc = COPY[kind];
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 md:py-24">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm">
          <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
          <span className="font-semibold">Agent API</span>
        </Link>
        <SectionLabel>Legal</SectionLabel>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">{doc.title}</h1>
        <p className="text-xs mb-10" style={{ color: 'var(--color-text-disabled)' }}>
          Last updated {doc.updated}
        </p>
        <div className="space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{s.h}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs">
          <Link to="/" className="link-accent">Home</Link>
          {' · '}
          <Link to={kind === 'privacy' ? '/terms' : '/privacy'} className="link-accent">
            {kind === 'privacy' ? 'Terms' : 'Privacy'}
          </Link>
        </p>
      </div>
    </div>
  );
}
