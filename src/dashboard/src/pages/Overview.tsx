import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { Zap, Activity, Clock, KeyRound, TrendingUp, TrendingDown, BookOpen, ArrowRight } from 'lucide-react';
import { PageHeader, Stagger, StaggerItem } from '../components/Brand';
import { easeOut } from '../lib/motion';

// ─── Types ───

interface UsageStats {
  total_queries: number;
  queries_today: number;
  queries_today_delta: number;
  queries_this_month: number;
  credits_used: number;
  credits_remaining: number;
  credits_limit: number;
  bonus_credits: number;
  cache_hit_rate: number;
  avg_latency_ms: number;
  active_keys: number;
  recent_errors: number;
  tier: string;
}

interface ApiUsageResponse {
  tier: string;
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
  bonus_credits?: number;
  monthly_limit?: number;
  period_start: string;
}

interface DailyUsage {
  date: string;
  count: number;
}

interface RecentItem {
  id: string;
  endpoint: string;
  schema: string | null;
  url: string;
  cached: boolean;
  latency_ms: number | null;
  credits_used: number;
  created_at: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Animated Counter ───

function AnimatedNumber({ value: raw }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(raw);
  const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);

  useEffect(() => {
    if (!inView || isNaN(num)) {
      setDisplay(raw);
      return;
    }
    const from = 0;
    const duration = 800;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress);
      const current = Math.round(from + (num - from) * eased);
      setDisplay(current.toLocaleString());
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, num, raw]);

  return <span className="stat-card-value">{display}</span>;
}

// ─── Stat Card ───

function StatCard({
  label,
  value,
  sub,
  trend,
  trendValue,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <motion.div
        className="stat-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="skeleton mb-3" style={{ width: '6rem', height: '0.75rem' }} />
        <div className="skeleton mb-2" style={{ width: '8rem', height: '2rem' }} />
        <div className="skeleton" style={{ width: '5rem', height: '0.75rem' }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="stat-card surface-hover surface-glow"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
    >
      <div className="stat-card-label">{label}</div>
      <div className="flex items-end gap-2">
        <AnimatedNumber value={value} />
        {trend && trendValue && (
          <span
            className="mb-1 flex items-center gap-0.5 text-xs font-medium"
            style={{
              color: trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-error)' : 'var(--color-text-tertiary)',
            }}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {trendValue}
          </span>
        )}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </motion.div>
  );
}

// ─── Usage Progress Bar ───

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isHigh = pct > 80;

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-card-label">Monthly Usage</span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={isHigh ? 'progress-fill progress-fill-warning' : 'progress-fill'}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{Math.round(pct)}% used</span>
        <span
          className="text-xs font-medium"
          style={{ color: isHigh ? 'var(--color-warning)' : 'var(--color-success)' }}
        >
          {isHigh ? 'Approaching limit' : 'On track'}
        </span>
      </div>
    </div>
  );
}

// ─── Usage Chart ───

