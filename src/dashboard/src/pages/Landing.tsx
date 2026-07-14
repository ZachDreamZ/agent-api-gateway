import { Link } from 'react-router-dom';

// ─── Components ───

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface-800 bg-surface-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-sm font-semibold tracking-tight">AgentAPI</span>
        </Link>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-sm text-surface-400 hover:text-surface-200">
            Features
          </a>
          <a href="#pricing" className="text-sm text-surface-400 hover:text-surface-200">
            Pricing
          </a>
          <Link to="/docs" className="text-sm text-surface-400 hover:text-surface-200">
            Docs
          </Link>
          <Link
            to="/dashboard"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-20 text-center">
      {/* Gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />

      <div className="relative z-10 max-w-3xl">
        <div className="mb-4 inline-block rounded-full border border-brand-600/30 bg-brand-600/10 px-4 py-1 text-xs font-medium text-brand-400">
          Structured web data for AI agents
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          One API for agents to{' '}
          <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            read the web
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-surface-400">
          Send a URL + schema type, get clean structured JSON. No markdown parsing, no raw HTML —
          just the fields your agent needs.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Get Started Free
          </Link>
          <Link
            to="/docs"
            className="rounded-lg border border-surface-700 px-6 py-3 text-sm font-semibold text-surface-200 transition-colors hover:bg-surface-800"
          >
            Read the Docs
          </Link>
        </div>
        <p className="mt-4 text-xs text-surface-500">No credit card required. 1500 free queries/month.</p>
      </div>

      {/* Terminal preview */}
      <div className="relative z-10 mt-12 w-full max-w-2xl">
        <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-950 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-surface-800 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-surface-500">curl — agent-api-gateway.onrender.com</span>
          </div>
          <pre className="overflow-x-auto p-4 text-left text-sm leading-relaxed">
            <code>
              <span className="text-surface-500"># Extract product data from any URL</span>
              {'\n'}
              <span className="text-green-400">curl</span>
              {' '}
              <span className="text-brand-400">https://agent-api-gateway.onrender.com/v1/extract</span>
              {' \\\n  '}
              <span className="text-yellow-400">-H</span>
              {' '}
              <span className="text-surface-200">"Authorization: Bearer sk-..."</span>
              {' \\\n  '}
              <span className="text-yellow-400">-d</span>
              {' '}
              <span className="text-surface-200">{'{"url":"https://...","schema":"product"}'}</span>
              {'\n\n'}
              <span className="text-surface-500">// Response</span>
              {'\n'}
              <span className="text-blue-400">{'{'}</span>
              {'\n'}
              <span className="text-blue-400">  "success"</span>
              <span className="text-surface-400">:</span>
              {' '}
              <span className="text-yellow-400">true</span>
              <span className="text-surface-400">,</span>
              {'\n'}
              <span className="text-blue-400">  "data"</span>
              <span className="text-surface-400">:</span>
              {' '}
              <span className="text-blue-400">{'{'}</span>
              {'\n'}
              <span className="text-blue-400">    "name"</span>
              <span className="text-surface-400">:</span>
              {' '}
              <span className="text-green-400">"Product Name"</span>
              <span className="text-surface-400">,</span>
              {'\n'}
              <span className="text-blue-400">    "price"</span>
              <span className="text-surface-400">:</span>
              {' '}
              <span className="text-green-400">"$29.99"</span>
              <span className="text-surface-400">,</span>
              {'\n'}
              <span className="text-blue-400">    "currency"</span>
              <span className="text-surface-400">:</span>
              {' '}
              <span className="text-green-400">"USD"</span>
              {'\n'}
              <span className="text-blue-400">{'  }'}</span>
              {'\n'}
              <span className="text-blue-400">{'}'}</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: '🧩',
      title: 'Multiple Schemas',
      desc: 'Extract products, articles, companies — one endpoint for all common data shapes.',
    },
    {
      icon: '⚡',
      title: 'Built for Agents',
      desc: 'Clean JSON output that LLMs understand. No markdown to parse, no HTML to clean.',
    },
    {
      icon: '🔌',
      title: 'SDK Ready',
      desc: 'Node.js and Python SDKs so your agent calls us in one line of code.',
    },
    {
      icon: '🔄',
      title: 'Smart Caching',
      desc: 'Repeated requests hit cache. Your agent gets sub-10ms responses on cache hits.',
    },
    {
      icon: '🎯',
      title: 'Precise Extraction',
      desc: 'Powered by Gemma 4 31B IT. Fields are validated and typed before you get them.',
    },
    {
      icon: '📊',
      title: 'Usage Analytics',
      desc: 'Dashboard shows every query, latency, cache rate, and credit usage in real time.',
    },
  ];

  return (
    <section id="features" className="border-t border-surface-800 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
          Stop parsing HTML. Just ask.
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-surface-400">
          Every AI agent needs web data. We make it a single API call.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-surface-800 bg-surface-900/50 p-6 transition-colors hover:border-surface-700"
            >
              <span className="mb-3 block text-2xl">{f.icon}</span>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-surface-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      queries: '1,500 / mo',
      features: [
        'Product & article extraction',
        'Basic caching',
        'Usage dashboard',
        'Standard support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Hobby',
      price: '$19',
      queries: '20,000 / mo',
      features: [
        'All schemas (incl. company)',
        'Smart caching (24h TTL)',
        'Usage analytics',
        'Email support',
      ],
      cta: 'Coming Soon',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '$79',
      queries: '100,000 / mo',
      features: [
        'All schemas + custom',
        'Long cache (72h TTL)',
        'Team API keys',
        'Priority support',
      ],
      cta: 'Coming Soon',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-surface-800 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
          Simple pricing
        </h2>
        <p className="mx-auto mb-12 max-w-md text-center text-surface-400">
          Start free. Scale when you need more.
        </p>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 ${
                plan.highlighted
                  ? 'border-brand-600 bg-brand-600/5'
                  : 'border-surface-800 bg-surface-900/50'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </div>
              )}
              <h3 className="mb-1 text-lg font-semibold">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-surface-500">/mo</span>
              </div>
              <p className="mb-4 text-sm text-surface-400">{plan.queries}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-surface-300">
                    <span className="text-brand-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={plan.cta === 'Coming Soon'}
                className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-brand-600 text-white hover:bg-brand-500'
                    : 'border border-surface-700 text-surface-200 hover:bg-surface-800'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-800 px-6 py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-semibold">AgentAPI</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-surface-500">
          <Link to="/docs" className="hover:text-surface-300">Docs</Link>
          <Link to="/dashboard" className="hover:text-surface-300">Dashboard</Link>
          <a href="https://github.com/ZachDreamZ/agent-api-gateway" className="hover:text-surface-300">GitHub</a>
        </div>
        <p className="text-xs text-surface-600">© 2026 AgentAPI</p>
      </div>
    </footer>
  );
}

// ─── Landing Page ───

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
