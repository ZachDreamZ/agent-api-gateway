import { Link } from 'react-router-dom';

// ─── Section animation ───

function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`animate-in ${className}`}>
      {children}
    </section>
  );
}

// ─── Header ───

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface-800 bg-surface-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg leading-none">⚡</span>
          <span className="text-sm font-semibold tracking-wider uppercase">api</span>
        </Link>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-xs text-surface-500 hover:text-surface-300 uppercase tracking-wider">
            Features
          </a>
          <a href="#pricing" className="text-xs text-surface-500 hover:text-surface-300 uppercase tracking-wider">
            Pricing
          </a>
          <Link to="/docs" className="text-xs text-surface-500 hover:text-surface-300 uppercase tracking-wider">
            Docs
          </Link>
          <Link
            to="/dashboard"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-500"
          >
            Dashboard →
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─── Hero ───

function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-24">
      {/* Subtle top glow — controlled, not explosive */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-80 w-[70vw] max-w-3xl -translate-x-1/2 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />

      <div className="relative z-10 mb-10 max-w-2xl text-center">
        <p className="mb-2 text-xs text-surface-500 uppercase tracking-widest">
          API for AI agents that need web data
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          One endpoint,<br />
          <span className="text-surface-400">structured data from any URL</span>
        </h1>
      </div>

      {/* Terminal — the real hero */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Terminal window */}
        <div className="overflow-hidden rounded-lg border border-surface-800 bg-surface-950 shadow-2xl shadow-brand-900/20">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-surface-800 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[10px] text-surface-600 font-mono">~ — agent-api-gateway.onrender.com</span>
            <div className="w-10" />
          </div>
          {/* Code */}
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed sm:text-sm">
            <code className="font-mono">
              <span className="text-surface-600"># One call gets you clean data</span>
              {'\n'}
              <br />
              <span className="text-brand-400">curl</span>
              {' '}
              <span className="text-surface-300">https://agent-api-gateway.onrender.com/v1/extract</span>
              {' \\\n  '}
              <span className="text-yellow-500">-H</span>
              {' '}
              <span className="text-surface-300">"Authorization: Bearer sk-..."</span>
              {' \\\n  '}
              <span className="text-yellow-500">-d</span>
              {' '}
              <span className="text-surface-300">{`'{\n    "url": "https://example.com/product",\n    "schema": "product"\n  }'`}</span>
              {'\n\n'}
              <span className="text-surface-600">// Response</span>
              {'\n'}
              <span className="text-surface-300">{'{'}</span>
              {'\n'}
              <span className="text-blue-400">  "success"</span>
              <span className="text-surface-500">:</span>
              {' '}
              <span className="text-yellow-500">true</span>
              <span className="text-surface-500">,</span>
              {'\n'}
              <span className="text-blue-400">  "data"</span>
              <span className="text-surface-500">:</span>
              {' '}
              <span className="text-surface-300">{'{'}</span>
              {'\n'}
              <span className="text-blue-400">    "name"</span>
              <span className="text-surface-500">:</span>
              {' '}
              <span className="text-green-400">"Product Name"</span>
              <span className="text-surface-500">,</span>
              {'\n'}
              <span className="text-blue-400">    "price"</span>
              <span className="text-surface-500">:</span>
              {' '}
              <span className="text-green-400">"$29.99"</span>
              <span className="text-surface-500">,</span>
              {'\n'}
              <span className="text-blue-400">    "rating"</span>
              <span className="text-surface-500">:</span>
              {' '}
              <span className="text-accent-400">4.2</span>
              <span className="text-surface-500">,</span>
              {'\n'}
              <span className="text-blue-400">    "in_stock"</span>
              <span className="text-surface-500">:</span>
              {' '}
              <span className="text-yellow-500">true</span>
              {'\n'}
              <span className="text-surface-300">{'  }'}</span>
              {'\n'}
              <span className="text-surface-300">{'}'}</span>
            </code>
          </pre>
        </div>
      </div>

      {/* CTAs below the terminal */}
      <div className="relative z-10 mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-500"
          >
            Get Started Free
          </Link>
          <Link
            to="/docs"
            className="rounded-lg border border-surface-700 px-5 py-2.5 text-sm font-semibold text-surface-300 transition-all hover:bg-surface-800"
          >
            API Docs
          </Link>
        </div>
        <p className="text-xs text-surface-600">
          1500 free queries/month · No credit card
        </p>
      </div>
    </section>
  );
}

// ─── Features ───

