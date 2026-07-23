content = '''import React, { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={	ext-center py-12 px-6 }>
      {icon && (
        <div
          className=\"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full\"
          style={{
            background: 'var(--color-bg-app)',
            color: 'var(--color-text-disabled)',
          }}
        >
          {icon}
        </div>
      )}
      
      <h3
        className=\"font-display text-lg font-semibold mb-2\"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      
      {description && (
        <p
          className=\"text-sm mb-6 max-w-md mx-auto\"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className=\"btn btn-primary\"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
'''

with open('src/dashboard/src/components/EmptyState.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created EmptyState component')
