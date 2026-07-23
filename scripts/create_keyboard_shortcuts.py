content = '''import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
  { keys: ['Ctrl', 'K'], description: 'Open command palette', category: 'General' },
  { keys: ['Esc'], description: 'Close modals', category: 'General' },
  { keys: ['g', 'h'], description: 'Go to home', category: 'Navigation' },
  { keys: ['g', 'd'], description: 'Go to dashboard', category: 'Navigation' },
  { keys: ['g', 'k'], description: 'Go to API keys', category: 'Navigation' },
  { keys: ['g', 'b'], description: 'Go to billing', category: 'Navigation' },
  { keys: ['g', 'o'], description: 'Go to docs', category: 'Navigation' },
];

function KeyBadge({ k }: { k: string }) {
  return (
    <kbd
      className=\"px-2 py-1 text-xs font-semibold rounded\"
      style={{
        backgroundColor: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-border-default)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {k}
    </kbd>
  );
}

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className=\"fixed inset-0 bg-black/50 backdrop-blur-sm z-50\"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className=\"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl z-50\"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div className=\"sticky top-0 flex items-center justify-between p-6 border-b\" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-surface-elevated)' }}>
              <div className=\"flex items-center gap-3\">
                <Command className=\"w-6 h-6\" style={{ color: 'var(--color-accent-base)' }} />
                <h2 className=\"text-xl font-semibold\" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className=\"p-2 rounded-lg hover:bg-black/10 transition-colors\"
              >
                <X className=\"w-5 h-5\" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>

            <div className=\"p-6 space-y-6\">
              {categories.map(category => (
                <div key={category}>
                  <h3 className=\"text-sm font-semibold mb-3\" style={{ color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {category}
                  </h3>
                  <div className=\"space-y-2\">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, i) => (
                        <div
                          key={i}
                          className=\"flex items-center justify-between p-3 rounded-lg\"
                          style={{ backgroundColor: 'var(--color-surface-subtle)' }}
                        >
                          <span className=\"text-sm\" style={{ color: 'var(--color-text-secondary)' }}>
                            {shortcut.description}
                          </span>
                          <div className=\"flex items-center gap-1\">
                            {shortcut.keys.map((k, j) => (
                              <React.Fragment key={j}>
                                <KeyBadge k={k} />
                                {j < shortcut.keys.length - 1 && (
                                  <span className=\"text-xs mx-1\" style={{ color: 'var(--color-text-tertiary)' }}>+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
'''

with open('src/dashboard/src/components/KeyboardShortcuts.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created KeyboardShortcuts component')
