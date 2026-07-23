import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 glass-card p-4 animate-in slide-in-from-bottom-5"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
    >
      <button
        onClick={decline}
        className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <X size={16} style={{ color: 'var(--color-text-tertiary)' }} />
      </button>
      
      <div className="flex items-start gap-3">
        <Cookie size={20} style={{ color: 'var(--color-accent-base)', flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1 pr-6">
          <h3
            id="cookie-title"
            className="text-sm font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Cookie Notice
          </h3>
          <p
            id="cookie-desc"
            className="text-xs leading-relaxed mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            We use essential cookies for authentication and analytics to improve your experience. No tracking cookies.
          </p>
          <div className="flex gap-2">
            <button
              onClick={accept}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                background: 'var(--color-accent-base)',
                color: 'var(--color-surface)'
              }}
            >
              Accept
            </button>
            <button
              onClick={decline}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                background: 'var(--color-surface-hover)',
                color: 'var(--color-text-secondary)'
              }}
            >
              Decline
            </button>
            <a
              href="/privacy"
              className="px-3 py-1.5 text-xs font-medium transition-all"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
