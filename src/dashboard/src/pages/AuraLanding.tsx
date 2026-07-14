import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  Search,
  Menu,
  Reply,
  Forward,
  Archive,
  Trash2,
  MoreHorizontal,
  Paperclip,
} from 'lucide-react';

// ─── SVG logo components ───

function AppleLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// ─── Shared components ───

function AppleButton({ label = 'Get Started Free', full }: { label?: string; full?: boolean }) {
  return (
    <button
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] ${
        full ? 'w-full' : ''
      }`}
    >
      <AppleLogo />
      {label}
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function SectionEyebrow({
  label,
  tag,
}: {
  label: string;
  tag?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      <span className="text-xs text-white/70 uppercase tracking-widest font-medium">
        {label}
      </span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/50 uppercase tracking-wider">
          {tag}
        </span>
      )}
    </div>
  );
}

const gradientStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
};

// ─── Navbar ───

function Navbar() {
  const links = ['Features', 'Pricing', 'Docs', 'API Reference'];
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-white">
          <LogoMark />
        </Link>

        <div className="hidden md:flex gap-8">
          {links.map((link, i) => (
            <motion.a
              key={link}
              href={link === 'Docs' ? '/docs' : link === 'API Reference' ? '/docs' : `#${link.toLowerCase()}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="text-white/70 text-sm font-medium hover:text-white transition-colors"
            >
              {link}
            </motion.a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link to="/dashboard">
            <AppleButton label="Dashboard →" />
          </Link>
        </div>
        <div className="md:hidden">
          <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Hero ───

function Hero() {
  return (
    <section className="pt-28 md:pt-36 pb-20 text-center flex flex-col items-center relative z-10 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
      >
        <div className="text-white">Your API.</div>
        <div className="animate-shiny" style={gradientStyle}>
          Revitalized
        </div>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
      >
        One endpoint for structured web data. AI agents send a URL + schema type,
        get clean JSON back. No parsing, no markdown — just the fields you need.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <Link to="/dashboard">
          <AppleButton />
        </Link>
        <span className="text-xs text-white/40">1500 free queries/month · No credit card</span>
      </motion.div>
    </section>
  );
}

// ─── macOS Menu Bar ───

function MenuBar() {
  const menuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10 relative z-10"
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <AppleLogo className="w-3.5 h-3.5 text-white/70" />
          <span className="font-bold text-white/80">AgentAPI</span>
          {menuItems.map((item, i) => (
            <span
              key={item}
              className={`text-white/50 hover:text-white/80 cursor-default ${
                i > 2 ? 'hidden sm:inline' : ''
              } ${i > 3 ? 'hidden md:inline' : ''}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-white/50">
          <Search className="w-3.5 h-3.5" />
          <span>Wed May 6 1:09 PM</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── API Playground ───

function InboxMockup() {
  const messages = [
    { name: 'POST /v1/extract', subject: '200 OK · 2.3s', preview: 'api-docs.example.com/products', time: '9:41 AM', unread: true, active: true },
    { name: 'POST /v1/extract', subject: '200 OK · 1.8s', preview: 'blog.example.com/deep-dive', time: '8:12 AM', unread: true, active: false },
    { name: 'POST /v1/extract', subject: '200 OK · 3.1s', preview: 'store.example.com/pricing', time: 'Yesterday', unread: false, active: false },
    { name: 'GET /v1/usage', subject: '200 OK · 0.2s', preview: '1,420 queries used, 80 remaining', time: 'Yesterday', unread: false, active: false },
    { name: 'POST /v1/extract', subject: '200 OK · 4.2s', preview: 'news.example.com/technology', time: 'Mon', unread: false, active: false },
    { name: 'Error', subject: '502 upstream timeout', preview: 'Retried automatically · served from cache', time: 'Mon', unread: false, active: false },
  ];

  const labels = [
    { name: 'Product', color: '#00d2ff' },
    { name: 'Article', color: '#A4F4FD' },
    { name: 'Company', color: '#f59e0b' },
    { name: 'Cache', color: '#10b981' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl"
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-4 text-xs text-white/50">API Playground</span>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 h-[520px]">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-white/5 bg-black/30 p-4 flex flex-col gap-4">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 hover:bg-white/90 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard
            </Link>

            <nav className="space-y-0.5">
              {['Requests', 'Starred', 'Failed', 'Archived'].map((item, i) => {
                const counts: Record<string, number> = { Requests: 142, Starred: 3, Failed: 0 };
                return (
                  <div
                    key={item}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-default ${
                      i === 0
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span>{item}</span>
                    {counts[item] !== undefined && (
                      <span className="text-white/40">{counts[item]}</span>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-auto">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Schemas</p>
              <div className="space-y-1.5">
                {labels.map((l) => (
                  <div key={l.name} className="flex items-center gap-2 px-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-white/60">{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request list */}
          <div className="col-span-4 border-r border-white/5 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
              <Search className="w-3 h-3 text-white/40" />
              <input
                placeholder="Search requests"
                className="bg-transparent text-xs text-white/70 placeholder:text-white/30 outline-none w-full"
              />
            </div>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`px-3 py-3 border-b border-white/5 cursor-default ${
                  msg.active ? 'bg-white/[0.03]' : ''
                } ${msg.unread ? '' : 'opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs ${msg.unread ? 'font-semibold text-white' : 'text-white/60'}`}>
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-white/40">{msg.time}</span>
                </div>
                <div className="text-xs text-white/70 mb-0.5">{msg.subject}</div>
                <div className="text-[11px] text-white/40 truncate">{msg.preview}</div>
              </div>
            ))}
          </div>

          {/* Response viewer */}
          <div className="col-span-5 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/50">
                  <Reply className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/50">
                  <Forward className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/50">
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/50">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] flex items-center justify-center text-[10px] font-bold text-white">
                  POST
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">/v1/extract</div>
                  <div className="text-[10px] text-white/40">product schema · 2.3s</div>
                </div>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/70">200</span>
              </div>

              {/* Summary by LLM */}
              <div className="liquid-glass rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: '#A4F4FD' }} />
                  <span className="text-xs font-semibold text-white/80">Extraction Result</span>
                </div>
                <p className="text-[11px] text-white/60 leading-[1.5]">
                  Extracted product "Studio Headphones Pro" at $249.99, 4.7★ rating, in stock.
                  3 color variants, 142 reviews. Server-cached: no.
                </p>
              </div>

              {/* Request */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-white/70 mb-1">Request</p>
                <pre className="bg-black/40 rounded-lg p-3 text-[11px] text-green-400/80 font-mono leading-[1.6] overflow-x-auto whitespace-pre-wrap">
{`curl -X POST /v1/extract \\
  -H "Authorization: Bearer sk-..." \\
  -d '{
    "url": "https://api-docs.example.com/products",
    "schema": "product"
  }'`}
                </pre>
              </div>

              {/* Response */}
              <div>
                <p className="text-xs font-semibold text-white/70 mb-1">Response</p>
                <pre className="bg-black/40 rounded-lg p-3 text-[11px] text-white/70 font-mono leading-[1.6] overflow-x-auto whitespace-pre-wrap">
{`{
  "success": true,
  "data": {
    "name": "Studio Headphones Pro",
    "price": 249.99,
    "currency": "USD",
    "rating": 4.7,
    "in_stock": true,
    "variants": ["Matte Black", "Silver", "Midnight"]
  },
  "usage": {
    "credits_used": 1,
    "credits_remaining": 1499
  },
  "latency_ms": 2347
}`}
                </pre>
              </div>
            </div>

            <div className="flex items-center gap-2 liquid-glass rounded-lg px-3 py-2">
              <Paperclip className="w-3 h-3 text-white/40" />
              <span className="text-xs text-white/60">response-2026-05-06.json</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features ───

const featureTiers = [
  { label: 'Schemas (3)', color: '#ffffff', items: ['Product — name, price, rating, variants', 'Article — title, author, date, topics'] },
  { label: 'Cache (auto)', color: '#e5e5e5', items: ['24h default TTL on successful extractions', 'Sub-10ms response on cache hit'] },
  { label: 'LLM Engine', color: '#a3a3a3', items: ['Gemma 4 31B IT via Google API', 'Auto-retry on malformed response'] },
  { label: 'Integrations', color: '#525252', items: ['REST API · MCP server · Node.js SDK · Python SDK'] },
];

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionEyebrow label="Capabilities" tag="API-first" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
            Extract any page
            <br />
            in a single call.
          </h2>
          <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
            Send a URL and a schema type. The LLM-powered engine reads every page,
            understands the structure, and returns validated JSON. No raw HTML,
            no markdown parsing — just the fields your agent needs.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Product', 'Article', 'Company', '24h cache', 'Auto retry', 'MCP support'].map(
              (chip) => (
                <span
                  key={chip}
                  className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="liquid-glass rounded-2xl p-5"
        >
          <p className="text-xs text-white/50 mb-4">Today · 42 pages extracted</p>
          <div className="space-y-3">
            {featureTiers.map((tier) => (
              <div key={tier.label} className="liquid-glass rounded-lg p-3">
                <p className="text-xs font-semibold mb-1.5" style={{ color: tier.color }}>
                  {tier.label}
                </p>
                <div className="space-y-0.5">
                  {tier.items.map((item) => (
                    <p key={item} className="text-[11px] text-white/50">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── LogoCloud ───

const logos = ['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion', 'Loom', 'Arc'];

function LogoCloud() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-10">
      <p className="text-xs uppercase tracking-widest text-white/40 text-center">
        Trusted by the world&apos;s most thoughtful teams
      </p>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
        {logos.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="text-sm font-semibold tracking-tight text-white/50 hover:text-white transition-colors text-center cursor-default"
          >
            {name}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ───

const testimonials = [
  {
    quote:
      'We replaced three separate scraping scripts with a single API call. The structured output eliminated all our post-processing code.',
    name: 'Engineering Lead',
    role: 'AI Infrastructure',
    company: 'MERIDIAN',
  },
  {
    quote:
      'The schema routing is what sold us. Product pages, articles, company profiles — one endpoint handles all of them correctly.',
    name: 'Senior Developer',
    role: 'Data Pipeline Team',
    company: 'CORTEX',
  },
  {
    quote:
      'Cache hits in under 10ms on our repeat queries. Monday morning pipeline failures went from weekly to zero.',
    name: 'Platform Engineer',
    role: 'ML Platform',
    company: 'STRATO',
  },
];

function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10 relative z-10">
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="liquid-glass rounded-2xl p-6"
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-white/50">{t.role}</div>
              <div className="text-xs text-white font-semibold tracking-wide uppercase mt-0.5">
                {t.company}
              </div>
            </figcaption>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing ───

const plans = [
  {
    tier: 'Free',
    price: { monthly: '0', yearly: '0' },
    desc: 'For developers testing structured extraction.',
    features: [
      'Up to 1,500 queries / month',
      'Product & article schemas',
      'Basic cache (1h TTL)',
      '1 API key',
      'REST API + MCP access',
    ],
    pro: false,
  },
  {
    tier: 'Hobby',
    price: { monthly: '29', yearly: '290' },
    desc: 'For solo builders and side projects.',
    features: [
      'Up to 5,000 queries / month',
      'All schemas (product, article, company)',
      'Smart cache (24h TTL)',
      'Usage analytics + metrics',
      'Email support',
    ],
    pro: false,
  },
  {
    tier: 'Pro',
    price: { monthly: '99', yearly: '990' },
    desc: 'For production agent workloads.',
    features: [
      'Up to 25,000 queries / month',
      'Custom schema definitions',
      'Extended cache (72h TTL)',
      'Team API keys + RBAC',
      'Priority support + SLA',
    ],
    pro: true,
  },
];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="c3-pricing-section relative z-10">
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.075" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Your API.</span>
          <span className="c3-watermark-line-2">Revitalized</span>
        </div>
      </div>

      <div className="c3-toggle-wrap">
        <span className="text-sm text-white/60">Yearly</span>
        <button
          className={`c3-toggle ${yearly ? 'active' : ''}`}
          onClick={() => setYearly(!yearly)}
        >
          <span className="c3-toggle-knob" />
        </button>
      </div>

      <div className="c3-grid">
        {plans.map((plan) => (
          <div key={plan.tier} className={`c3-card ${plan.pro ? 'c3-card-pro' : ''}`}>
            <div className="c3-tier-small">{plan.tier}</div>
            <div className="c3-tier-large">
              ${yearly ? plan.price.yearly : plan.price.monthly}
              <span className="text-sm font-normal text-white/40">
                /{yearly ? 'y' : 'mo'}
              </span>
            </div>
            <p className="c3-desc">{plan.desc}</p>
            <ul className="c3-list">
              {plan.features.map((f) => (
                <li key={f}>
                  <span className="c3-check"><CheckIcon /></span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="c3-btn">Choose Plan</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ───

function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
            Stop parsing HTML.
            <br />
            Just call the API.
          </h2>
          <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
            Join thousands of developers who ship structured data products
            instead of writing and maintaining scraping pipelines.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/dashboard">
              <AppleButton />
            </Link>
            <Link
              to="/docs"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-all"
            >
              Read the docs
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───

function Footer() {
  return (
    <footer className="border-t border-white/10 relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/40">
          <LogoMark className="w-5 h-5" />
          <span className="text-xs font-semibold tracking-wider uppercase">Agent API</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-white/40">
          <Link to="/docs" className="hover:text-white/70 transition-colors">Docs</Link>
          <Link to="/dashboard" className="hover:text-white/70 transition-colors">Dashboard</Link>
          <a href="https://github.com/ZachDreamZ/agent-api-gateway" className="hover:text-white/70 transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="text-[10px] text-white/20">© 2026 Agent API Gateway</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ───

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white selection:bg-brand-aura/30">
      {/* Fixed background video */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
      </div>

      {/* Fixed guide lines */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* SVG noise filter (root) */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      <Navbar />
      <Hero />
      <MenuBar />
      <InboxMockup />
      <Features />
      <LogoCloud />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
