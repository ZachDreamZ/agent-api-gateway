import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'bordered' | 'separated';
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default',
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string, disabled?: boolean) => {
    if (disabled) return;

    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  const variantStyles = {
    default: {
      container: 'border-b border-gray-200',
      item: 'border-none',
      spacing: '0',
    },
    bordered: {
      container: 'border border-gray-200 rounded-lg overflow-hidden',
      item: 'border-b border-gray-200 last:border-b-0',
      spacing: '0',
    },
    separated: {
      container: 'space-y-2',
      item: 'border border-gray-200 rounded-lg',
      spacing: '0.5rem',
    },
  };

  return (
    <div className={`accordion accordion-${variant} ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: variantStyles[variant].spacing }}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div
            key={item.id}
            className={`accordion-item ${variantStyles[variant].item}`}
            style={{
              border: variant === 'default' ? 'none' : '1px solid var(--color-border-default)',
              borderRadius: variant === 'separated' ? '8px' : variant === 'bordered' ? '0' : '0',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => toggleItem(item.id, item.disabled)}
              disabled={item.disabled}
              className="accordion-trigger"
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: isOpen ? 'oklch(0.97 0.008 195)' : 'transparent',
                border: 'none',
                color: item.disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textAlign: 'left',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && !isOpen) {
                  e.currentTarget.style.background = 'oklch(0.985 0.006 195)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                {item.icon && <span style={{ color: 'var(--color-accent-base)' }}>{item.icon}</span>}
                <span>{item.title}</span>
              </div>
              <ChevronDown
                className="w-4 h-4"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: 'var(--color-text-tertiary)',
                }}
              />
            </button>
            <div
              className="accordion-content"
              style={{
                display: isOpen ? 'block' : 'none',
                padding: isOpen ? '0 1.25rem 1rem 1.25rem' : '0',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                animation: isOpen ? 'slideDown 0.2s ease-out' : 'none',
              }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
