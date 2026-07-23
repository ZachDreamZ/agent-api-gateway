import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  onRemove,
  className = '' 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantStyles = {
    default: {
      background: 'oklch(0.95 0.01 195)',
      color: 'oklch(0.3 0.05 255)',
      border: '1px solid oklch(0.9 0.01 195)',
    },
    success: {
      background: 'oklch(0.95 0.05 145)',
      color: 'oklch(0.4 0.12 145)',
      border: '1px solid oklch(0.85 0.08 145)',
    },
    warning: {
      background: 'oklch(0.95 0.08 85)',
      color: 'oklch(0.45 0.15 75)',
      border: '1px solid oklch(0.88 0.12 80)',
    },
    error: {
      background: 'oklch(0.95 0.05 25)',
      color: 'oklch(0.45 0.15 25)',
      border: '1px solid oklch(0.85 0.08 25)',
    },
    info: {
      background: 'oklch(0.95 0.05 235)',
      color: 'oklch(0.4 0.12 235)',
      border: '1px solid oklch(0.85 0.08 235)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-default)',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={{
        background: style.background,
        color: style.color,
        border: style.border,
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
          aria-label="Remove badge"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
