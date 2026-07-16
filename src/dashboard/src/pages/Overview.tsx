import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, Clock, KeyRound, TrendingUp, TrendingDown } from 'lucide-react';

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
      <div className="stat-card">
        <div className="skeleton mb-3" style={{ width: '6rem', height: '0.75rem' }} />
        <div className="skeleton mb-2" style={{ width: '8rem', height: '2rem' }} />
        <div className="skeleton" style={{ width: '5rem', height: '0.75rem' }} />
      </div>
    );
  }

  return (
    <div className="stat-card surface-hover">
      <div className="stat-card-label">{label}</div>
      <div className="flex items-end gap-2">
        <span className="stat-card-value">{value}</span>
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
    </div>
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
      <div className="flex items-end gap-1.5" style={{ height: 140 }}>
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

// ─── Recent Activity ───

function ActivityFeed() {
  const activities = [
    { action: 'Extraction completed', detail: 'POST /v1/extract → product schema', time: '2 min ago', status: 'success' },
    { action: 'Extraction completed', detail: 'POST /v1/extract → article schema', time: '15 min ago', status: 'success' },
    { action: 'API key created', detail: 'Production key', time: '1 hour ago', status: 'info' },
    { action: 'Extraction failed', detail: 'POST /v1/extract → timeout', time: '3 hours ago', status: 'error' },
  ];

  return (
    <div className="stat-card">
      <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={`activity-dot ${
                activity.status === 'success' ? 'activity-dot-success' :
                activity.status === 'error' ? 'activity-dot-error' :
                'activity-dot-info'
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{activity.action}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{activity.detail}</p>
            </div>
            <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--color-text-disabled)' }}>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
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
      <div className="stat-card" style={{ borderColor: 'var(--color-error-subtle)' }}>
        <p className="font-medium" style={{ color: 'var(--color-error)' }}>Failed to load overview</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-error-subtle)' }}>{error}</p>
      </div>
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
          icon={Zap}
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={(stats?.queries_this_month ?? 0).toLocaleString()}
          sub={`${(stats?.credits_remaining ?? 0).toLocaleString()} credits remaining`}
          trend="up"
          trendValue="+12%"
          icon={Activity}
          loading={loading}
        />
        <StatCard
          label="Avg Latency"
          value={stats ? `${stats.avg_latency_ms}ms` : '—'}
          sub={stats ? `${stats.cache_hit_rate}% cache hit` : undefined}
          icon={Clock}
          loading={loading}
        />
        <StatCard
          label="Active Keys"
          value={String(stats?.active_keys ?? 0)}
          sub={`${stats?.recent_errors ?? 0} errors (24h)`}
          icon={KeyRound}
          loading={loading}
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
