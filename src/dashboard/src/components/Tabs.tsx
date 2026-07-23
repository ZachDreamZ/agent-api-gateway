import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export function Tabs({ 
  tabs, 
  defaultTab, 
  onChange,
  variant = 'default',
  size = 'md'
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  const variantStyles = {
    default: {
      container: 'border-b border-gray-200',
      button: 'border-b-2 border-transparent hover:border-gray-300',
      active: 'border-b-2',
    },
    pills: {
      container: 'gap-2 p-1 rounded-lg',
      button: 'rounded-lg hover:bg-gray-100',
      active: 'rounded-lg shadow-sm',
    },
    underline: {
      container: 'gap-6',
      button: 'border-b-2 border-transparent hover:border-gray-300',
      active: 'border-b-2',
    },
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="tabs-container">
      <div 
        className={`tabs-list flex ${variantStyles[variant].container}`}
        style={{
          background: variant === 'pills' ? 'oklch(0.97 0.008 195)' : 'transparent',
          borderBottom: variant !== 'pills' ? '1px solid var(--color-border-subtle)' : 'none',
        }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              className={`tab-button ${sizeStyles[size]} ${variantStyles[variant].button} ${isActive ? variantStyles[variant].active : ''}`}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: 'none',
                background: isActive && variant === 'pills' 
                  ? 'oklch(0.99 0.005 195)' 
                  : 'transparent',
                color: tab.disabled 
                  ? 'var(--color-text-disabled)' 
                  : isActive 
                    ? 'var(--color-accent-base)' 
                    : 'var(--color-text-secondary)',
                borderBottom: variant !== 'pills' && isActive 
                  ? '2px solid var(--color-accent-base)' 
                  : variant !== 'pills' 
                    ? '2px solid transparent' 
                    : 'none',
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                opacity: tab.disabled ? 0.5 : 1,
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div 
        className="tab-content"
        role="tabpanel"
        style={{
          padding: '1.5rem 0',
        }}
      >
        {activeTabContent?.content}
      </div>
    </div>
  );
}
