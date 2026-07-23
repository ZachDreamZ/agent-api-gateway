import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowOffline(false);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <WifiOff className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No internet connection
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Check your network and try again
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {!showOffline && !isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <Wifi className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Back online
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
