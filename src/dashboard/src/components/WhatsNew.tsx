import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

interface Update {
  version: string;
  date: string;
  title: string;
  items: string[];
}

const LATEST_UPDATES: Update[] = [
  {
    version: '1.3.0',
    date: '2026-07-23',
    title: 'Premium Polish & New Content',
    items: [
      'New blog: Rate limiting strategies for AI agents',
      'Premium button animations and hover effects',
      'Fixed ShareButton and PerformanceMonitor crashes',
      'SEO page titles on all pages',
      'Tooltip accessibility improvements'
    ]
  }
];

export function WhatsNew() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('whats-new-dismissed') === LATEST_UPDATES[0].version;
  });

  const handleDismiss = () => {
    localStorage.setItem('whats-new-dismissed', LATEST_UPDATES[0].version);
    setDismissed(true);
  };

  if (dismissed) return null;

  const latest = LATEST_UPDATES[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 p-4 rounded-lg surface"
        style={{ border: '1px solid var(--color-accent-base)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-accent-base)' }} />
            <div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
                What's New — {latest.title}
              </h3>
              <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                {latest.items.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Version {latest.version} • {new Date(latest.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="interactive p-1"
            style={{ color: 'var(--color-text-tertiary)' }}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
