import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  onClick,
  className = '',
}: CardProps) {
  const paddingStyles = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const variantStyles = {
    default: {
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-default)',
      boxShadow: 'none',
    },
    elevated: {
      background: 'var(--color-bg-elevated)',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--color-border-default)',
      boxShadow: 'none',
    },
    glass: {
      background: 'oklch(0.175 0.02 255 / 0.8)',
      border: '1px solid oklch(0.34 0.025 255 / 0.5)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(12px)',
    },
  };

  const baseStyles = {
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    ...variantStyles[variant],
  };

  const interactiveStyles = hoverable || onClick ? {
    cursor: 'pointer',
  } : {};

  return (
    <div
      className={`card card-${variant} ${className}`}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...interactiveStyles,
        padding: paddingStyles[padding],
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          if (variant === 'elevated') {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
          } else if (variant === 'default' || variant === 'outline') {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow;
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      className={`card-header ${className}`}
      style={{
        marginBottom: '1rem',
      }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3
      className={`card-title ${className}`}
      style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: 0,
      }}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p
      className={`card-description ${className}`}
      style={{
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        margin: '0.5rem 0 0 0',
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={`card-footer ${className}`}
      style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      {children}
    </div>
  );
}
