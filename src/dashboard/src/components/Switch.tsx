interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = '',
}: SwitchProps) {
  const sizeConfig = {
    sm: {
      width: '32px',
      height: '18px',
      thumbSize: '14px',
      thumbOffset: '2px',
      thumbCheckedOffset: '16px',
      fontSize: '0.8125rem',
    },
    md: {
      width: '44px',
      height: '24px',
      thumbSize: '20px',
      thumbOffset: '2px',
      thumbCheckedOffset: '22px',
      fontSize: '0.875rem',
    },
    lg: {
      width: '56px',
      height: '30px',
      thumbSize: '26px',
      thumbOffset: '2px',
      thumbCheckedOffset: '28px',
      fontSize: '0.9375rem',
    },
  };

  const config = sizeConfig[size];

  const handleClick = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <label
      className={`switch-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        className="switch"
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: config.width,
          height: config.height,
          background: checked
            ? 'var(--color-accent-base)'
            : 'oklch(0.88 0.008 195)',
          borderRadius: config.height,
          transition: 'background 0.2s',
          outline: 'none',
        }}
      >
        <div
          className="switch-thumb"
          style={{
            position: 'absolute',
            top: config.thumbOffset,
            left: checked ? config.thumbCheckedOffset : config.thumbOffset,
            width: config.thumbSize,
            height: config.thumbSize,
            background: 'oklch(0.99 0.005 195)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
            transition: 'left 0.2s',
          }}
        />
      </div>
      {label && (
        <span
          className="switch-label"
          style={{
            fontSize: config.fontSize,
            fontWeight: 500,
            color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
