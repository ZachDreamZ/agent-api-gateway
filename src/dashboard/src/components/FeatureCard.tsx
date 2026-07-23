import React, { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  variant = 'default',
  className = '',
}: FeatureCardProps) {
  const baseClasses = 'group p-6 rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white/40 hover:bg-white/60',
    elevated: 'surface-elevated hover:surface-hover',
    bordered: 'border border-[var(--color-border-default)] hover:border-[var(--color-accent-base)] bg-white/20',
  };

  return (
    <motion.div
      className={${baseClasses}  }
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {icon && (
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200"
          style={{
            background: 'var(--color-accent-subtle)',
            color: 'var(--color-accent-base)',
          }}
        >
          {icon}
        </div>
      )}
      
      <h3
        className="font-display text-lg font-semibold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
    </motion.div>
  );
}

interface FeatureGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGrid({
  children,
  columns = 3,
  className = '',
}: FeatureGridProps) {
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
