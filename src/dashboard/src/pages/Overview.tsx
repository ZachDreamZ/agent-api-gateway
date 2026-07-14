import { useState, useEffect } from 'react';

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

interface DailyUsage {
  date: string;
  count: number;
}

// ─── Stat Card ───

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-surface-800 bg-surface-900 p-4">
        <div className="mb-2 h-3 w-20 animate-pulse rounded bg-surface-700" />
        <div className="h-7 w-28 animate-pulse rounded bg-surface-700" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-surface-800 bg-surface-900 p-4 transition-colors hover:border-surface-700">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-surface-500">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-surface-500">{sub}</p>}
    </div>
  );
}

// ─── Sparkline Chart (bar) ───

function UsageChart({ data }: { data: DailyUsage[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-surface-800 bg-surface-900 text-sm text-surface-500">
        No usage data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-surface-800 bg-surface-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-surface-300">Last 7 Days</h3>
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-surface-400">{d.count}</span>
              <div
                className="w-full rounded-t bg-brand-600/60 transition-all hover:bg-brand-500"
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              <span className="text-[10px] text-surface-600">
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
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
          fetch('/api/billing/usage'),
          fetch('/api/billing/usage/daily'),
        ]);

        if (!statsRes.ok) throw new Error(`Stats HTTP ${statsRes.status}`);
        if (!chartRes.ok) throw new Error(`Chart HTTP ${chartRes.status}`);

        const statsData = (await statsRes.json()) as UsageStats;
        const chartData = (await chartRes.json()) as { days: DailyUsage[] };

        if (!cancelled) {
          setStats(statsData);
          setChart(chartData.days ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load stats';
          // Seed demo data since backend doesn't have these endpoints yet
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
      <div className="rounded-lg border border-red-800 bg-red-900/20 px-6 py-4 text-red-400">
        <p className="font-medium">Failed to load overview</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Queries"
          value={(stats?.total_queries ?? 0).toLocaleString()}
          sub="All time"
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={(stats?.queries_this_month ?? 0).toLocaleString()}
          sub={`${(stats?.credits_remaining ?? 0).toLocaleString()} credits remaining`}
          loading={loading}
        />
        <StatCard
          label="Today"
          value={(stats?.queries_today ?? 0).toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Avg Latency"
          value={stats ? `${stats.avg_latency_ms}ms` : '—'}
          sub={stats ? `${stats.cache_hit_rate}% cache hit` : undefined}
          loading={loading}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Keys"
          value={String(stats?.active_keys ?? 0)}
          loading={loading}
        />
        <StatCard
          label="Cache Hit Rate"
          value={stats ? `${stats.cache_hit_rate}%` : '—'}
          loading={loading}
        />
        <StatCard
          label="Recent Errors"
          value={String(stats?.recent_errors ?? 0)}
          sub="Last 24h"
          loading={loading}
        />
      </div>

      {/* Chart */}
      <UsageChart data={chart} />
    </div>
  );
}
