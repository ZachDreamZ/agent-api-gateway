import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  title,
  onClose,
  icon,
  className = '' 
}: AlertProps) {
  const variantConfig = {
    success: {
      background: 'oklch(0.96 0.05 145)',
      border: 'oklch(0.85 0.08 145)',
      text: 'oklch(0.35 0.12 145)',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
      background: 'oklch(0.96 0.05 25)',
      border: 'oklch(0.85 0.08 25)',
      text: 'oklch(0.40 0.15 25)',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    warning: {
      background: 'oklch(0.96 0.08 85)',
      border: 'oklch(0.88 0.12 80)',
      text: 'oklch(0.40 0.15 75)',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    info: {
      background: 'oklch(0.96 0.05 235)',
      border: 'oklch(0.85 0.08 235)',
      text: 'oklch(0.35 0.12 235)',
      icon: <Info className="w-5 h-5" />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className={`alert ${className}`}
      role="alert"
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '1rem',
        background: config.background,
        border: `1px solid ${config.border}`,
        borderRadius: '8px',
        color: config.text,
      }}
    >
      <div className="alert-icon" style={{ flexShrink: 0, color: config.text }}>
        {icon || config.icon}
      </div>
      <div className="alert-content" style={{ flex: 1 }}>
        {title && (
          <div
            className="alert-title"
            style={{
              fontWeight: 600,
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            {title}
          </div>
        )}
        <div
          className="alert-description"
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.5,
          }}
        >
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="alert-close"
          aria-label="Close alert"
          style={{
            flexShrink: 0,
            padding: '0.25rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: config.text,
            opacity: 0.7,
            borderRadius: '4px',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
