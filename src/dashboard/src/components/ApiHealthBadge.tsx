import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface HealthStatus {
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  lastChecked: Date;
}

export function ApiHealthBadge() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const start = Date.now();
        const response = await fetch('/health', { 
          method: 'GET',
          cache: 'no-cache'
        });
        const latency = Date.now() - start;
        
        if (response.ok) {
          setHealth({
            status: latency < 500 ? 'operational' : 'degraded',
            latency,
            lastChecked: new Date()
          });
        } else {
          setHealth({
            status: 'down',
            latency,
            lastChecked: new Date()
          });
        }
      } catch (error) {
        setHealth({
          status: 'down',
          latency: 0,
          lastChecked: new Date()
        });
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return null;
  }

  const statusConfig = {
    operational: {
      label: 'All Systems Operational',
      color: 'oklch(0.72 0.14 155)',
      dotColor: 'oklch(0.8 0.16 155)'
    },
    degraded: {
      label: 'Degraded Performance',
      color: 'oklch(0.75 0.14 85)',
      dotColor: 'oklch(0.8 0.16 85)'
    },
    down: {
      label: 'Service Unavailable',
      color: 'oklch(0.63 0.24 25)',
      dotColor: 'oklch(0.7 0.26 25)'
    }
  };

  const config = statusConfig[health.status];

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${config.color}20`,
        color: config.color
      }}
    >
      <Activity size={12} />
      <span>{config.label}</span>
      {health.status === 'operational' && (
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          • {health.latency}ms
        </span>
      )}
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background: config.dotColor,
          boxShadow: `0 0 8px ${config.dotColor}80`,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
    </div>
  );
}