const features = [
  {
    label: 'extract',
    items: ['Products', 'Articles', 'Companies'],
    note: 'Three schemas, one endpoint.',
  },
  {
    label: 'output',
    items: ['Clean JSON', 'Validated', 'Typed fields'],
    note: 'Your agent gets what it asked for.',
  },
  {
    label: 'cache',
    items: ['Sub-10ms', '24h TTL', 'Automatic'],
    note: 'Repeated calls are instant.',
  },
  {
    label: 'sdk',
    items: ['Node.js', 'Python', 'curl'],
    note: 'One line to integrate.',
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-surface-800 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs text-surface-500 uppercase tracking-widest">
              Capabilities
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Send a URL. Get JSON.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-surface-500">
              No raw HTML to parse. No markdown to clean. Just the fields your agent needs.
            </p>
          </div>
        

        <div className="grid gap-px overflow-hidden rounded-lg border border-surface-800 bg-surface-800 sm:grid-cols-2">
          {features.map((group, i) => (
            
              <div className="bg-surface-950 p-6">
                <div className="mb-3 inline-block rounded bg-brand-600/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 uppercase tracking-widest">
                  {group.label}
                </div>
                <ul className="mb-3 space-y-1">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-surface-300">
                      <span className="h-1 w-1 rounded-full bg-accent-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-surface-600">{group.note}</p>
              </div>
            
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Technical details ───

const techDetails = [
  {
    label: 'Engine',
    value: 'Gemma 4 31B IT',
    note: 'Extraction via LLM',
  },
  {
    label: 'Runtime',
    value: 'Playwright + Hono',
    note: 'Headless browser + API',
  },
  {
    label: 'Latency',
    value: '~3–6s',
    note: 'First call. Cache hits <10ms.',
  },
  {
    label: 'Stack',
    value: 'Render · Supabase · Docker',
    note: 'Deployed globally',
  },
];

function TechSpec() {
  return (
    <section className="border-t border-surface-800 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs text-surface-500 uppercase tracking-widest">
              Architecture
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
          </div>
        

        {/* Flow diagram */}
        
          <div className="mb-10 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border border-surface-800 bg-surface-900/50 px-4 py-3">
              <div className="mb-1 font-semibold text-surface-300">Agent</div>
              <div className="text-surface-600">POST /v1/extract</div>
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-4 w-8 text-surface-700" viewBox="0 0 32 16" fill="none">
                <path d="M0 8h28M22 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="rounded-lg border border-surface-800 bg-surface-900/50 px-4 py-3">
              <div className="mb-1 font-semibold text-surface-300">Playwright</div>
              <div className="text-surface-600">Scrapes page HTML</div>
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-4 w-8 text-surface-700" viewBox="0 0 32 16" fill="none">
                <path d="M0 8h28M22 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="rounded-lg border border-surface-800 bg-surface-900/50 px-4 py-3">
              <div className="mb-1 font-semibold text-surface-300">LLM</div>
              <div className="text-surface-600">Extracts structured JSON</div>
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-4 w-8 text-surface-700" viewBox="0 0 32 16" fill="none">
                <path d="M0 8h28M22 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="rounded-lg border border-surface-800 bg-surface-900/50 px-4 py-3">
              <div className="mb-1 font-semibold text-surface-300">Agent</div>
              <div className="text-surface-600">Clean JSON response</div>
            </div>
          </div>
        

        {/* Spec sheet */}
        
          <div className="overflow-hidden rounded-lg border border-surface-800">
            {techDetails.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < techDetails.length - 1 ? 'border-b border-surface-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-500 uppercase tracking-wider min-w-[60px]">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-surface-200">{row.value}</span>
                </div>
                <span className="text-xs text-surface-600">{row.note}</span>
              </div>
            ))}
          </div>
        
      </div>
    </section>
  );
}

// ─── Pricing ───

const plans = [
  {
    name: 'Free',
    price: '0',
    queries: '1,500 queries / month',
    description: 'For prototyping and small projects.',
    features: [
      'Product & article extraction',
      'Basic cache (1h TTL)',
      'Usage dashboard',
    ],
    cta: 'Get Started',
    ctaLink: '/dashboard',
    highlighted: false,
  },
  {
    name: 'Hobby',
    price: '29',
    queries: '5,000 queries / month',
    description: 'For solo builders and side projects.',
    features: [
      'All schemas (product, article, company)',
      'Smart cache (24h TTL)',
      'Usage analytics + metrics',
      'Email support',
    ],
    cta: 'Coming Soon',
    ctaLink: null,
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '99',
    queries: '25,000 queries / month',
    description: 'For production agent workloads.',
    features: [
      'All schemas + custom schemas',
      'Extended cache (72h TTL)',
      'Team API keys',
      'Priority support',
    ],
    cta: 'Coming Soon',
    ctaLink: null,
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-surface-800 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs text-surface-500 uppercase tracking-widest">
              Pricing
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start free. Scale when you need it.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-surface-500">
              1500 free queries every month, no credit card required.
            </p>
          </div>
        

        <div className="mx-auto grid max-w-lg gap-4 sm:grid-cols-3 sm:max-w-none">
          {plans.map((plan, i) => (
            
              <div
                className={`relative flex flex-col rounded-lg border p-5 ${
                  plan.highlighted
                    ? 'border-brand-600 bg-surface-950'
                    : 'border-surface-800 bg-surface-950'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-2.5 left-4 rounded bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                    Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-surface-200">{plan.name}</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="ml-1 text-xs text-surface-500">/month</span>
                  </div>
                  <p className="mt-2 text-xs text-surface-500">{plan.queries}</p>
                </div>
                <p className="mb-4 text-xs text-surface-600">{plan.description}</p>
                <ul className="mb-6 flex-1 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-surface-400">
                      <span className="text-accent-500">▸</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.ctaLink ? (
                  <Link
                    to={plan.ctaLink}
                    className={`block rounded-md py-2 text-center text-xs font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-brand-600 text-white hover:bg-brand-500'
                        : 'border border-surface-700 text-surface-300 hover:bg-surface-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-md border border-surface-800 py-2 text-xs font-semibold text-surface-600 cursor-not-allowed"
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───

function Footer() {
  return (
    <footer className="border-t border-surface-800 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">⚡</span>
          <span className="text-xs font-semibold tracking-wider uppercase">api</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-surface-600">
          <Link to="/docs" className="hover:text-surface-400 transition-colors">Docs</Link>
          <Link to="/dashboard" className="hover:text-surface-400 transition-colors">Dashboard</Link>
          <a href="https://github.com/ZachDreamZ/agent-api-gateway" className="hover:text-surface-400 transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p className="text-[10px] text-surface-700">© 2026 Agent API Gateway</p>
      </div>
    </footer>
  );
}

// ─── Page ───

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 antialiased">
      <Header />
      <Hero />
      <Features />
      <TechSpec />
      <Pricing />
      <Footer />
    </div>
  );
}
