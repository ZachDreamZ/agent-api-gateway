import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Bot,
  Check,
  Copy,
  ExternalLink,
  Code2,
  KeyRound,
  Package,
  Shield,
  Terminal,
  Wrench,
  Play,
} from 'lucide-react';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';
import { easeOut } from '../lib/motion';
import { LiveExtractDemo } from '../components/LiveExtractDemo';

const NPM_URL = 'https://www.npmjs.com/package/agent-api-gateway-mcp';
const GITHUB_URL = 'https://github.com/ZachDreamZ/agent-api-gateway-mcp';
const REGISTRY_URL =
  'https://registry.modelcontextprotocol.io/v0/servers?search=io.github.ZachDreamZ%2Fagent-api-gateway';
const REGISTRY_NAME = 'io.github.ZachDreamZ/agent-api-gateway';
const NPX_CMD = 'npx -y agent-api-gateway-mcp';
const GLOBAL_INSTALL = 'npm i -g agent-api-gateway-mcp';
const API_BASE = 'https://agentapigw.dpdns.org/v1';

const MCP_CONFIG = {
  command: 'npx',
  args: ['-y', 'agent-api-gateway-mcp'],
  env: {
    AGENT_API_KEY: 'sk-your-api-key',
    API_BASE_URL: API_BASE,
  },
} as const;

const CURSOR_DEEPLINK =
  'cursor://anysphere.cursor-deeplink/mcp/install?name=agent-api-gateway&config=' +
  btoa(JSON.stringify(MCP_CONFIG));

const CLIENT_CONFIG = `{
  "mcpServers": {
    "agent-api-gateway": {
      "command": "npx",
      "args": ["-y", "agent-api-gateway-mcp"],
      "env": {
        "AGENT_API_KEY": "sk-your-api-key",
        "API_BASE_URL": "https://agentapigw.dpdns.org/v1"
      }
    }
  }
}`;

const TOOLS = [
  { name: 'extract', desc: 'URL + schema (`product` | `article` | `company`)' },
  { name: 'extract_product', desc: 'Product fields only' },
  { name: 'extract_article', desc: 'Article fields only' },
  { name: 'extract_company', desc: 'Company fields only' },
  { name: 'list_schemas', desc: 'Schema catalog' },
  { name: 'get_usage', desc: 'Credits and plan for the current key' },
] as const;

