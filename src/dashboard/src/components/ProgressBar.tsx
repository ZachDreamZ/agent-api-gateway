interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = 'md',
  variant = 'default',
  showLabel = false,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: '4px',
    md: '8px',
    lg: '12px',
  };

  const variantColors = {
    default: 'var(--color-accent-base)',
    success: 'oklch(0.6 0.15 145)',
    warning: 'oklch(0.65 0.18 75)',
    error: 'oklch(0.6 0.18 25)',
  };

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className="progress-track"
        style={{
          width: '100%',
          height: sizeStyles[size],
          background: 'oklch(0.95 0.01 195)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="progress-fill"
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: variantColors[variant],
            borderRadius: '9999px',
            transition: 'width 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, oklch(1 0 0 / 0.3), transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'var(--color-accent-base)',
    success: 'oklch(0.6 0.15 145)',
    warning: 'oklch(0.65 0.18 75)',
    error: 'oklch(0.6 0.18 25)',
  };

  return (
    <div className="circular-progress" style={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.95 0.01 195)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease-out',
          }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size / 4}px`,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