function RecentRequests({ items }: { items: RecentItem[] }) {
  return (
    <div className="surface surface-hover surface-glow p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-syne text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Recent requests
        </h3>
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-disabled)' }}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          No requests yet. Fire your first extraction from the docs to see it here.
        </p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-auto">
          {items.map((r) => {
            let host = r.url;
            try {
              host = new URL(r.url).host;
            } catch {
              /* keep raw */
            }
            return (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 text-xs border-b pb-2"
                style={{ borderColor: 'var(--color-border-default)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <code
                      className="truncate"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-mono)' }}
                    >
                      {host}
                    </code>
                    {r.schema && (
                      <span
                        className="px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
                      >
                        {r.schema}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5" style={{ color: 'var(--color-text-disabled)' }}>
                    {r.latency_ms != null ? `${r.latency_ms}ms` : '—'}
                    {r.cached ? ' · cached' : ''} · {relativeTime(r.created_at)}
                  </div>
                </div>
                <span
                  className="shrink-0 font-mono"
                  style={{ color: r.cached ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
                >
                  {r.credits_used} cr
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function UsageChart({ data }: { data: DailyUsage[] }) {
  if (data.length === 0) {
    return (
      <div className="stat-card">
        <div className="flex flex-col items-center py-6 text-center">
          <Activity className="w-8 h-8 mb-3" style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No usage data yet</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Start making API calls to see your usage chart</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Last 7 Days</h3>
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
          {data.reduce((sum, d) => sum + d.count, 0).toLocaleString()} total
        </span>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 'clamp(80px, 20vw, 140px)' }}>
        {data.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium" style={{ color: 'transparent' }}>
                {d.count}
              </span>
              <div className="chart-bar" style={{ height: `${Math.max(pct, 4)}%` }} />
              <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── First-run onboarding (real path, no fake activity) ───

function CreditPacksMini() {
  const packs = [
    { sku: 'credits_1k', label: '1k', price: '$1' },
    { sku: 'credits_5k', label: '5k', price: '$4' },
    { sku: 'credits_25k', label: '25k', price: '$15' },
  ];
  return (
    <div className="stat-card space-y-3">
      <div>
        <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Credit packs
        </h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
          One-time top-ups that stack on free or any subscription. Never expire until used.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {packs.map((p) => (
          <a
            key={p.sku}
            href={`/buy?sku=${p.sku}`}
            className="btn btn-secondary text-xs flex flex-col items-center gap-0.5 py-2 h-auto"
          >
            <span className="font-semibold tabular-nums">{p.price}</span>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.65rem' }}>{p.label} credits</span>
          </a>
        ))}
      </div>
      <Link to="/dashboard/billing" className="btn btn-primary w-full text-xs">
        All plans & credits
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function OnboardingCard({ hasUsage }: { hasUsage: boolean }) {
  if (hasUsage) {
    return (
      <div className="space-y-4">
        <CreditPacksMini />
        <div className="stat-card space-y-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Next steps
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
            Wire the MCP server for Claude/Cursor, or upgrade your monthly plan under Billing.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/docs#mcp" className="btn btn-secondary w-full text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              MCP setup
            </Link>
            <Link to="/dashboard/billing" className="btn btn-secondary w-full text-xs">
              Manage subscription
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card space-y-4" style={{ borderColor: 'oklch(0.74 0.12 195 / 0.35)' }}>
      <div>
        <p className="text-eyebrow mb-1" style={{ color: 'var(--color-accent-base)' }}>
          Get started
        </p>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Create an API key, then call /v1/extract
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
          Free tier includes 100 queries/month. Keys are shown once — copy them immediately.
        </p>
      </div>
      <ol className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <li className="flex gap-2">
          <span className="font-mono tabular-nums" style={{ color: 'var(--color-accent-base)' }}>1</span>
          Open API Keys and create a named key
        </li>
        <li className="flex gap-2">
          <span className="font-mono tabular-nums" style={{ color: 'var(--color-accent-base)' }}>2</span>
          POST to /v1/extract with Bearer auth
        </li>
        <li className="flex gap-2">
          <span className="font-mono tabular-nums" style={{ color: 'var(--color-accent-base)' }}>3</span>
          Optional: connect MCP for agent hosts
        </li>
      </ol>
      <pre
        className="rounded-md p-3 text-[10px] leading-relaxed overflow-x-auto"
        style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border-subtle)' }}
      >
{`curl -s https://agentapigw.dpdns.org/v1/extract \\
  -H "Authorization: Bearer sk-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com","schema":"article"}'`}
      </pre>
      <div className="flex flex-col gap-2">
        <Link to="/dashboard/api-keys" className="btn btn-primary w-full text-xs">
          <KeyRound className="w-3.5 h-3.5" />
          Create API key
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link to="/docs" className="btn btn-secondary w-full text-xs">
          <BookOpen className="w-3.5 h-3.5" />
          Full docs
        </Link>
      </div>
    </div>
  );
}

// ─── Overview Page ───

export default function Overview() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [chart, setChart] = useState<DailyUsage[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, chartRes, recentRes] = await Promise.all([
          fetch('/v1/usage'),
          fetch('/v1/usage/daily'),
          fetch('/v1/usage/recent'),
        ]);

        if (!statsRes.ok) throw new Error(`Stats HTTP ${statsRes.status}`);
        if (!chartRes.ok) throw new Error(`Chart HTTP ${chartRes.status}`);

        const raw = (await statsRes.json()) as ApiUsageResponse;
        const chartData = (await chartRes.json()) as { days: DailyUsage[] };
        const recentData = recentRes.ok ? await recentRes.json() : { recent: [], summary: {} };
        const s = recentData.summary ?? {};
        const days = chartData.days ?? [];
        const todayCount = days.length ? days[days.length - 1].count : 0;
        const yesterdayCount = days.length > 1 ? days[days.length - 2].count : 0;
        const statsData: UsageStats = {
          total_queries: raw.credits_used,
          queries_today: todayCount,
          queries_today_delta: todayCount - yesterdayCount,
          queries_this_month: raw.credits_used,
          credits_used: raw.credits_used,
          credits_remaining: raw.credits_remaining,
          credits_limit: raw.credits_limit ?? (raw.credits_used + raw.credits_remaining),
          bonus_credits: raw.bonus_credits ?? 0,
          cache_hit_rate: s.cache_hit_rate ?? 0,
          avg_latency_ms: s.avg_latency_ms ?? 0,
          active_keys: s.active_keys ?? 0,
          recent_errors: 0,
          tier: raw.tier || 'free',
        };

        if (!cancelled) {
          setStats(statsData);
          setChart(chartData.days ?? []);
          setRecent(recentData.recent ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setStats({
            total_queries: 0,
            queries_today: 0,
            queries_this_month: 0,
            credits_used: 0,
            credits_remaining: 100,
            credits_limit: 100,
            bonus_credits: 0,
            cache_hit_rate: 0,
            avg_latency_ms: 0,
            active_keys: 0,
            recent_errors: 0,
            tier: 'free',
          });
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="stat-card" style={{ borderColor: 'var(--color-error-subtle)' }}>
        <p className="font-medium" style={{ color: 'var(--color-error)' }}>Failed to load overview</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-error-subtle)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Credits remaining (plan + bonus packs) and how to call the API."
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Total Queries"
            value={(stats?.total_queries ?? 0).toLocaleString()}
            sub="This period usage"
            icon={Zap}
            loading={loading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Today"
            value={(stats?.queries_today ?? 0).toLocaleString()}
            sub={`${(stats?.queries_today_delta ?? 0) >= 0 ? '+' : ''}${stats?.queries_today_delta ?? 0} vs yesterday`}
            trend={(stats?.queries_today_delta ?? 0) >= 0 ? 'up' : 'down'}
            trendValue={`${(stats?.queries_today_delta ?? 0) >= 0 ? '+' : ''}${stats?.queries_today_delta ?? 0}`}
            icon={Activity}
            loading={loading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="This Month"
            value={(stats?.queries_this_month ?? 0).toLocaleString()}
            sub={`${(stats?.credits_remaining ?? 0).toLocaleString()} credits remaining`}
            icon={Activity}
            loading={loading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Credits left"
            value={(stats?.credits_remaining ?? 0).toLocaleString()}
            sub={
              (stats?.bonus_credits ?? 0) > 0
                ? `Incl. ${(stats?.bonus_credits ?? 0).toLocaleString()} bonus from packs`
                : 'Plan limit + credit packs'
            }
            icon={Clock}
            loading={loading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Tier"
            value={stats?.tier ? stats.tier : 'free'}
            sub="Plans & credit packs under Billing"
            icon={KeyRound}
            loading={loading}
          />
        </StaggerItem>
      </Stagger>

      <UsageBar
        used={stats?.credits_used ?? 0}
        total={stats?.credits_limit ?? ((stats?.credits_used ?? 0) + (stats?.credits_remaining ?? 0))}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <UsageChart data={chart} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <OnboardingCard hasUsage={(stats?.total_queries ?? 0) > 0} />
          {(stats?.total_queries ?? 0) === 0 && <CreditPacksMini />}
          <RecentRequests items={recent} />
        </div>
      </div>
    </div>
  );
}
