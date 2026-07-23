content = '''import React, { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  loading = false,
  className = '',
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className=\"w-3.5 h-3.5\" />;
    if (trend.value < 0) return <TrendingDown className=\"w-3.5 h-3.5\" />;
    return <Minus className=\"w-3.5 h-3.5\" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'var(--color-text-tertiary)';
    if (trend.value > 0) return 'oklch(0.55 0.15 145)'; // Green
    if (trend.value < 0) return 'oklch(0.55 0.15 25)'; // Red
    return 'var(--color-text-tertiary)';
  };

  if (loading) {
    return (
      <div className={surface-elevated p-6 rounded-lg }>
        <div className=\"flex items-center justify-between mb-3\">
          <div className=\"h-4 w-20 rounded animate-pulse\" style={{ background: 'var(--color-border-subtle)' }} />
          {icon && (
            <div className=\"h-8 w-8 rounded animate-pulse\" style={{ background: 'var(--color-border-subtle)' }} />
          )}
        </div>
        <div className=\"h-8 w-24 rounded animate-pulse mb-2\" style={{ background: 'var(--color-border-subtle)' }} />
        {trend && (
          <div className=\"h-3 w-16 rounded animate-pulse\" style={{ background: 'var(--color-border-subtle)' }} />
        )}
      </div>
    );
  }

  return (
    <div className={surface-elevated p-6 rounded-lg hover:surface-hover transition-colors }>
      <div className=\"flex items-center justify-between mb-3\">
        <div className=\"text-sm font-medium\" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </div>
        {icon && (
          <div
            className=\"flex h-8 w-8 items-center justify-center rounded\"
            style={{
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent-base)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      
      <div className=\"font-display text-3xl font-bold mb-2\" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </div>
      
      {trend && (
        <div className=\"flex items-center gap-1.5 text-xs font-medium\" style={{ color: getTrendColor() }}>
          {getTrendIcon()}
          <span>{Math.abs(trend.value)}%</span>
          {trend.label && (
            <span style={{ color: 'var(--color-text-tertiary)' }}>{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({
  children,
  columns = 4,
  className = '',
}: StatsGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={grid gap-6  }>
      {children}
    </div>
  );
}
'''

with open('src/dashboard/src/components/Stats.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created Stats component')
