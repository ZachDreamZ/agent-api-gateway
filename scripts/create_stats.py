content = '''import React, { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  suffix?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, suffix, className = '' }: StatCardProps) {
  const getTrendColor = () => {
    if (trend?.direction === 'up') return 'oklch(0.55 0.15 145)';
    if (trend?.direction === 'down') return 'oklch(0.55 0.15 25)';
    return 'var(--color-text-tertiary)';
  };

  const getTrendIcon = () => {
    if (trend?.direction === 'up') return <TrendingUp className=\"w-4 h-4\" />;
    if (trend?.direction === 'down') return <TrendingDown className=\"w-4 h-4\" />;
    return <Minus className=\"w-4 h-4\" />;
  };

  return (
    <div className={surface-elevated rounded-xl p-6 }>
      <div className=\"flex items-start justify-between\">
        <div className=\"space-y-2 flex-1\">
          <p className=\"text-sm font-medium\" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </p>
          <p className=\"text-3xl font-bold\" style={{ color: 'var(--color-text-primary)' }}>
            {value}
            {suffix && (
              <span className=\"text-lg ml-1\" style={{ color: 'var(--color-text-tertiary)' }}>
                {suffix}
              </span>
            )}
          </p>
          {trend && (
            <div className=\"flex items-center gap-1 text-sm font-medium\" style={{ color: getTrendColor() }}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className=\"p-3 rounded-lg\"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 3, className = '' }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={grid  gap-6 }>
      {children}
    </div>
  );
}
'''

with open('src/dashboard/src/components/Stats.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created Stats component')