const DIRECT_LINKS = [
  {
    label: 'npm package',
    href: NPM_URL,
    icon: Package,
    meta: 'agent-api-gateway-mcp',
    external: true,
  },
  {
    label: 'GitHub source',
    href: GITHUB_URL,
    icon: Code2,
    meta: 'ZachDreamZ/agent-api-gateway-mcp',
    external: true,
  },
  {
    label: 'MCP Registry',
    href: REGISTRY_URL,
    icon: Bot,
    meta: REGISTRY_NAME,
    external: true,
  },
  {
    label: 'Get API key',
    href: '/login',
    icon: KeyRound,
    meta: 'Required for tool calls',
    external: false,
  },
] as const;

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; ignore quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn ${copied ? 'btn-primary' : 'btn-ghost'} text-xs`}
      style={{ padding: '0.35rem 0.65rem', gap: '0.3rem' }}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="overflow-hidden rounded-xl code-block">
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          {lang}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code style={{ color: 'var(--color-text-secondary)' }}>{code}</code>
      </pre>
    </div>
  );
}

export default function Mcp() {
  useSEO({
    title: 'MCP Server',
    description:
      'Install Agent API Gateway MCP for Cursor, Claude Desktop, and VS Code. One-click Cursor install, npm package, and official registry links.',
    keywords: 'MCP, Model Context Protocol, Cursor MCP, Claude Desktop MCP, agent-api-gateway-mcp, AI agents',
    canonical: 'https://agentapigw.dpdns.org/mcp',
  });

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <BrandLockup variant="product" showOrgSubline to="/" />
          <div className="flex flex-wrap gap-2">
            <Link to="/docs#mcp" className="btn btn-ghost text-xs">
              Docs
            </Link>
            <Link to="/login" className="btn btn-secondary text-xs">
              Get API key
            </Link>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mb-10"
        >
          <SectionLabel>Model Context Protocol</SectionLabel>
          <h1 className="text-display-sm mb-3 max-w-3xl" style={{ color: 'var(--color-text-primary)' }}>
            Install Agent API Gateway as an MCP tool
          </h1>
          <p className="text-body mb-6 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
            Give Claude, Cursor, and other MCP hosts direct access to structured extraction. This is a
            local stdio server via npm — no remote MCP endpoint required.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href={CURSOR_DEEPLINK} className="btn btn-primary text-sm">
              <Bot className="w-4 h-4" />
              Add to Cursor
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={NPM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-sm"
            >
              <Package className="w-4 h-4" />
              npm package
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              <Code2 className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </motion.section>

        <section className="mb-10 grid gap-3 sm:grid-cols-2">
          {DIRECT_LINKS.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <div className="rounded-lg p-2 shrink-0" style={{ background: 'var(--color-accent-subtle)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-caption mt-0.5 truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                    {item.meta}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
              </>
            );

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface p-4 flex items-center gap-3 interactive"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.label} to={item.href} className="surface p-4 flex items-center gap-3 interactive">
                {content}
              </Link>
            );
          })}
        </section>

        <section className="mb-10 surface-elevated p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} />
            <h2 className="text-title">Quick install</h2>
          </div>
          <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Run the published package with your API key. Replace the placeholder key from the dashboard.
          </p>
          <div className="space-y-3">
            <CodeBlock code={NPX_CMD} lang="bash" />
            <CodeBlock code={GLOBAL_INSTALL} lang="bash" />
            <CodeBlock
              code={`export AGENT_API_KEY=sk-your-api-key\nexport API_BASE_URL=${API_BASE}\n${NPX_CMD}`}
              lang="bash"
            />
          </div>
        </section>

        <section className="mb-10 surface-elevated p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Play className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} />
            <h2 className="text-title">Try in playground</h2>
          </div>
          <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Test extraction instantly � no install needed. Paste a public product URL and hit Extract.
            Uses your API key if you are signed in, otherwise runs on the free tier (500 queries/month).
          </p>
          <LiveExtractDemo schema="product" defaultUrl="https://www.example.com/product/demo" />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} />
            <h2 className="text-title">Claude Desktop / Cursor config</h2>
          </div>
          <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Paste this into your MCP host config, then swap in a real key from{' '}
            <Link to="/dashboard/api-keys" className="link-accent">
              Dashboard → API Keys
            </Link>
            .
          </p>
          <CodeBlock code={CLIENT_CONFIG} lang="json" />
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={CURSOR_DEEPLINK} className="btn btn-secondary text-xs">
              Open Cursor install link
            </a>
            <CopyButton text={CURSOR_DEEPLINK} label="Copy Cursor deeplink" />
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} />
            <h2 className="text-title">Tools</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((tool) => (
                  <tr key={tool.name}>
                    <td>
                      <code className="code-inline" style={{ color: 'var(--color-accent-base)' }}>
                        {tool.name}
                      </code>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{tool.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-2">
          <div className="surface p-5">
            <h3 className="text-heading mb-2">Registry name</h3>
            <p className="text-caption mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Official MCP Registry identifier
            </p>
            <code className="code-inline break-all" style={{ color: 'var(--color-accent-base)' }}>
              {REGISTRY_NAME}
            </code>
            <div className="mt-4">
              <a
                href={REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost text-xs"
              >
                Search registry
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div
            className="surface p-5"
            style={{ borderColor: 'oklch(0.74 0.12 195 / 0.28)' }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: 'var(--color-accent-base)' }} />
              <h3 className="text-heading">Security</h3>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li>Store keys in env vars or host secret stores</li>
              <li>Never commit live keys to git or public configs</li>
              <li>Public URLs only — private/local targets are blocked</li>
              <li>
                See the <Link to="/aup" className="link-accent">Acceptable Use Policy</Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="surface surface-glow p-6 md:p-8 text-center">
          <h2 className="text-title mb-2">Need a key first?</h2>
          <p className="text-body mb-5 max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Create a free account, mint an API key, then drop it into the MCP config above.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="btn btn-primary text-sm">
              <KeyRound className="w-4 h-4" />
              Get API key
            </Link>
            <Link to="/docs#mcp" className="btn btn-secondary text-sm">
              Full docs
            </Link>
            <Link to="/agents" className="btn btn-ghost text-sm">
              For agents
            </Link>
          </div>
        </section>

        <p className="mt-10 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
          <Link to="/" className="link-accent">
            Home
          </Link>
          {' · '}
          <Link to="/docs" className="link-accent">
            Docs
          </Link>
          {' · '}
          <a href={NPM_URL} className="link-accent" target="_blank" rel="noopener noreferrer">
            npm
          </a>
          {' · '}
          <a href={GITHUB_URL} className="link-accent" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {' · '}
          support@agentapigw.dpdns.org
        </p>
      </div>
    </div>
  );
}
