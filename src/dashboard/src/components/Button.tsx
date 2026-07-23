import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: {
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        iconSize: '1rem',
      },
      md: {
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
        iconSize: '1.125rem',
      },
      lg: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.9375rem',
        iconSize: '1.25rem',
      },
    };

    const variantStyles = {
      primary: {
        background: 'var(--color-accent-base)',
        color: 'oklch(0.99 0.005 195)',
        border: 'none',
        hoverBackground: 'var(--color-accent-hover)',
      },
      secondary: {
        background: 'oklch(0.88 0.008 195)',
        color: 'var(--color-text-primary)',
        border: 'none',
        hoverBackground: 'oklch(0.85 0.01 195)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--color-accent-base)',
        border: '1px solid var(--color-accent-base)',
        hoverBackground: 'oklch(0.96 0.02 235)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text-primary)',
        border: 'none',
        hoverBackground: 'oklch(0.96 0.008 195)',
      },
      danger: {
        background: 'oklch(0.60 0.15 25)',
        color: 'oklch(0.99 0.005 195)',
        border: 'none',
        hoverBackground: 'oklch(0.55 0.17 25)',
      },
    };

    const size_config = sizeStyles[size];
    const style = variantStyles[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`button button-${variant} button-${size} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: size_config.padding,
          fontSize: size_config.fontSize,
          fontWeight: 600,
          background: style.background,
          color: style.color,
          border: style.border,
          borderRadius: '8px',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.background = style.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.background = style.background;
          }
        }}
        onFocus={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.boxShadow = `0 0 0 3px ${style.color === 'oklch(0.99 0.005 195)' ? 'var(--color-accent-base)' : style.color}20`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      >
        {loading ? (
          <div
            className="button-spinner"
            style={{
              width: size_config.iconSize,
              height: size_config.iconSize,
              border: `2px solid ${style.color}40`,
              borderTopColor: style.color,
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        ) : (
          leftIcon && (
            <span style={{ display: 'flex', width: size_config.iconSize, height: size_config.iconSize }}>
              {leftIcon}
            </span>
          )
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span style={{ display: 'flex', width: size_config.iconSize, height: size_config.iconSize }}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
