content = '''import React, { type ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <div className={surface-elevated rounded-xl p-6 hover-lift interactive-glow }>
      <div
        className=\"inline-flex p-3 rounded-lg mb-4\"
        style={{ backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
      >
        {icon}
      </div>
      <h3
        className=\"text-lg font-semibold mb-2\"
        style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      <p className=\"text-sm leading-relaxed\" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
    </div>
  );
}

interface FeatureGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGrid({ children, columns = 3, className = '' }: FeatureGridProps) {
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

with open('src/dashboard/src/components/FeatureCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created FeatureCard component')
