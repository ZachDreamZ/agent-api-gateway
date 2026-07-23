content = '''import React, { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { easeOut } from '../lib/motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className={ounded-xl p-12 text-center }
      style={{ backgroundColor: 'var(--color-surface-elevated)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: easeOut }}
        className=\"inline-flex p-4 rounded-full mb-6\"
        style={{ backgroundColor: 'var(--color-surface-subtle)' }}
      >
        <div style={{ color: 'var(--color-text-tertiary)' }}>
          {icon}
        </div>
      </motion.div>
      
      <h3
        className=\"text-lg font-semibold mb-2\"
        style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      
      <p
        className=\"text-sm max-w-md mx-auto mb-6\"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
      
      {action && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={action.onClick}
          className=\"btn btn-primary\"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
'''

with open('src/dashboard/src/components/EmptyState.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created EmptyState component')
