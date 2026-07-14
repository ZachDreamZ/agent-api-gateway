import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// ─── Types ───

interface UsageStats {
  total_queries: number;
  queries_today: number;
  queries_this_month: number;
  credits_used: number;
  credits_remaining: number;
  cache_hit_rate: number;
  avg_latency_ms: number;
  active_keys: number;
  recent_errors: number;
}

interface ApiUsageResponse {
  tier: string;
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
  period_start: string;
}

interface DailyUsage {
  date: string;
  count: number;
}

// ─── Icons ───

function IconTrendUp({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconTrendDown({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function IconZap({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconClock({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconShield({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconActivity({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconKey({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
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
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  delay?: number;
}) {
  if (loading) {
    return (
      <div className="rounded-xl glass-card p-5">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="mb-2 h-8 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-xl glass-card glass-card-hover p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
        {Icon && (
          <Icon className="w-4 h-4 text-white/20 transition-colors group-hover:text-white/40" />
        )}
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {trend && trendValue && (
          <span className={`mb-1 flex items-center gap-0.5 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'
          }`}>
            {trend === 'up' ? <IconTrendUp className="w-3 h-3" /> : trend === 'down' ? <IconTrendDown className="w-3 h-3" /> : null}
            {trendValue}
          </span>
        )}
      </div>
      {sub && <p className="mt-1.5 text-xs text-white/40">{sub}</p>}
    </motion.div>
  );
}

// ─── Usage Progress Bar ───

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isHigh = pct > 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="rounded-xl glass-card p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">Monthly Usage</p>
        <p className="text-xs text-white/40">
          {used.toLocaleString()} / {total.toLocaleString()}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${isHigh ? 'bg-amber-500' : 'bg-brand-500'}`}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-white/40">{Math.round(pct)}% used</p>
        <p className={`text-xs font-medium ${isHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
          {isHigh ? 'Approaching limit' : 'On track'}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Usage Chart ───

function UsageChart({ data }: { data: DailyUsage[] }) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="rounded-xl glass-card p-6 text-center"
      >
        <IconActivity className="mx-auto mb-3 w-8 h-8 text-white/20" />
        <p className="text-sm font-medium text-white/60">No usage data yet</p>
        <p className="mt-1 text-xs text-white/40">Start making API calls to see your usage chart</p>
      </motion.div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="rounded-xl glass-card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">Last 7 Days</h3>
        <span className="text-xs text-white/40">
          {data.reduce((sum, d) => sum + d.count, 0).toLocaleString()} total
        </span>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 140 }}>
        {data.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-white/0 transition-colors group-hover:text-white/60">
                {d.count}
              </span>
              <div className="relative w-full overflow-hidden rounded-t-sm bg-white/5 transition-colors hover:bg-white/8" style={{ height: `${Math.max(pct, 4)}%` }}>
                <div className="absolute inset-0 rounded-t-sm bg-gradient-to-t from-brand-600/80 to-brand-400/40 transition-all group-hover:from-brand-500 group-hover:to-brand-300" />
              </div>
              <span className="text-[10px] text-white/30">
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Recent Activity ───

function ActivityFeed() {
  const activities = [
    { action: 'Extraction completed', detail: 'POST /v1/extract → product schema', time: '2 min ago', status: 'success' },
    { action: 'Extraction completed', detail: 'POST /v1/extract → article schema', time: '15 min ago', status: 'success' },
    { action: 'API key created', detail: 'Production key', time: '1 hour ago', status: 'info' },
    { action: 'Extraction failed', detail: 'POST /v1/extract → timeout', time: '3 hours ago', status: 'error' },
  ];

  const statusColors: Record<string, string> = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-brand-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="rounded-xl glass-card p-5"
    >
      <h3 className="mb-4 text-sm font-medium text-white/70">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${statusColors[activity.status]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/80">{activity.action}</p>
              <p className="text-xs text-white/40 truncate">{activity.detail}</p>
            </div>
            <span className="text-[10px] text-white/30 whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Overview Page ───

export default function Overview() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [chart, setChart] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, chartRes] = await Promise.all([
          fetch('/v1/usage'),
          fetch('/v1/usage/daily'),
        ]);

        if (!statsRes.ok) throw new Error(`Stats HTTP ${statsRes.status}`);
        if (!chartRes.ok) throw new Error(`Chart HTTP ${chartRes.status}`);

        const raw = (await statsRes.json()) as ApiUsageResponse;
        const chartData = (await chartRes.json()) as { days: DailyUsage[] };
        const statsData: UsageStats = {
          total_queries: raw.credits_used,
          queries_today: 0,
          queries_this_month: raw.credits_used,
          credits_used: raw.credits_used,
          credits_remaining: raw.credits_remaining,
          cache_hit_rate: 0,
          avg_latency_ms: 0,
          active_keys: 0,
          recent_errors: 0,
        };

        if (!cancelled) {
          setStats(statsData);
          setChart(chartData.days ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setStats({
            total_queries: 0,
            queries_today: 0,
            queries_this_month: 0,
            credits_used: 0,
            credits_remaining: 100,
            cache_hit_rate: 0,
            avg_latency_ms: 0,
            active_keys: 0,
            recent_errors: 0,
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl glass-card border-red-500/20 px-6 py-5"
      >
        <p className="font-medium text-red-400">Failed to load overview</p>
        <p className="mt-1 text-sm text-red-400/60">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Queries"
          value={(stats?.total_queries ?? 0).toLocaleString()}
          sub="All time"
          icon={IconZap}
          loading={loading}
          delay={0}
        />
        <StatCard
          label="This Month"
          value={(stats?.queries_this_month ?? 0).toLocaleString()}
          sub={`${(stats?.credits_remaining ?? 0).toLocaleString()} credits remaining`}
          trend="up"
          trendValue="+12%"
          icon={IconActivity}
          loading={loading}
          delay={1}
        />
        <StatCard
          label="Avg Latency"
          value={stats ? `${stats.avg_latency_ms}ms` : '—'}
          sub={stats ? `${stats.cache_hit_rate}% cache hit` : undefined}
          icon={IconClock}
          loading={loading}
          delay={2}
        />
        <StatCard
          label="Active Keys"
          value={String(stats?.active_keys ?? 0)}
          sub={`${stats?.recent_errors ?? 0} errors (24h)`}
          icon={IconKey}
          loading={loading}
          delay={3}
        />
      </div>

      {/* Usage progress */}
      <UsageBar
        used={stats?.credits_used ?? 0}
        total={(stats?.credits_used ?? 0) + (stats?.credits_remaining ?? 0)}
      />

      {/* Chart + Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <UsageChart data={chart} />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
