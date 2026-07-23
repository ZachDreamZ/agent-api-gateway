import { ReactNode, forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: {
        padding: leftIcon ? '0.5rem 0.75rem 0.5rem 2.25rem' : rightIcon ? '0.5rem 2.25rem 0.5rem 0.75rem' : '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        iconLeft: '0.75rem',
        iconRight: '0.75rem',
      },
      md: {
        padding: leftIcon ? '0.625rem 1rem 0.625rem 2.5rem' : rightIcon ? '0.625rem 2.5rem 0.625rem 1rem' : '0.625rem 1rem',
        fontSize: '0.875rem',
        iconLeft: '1rem',
        iconRight: '1rem',
      },
      lg: {
        padding: leftIcon ? '0.75rem 1.25rem 0.75rem 3rem' : rightIcon ? '0.75rem 3rem 0.75rem 1.25rem' : '0.75rem 1.25rem',
        fontSize: '0.9375rem',
        iconLeft: '1.25rem',
        iconRight: '1.25rem',
      },
    };

    const variantStyles = {
      default: {
        background: disabled ? 'oklch(0.96 0.01 195)' : 'oklch(0.99 0.005 195)',
        border: `1px solid ${error ? 'oklch(0.60 0.15 25)' : 'var(--color-border-default)'}`,
        focusBorder: error ? 'oklch(0.60 0.15 25)' : 'var(--color-accent-base)',
      },
      filled: {
        background: disabled ? 'oklch(0.94 0.01 195)' : 'oklch(0.96 0.008 195)',
        border: `1px solid transparent`,
        focusBorder: error ? 'oklch(0.60 0.15 25)' : 'var(--color-accent-base)',
      },
      outline: {
        background: 'transparent',
        border: `1px solid ${error ? 'oklch(0.60 0.15 25)' : 'var(--color-border-default)'}`,
        focusBorder: error ? 'oklch(0.60 0.15 25)' : 'var(--color-accent-base)',
      },
    };

    const size = sizeStyles[inputSize];
    const style = variantStyles[variant];

    return (
      <div className={`input-wrapper ${className}`} style={{ width: '100%' }}>
        {label && (
          <label
            className="input-label"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div
              className="input-icon-left"
              style={{
                position: 'absolute',
                left: size.iconLeft,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                color: error ? 'oklch(0.60 0.15 25)' : 'var(--color-text-tertiary)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className="input-field"
            style={{
              width: '100%',
              padding: size.padding,
              fontSize: size.fontSize,
              fontWeight: 500,
              background: style.background,
              border: style.border,
              borderRadius: '8px',
              color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = style.focusBorder;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${style.focusBorder}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = style.border.includes('transparent') ? 'transparent' : 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...props}
          />
          {rightIcon && (
            <div
              className="input-icon-right"
              style={{
                position: 'absolute',
                right: size.iconRight,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                color: error ? 'oklch(0.60 0.15 25)' : 'var(--color-text-tertiary)',
                pointerEvents: 'none',
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <div
            className="input-message"
            style={{
              marginTop: '0.5rem',
              fontSize: '0.8125rem',
              color: error ? 'oklch(0.60 0.15 25)' : 'var(--color-text-tertiary)',
            }}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
