import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateMetrics = () => {
      const nav = navigator as any;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      if (connection) {
        setMetrics({
          connectionType: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        });
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    updateMetrics();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateMetrics);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateMetrics);
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg\"
        style={{
          background: 'var(--color-error)',
          color: 'white',
        }}
      >
        <WifiOff className="w-4 h-4\" />
        <span className="text-sm font-medium\">No internet connection</span>
      </div>
    );
  }

  if (metrics?.saveData) {
    return (
      <div
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-md\"
        style={{
          background: 'var(--color-warning)',
          color: 'var(--color-bg)',
        }}
      >
        <AlertTriangle className="w-3.5 h-3.5\" />
        <span className="text-xs font-medium\">Data saver mode</span>
      </div>
    );
  }

  return null;
}
