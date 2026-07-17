import { Link } from 'react-router-dom';
import { AmbientBg, LogoMark, SectionLabel } from '../components/Brand';

export type LegalKind = 'privacy' | 'terms' | 'aup';

const COPY: Record<
  LegalKind,
  { title: string; updated: string; sections: { h: string; p: string }[] }
> = {
  privacy: {
    title: 'Privacy Policy',
    updated: '2026-07-17',
    sections: [
      {
        h: 'Who we are',
        p: 'Agent API Gateway ("Agent API", "we") provides a hosted HTTP API and MCP tools for extracting structured fields from public web pages. Contact: support@agentapigw.dpdns.org.',
      },
      {
        h: 'Data we collect',
        p: 'Account data (email, name, optional GitHub or Google profile identifiers), authentication sessions, API key metadata (name, prefix, last used), billing tier and Polar customer references, usage counters, and URLs you submit for extraction. We do not store payment card numbers; Polar processes payments.',
      },
      {
        h: 'How we use data',
        p: 'To authenticate you, enforce quotas and rate limits, run extractions, cache successful results for a short TTL, send transactional mail (verification, password reset), prevent abuse, and improve reliability. We do not sell personal data.',
      },
      {
        h: 'Extraction and cache',
        p: 'When you call the API or MCP tools, we fetch the public page you specify, process it with our extraction pipeline, and may cache the structured result. Do not submit private, internal, or non-public URLs. Cached entries expire by TTL and are not used as a public search index.',
      },
      {
        h: 'Cookies and sessions',
        p: 'We use secure HTTP-only session cookies for the dashboard. API access uses bearer keys you create. You can revoke keys and sign out at any time.',
      },
      {
        h: 'Processors',
        p: 'Infrastructure may include hosting (e.g. Render), database providers, Polar (billing), Resend (email when configured), and LLM providers used only to structure page content you request. They process data under their terms as sub-processors for providing the service.',
      },
      {
        h: 'Retention',
        p: 'Account and usage records are kept while your account is active and for a reasonable period afterward for billing, security, and legal obligations. You may request deletion of your account by contacting support.',
      },
      {
        h: 'Security',
        p: 'We use TLS in production, hashed passwords, signed sessions, rate limits, SSRF guards on extract URLs, and secret management via environment variables. No method of transmission is perfectly secure; report issues to support@agentapigw.dpdns.org.',
      },
      {
        h: 'Your rights',
        p: 'Depending on your location, you may have rights to access, correct, export, or delete personal data. Email support with your account address to exercise these rights.',
      },
      {
        h: 'Changes',
        p: 'We may update this policy. Material changes will be reflected by the "Last updated" date on this page.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: '2026-07-17',
    sections: [
      {
        h: 'Agreement',
        p: 'By creating an account, calling the API, using the MCP server, or purchasing a plan, you agree to these Terms of Service and the Acceptable Use Policy. If you use the service for an organization, you represent that you have authority to bind that organization.',
      },
      {
        h: 'The service',
        p: 'Agent API Gateway offers structured extraction from public web pages via REST (POST /v1/extract and related endpoints) and an optional MCP stdio server. Features, quotas, and pricing may change; the dashboard and pricing page describe current plans.',
      },
      {
        h: 'Accounts and keys',
        p: 'You are responsible for credentials (passwords, API keys, OAuth access). Keep keys secret. You must not share keys in public repositories or client-side code. We may revoke keys that appear compromised or abusive.',
      },
      {
        h: 'Email verification',
        p: 'Email/password accounts must verify their email before using the dashboard session. GitHub and Google OAuth accounts rely on the provider identity. You agree to keep contact email accurate.',
      },
      {
        h: 'Billing',
        p: 'Paid plans and one-time packs are sold through Polar. Fees are as listed at purchase. Taxes may apply. Refunds follow Polar policy and applicable law. Unused free credits do not convert to cash.',
      },
      {
        h: 'Acceptable use',
        p: 'You must comply with the Acceptable Use Policy at /aup. We may suspend or terminate access for violations, including abuse of rate limits, targeting private networks, or unlawful content access.',
      },
      {
        h: 'Intellectual property',
        p: 'We own the service software and branding. You retain rights to your account data and to content you lawfully extract under the licenses of the source sites. You grant us a limited license to process submitted URLs solely to provide the service.',
      },
      {
        h: 'Disclaimer',
        p: 'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Extraction quality depends on source pages and models and may be incomplete or incorrect.',
      },
      {
        h: 'Limitation of liability',
        p: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR CLAIMS RELATING TO THE SERVICE IS LIMITED TO THE AMOUNTS YOU PAID US IN THE THREE MONTHS BEFORE THE CLAIM.',
      },
      {
        h: 'Termination',
        p: 'You may stop using the service at any time. We may suspend or terminate accounts that violate these terms, create risk, or fail to pay. Provisions that should survive (liability, IP, billing disputes) continue after termination.',
      },
      {
        h: 'Contact',
        p: 'support@agentapigw.dpdns.org · https://agentapigw.dpdns.org',
      },
    ],
  },
  aup: {
    title: 'Acceptable Use Policy',
    updated: '2026-07-17',
    sections: [
      {
        h: 'Purpose',
        p: 'This Acceptable Use Policy (AUP) describes prohibited uses of Agent API Gateway, including the REST API, dashboard, webhooks, and MCP tools. It is part of our Terms of Service.',
      },
      {
        h: 'Allowed use',
        p: 'You may extract structured data from public web pages you are legally allowed to access, for lawful purposes such as building agents, research, price monitoring you own, or content workflows, subject to each site’s terms and robots rules where applicable.',
      },
      {
        h: 'Prohibited: unauthorized access',
        p: 'Do not use the service to access private networks, localhost, cloud metadata endpoints, authenticated-only resources, or any system without authorization. Our SSRF protections block many private targets; attempting to bypass them is forbidden.',
      },
      {
        h: 'Prohibited: abuse and attacks',
        p: 'No DDoS, credential stuffing, brute force, malware distribution, phishing, spam, or attempts to disrupt the service or third parties. No automated account creation for fraud.',
      },
      {
        h: 'Prohibited: quota and key abuse',
        p: 'Do not share API keys publicly, resell access without written permission, or evade rate limits and quotas. Do not use another customer’s key.',
      },
      {
        h: 'Prohibited: illegal content',
        p: 'Do not use the service for child sexual abuse material, terrorism facilitation, trafficking, or other illegal activity. Do not process personal data in violation of privacy laws.',
      },
      {
        h: 'Payment abuse',
        p: 'Do not use stolen payment instruments or dispute legitimate charges in bad faith. We may cancel accounts involved in payment fraud.',
      },
      {
        h: 'Enforcement',
        p: 'We may investigate, rate-limit, suspend, or terminate accounts, revoke keys, and report illegal activity to authorities. Contact support@agentapigw.dpdns.org to appeal or report abuse.',
      },
    ],
  },
};

const NAV: { kind: LegalKind; label: string; path: string }[] = [
  { kind: 'privacy', label: 'Privacy', path: '/privacy' },
  { kind: 'terms', label: 'Terms', path: '/terms' },
  { kind: 'aup', label: 'Acceptable use', path: '/aup' },
];

export default function Legal({ kind }: { kind: LegalKind }) {
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
        <p className="text-xs mb-6" style={{ color: 'var(--color-text-disabled)' }}>
          Last updated {doc.updated}
        </p>

        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Legal documents">
          {NAV.map((n) => (
            <Link
              key={n.path}
              to={n.path}
              className="text-xs rounded-full px-3 py-1"
              style={{
                background: n.kind === kind ? 'var(--color-accent-subtle)' : 'var(--color-bg-surface)',
                color: n.kind === kind ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {s.h}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {s.p}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
          <Link to="/" className="link-accent">
            Home
          </Link>
          {' · '}
          <Link to="/docs" className="link-accent">
            Docs
          </Link>
          {' · '}
          <a href="mailto:support@agentapigw.dpdns.org" className="link-accent">
            Support
          </a>
        </p>
      </div>
    </div>
  );
}
