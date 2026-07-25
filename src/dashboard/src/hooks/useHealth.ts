import { useState, useEffect } from 'react';

interface HealthData {
  status?: string;
  uptime_seconds?: number;
  uptime_hours?: number;
  requests_served?: number;
  github_oauth?: boolean;
  google_oauth?: boolean;
}

let cached: HealthData | null = null;
let listeners: Array<(data: HealthData | null) => void> = [];
let loading = false;

function notifyAll(data: HealthData | null) {
  cached = data;
  for (const fn of listeners) fn(data);
}

export function useHealth(): { data: HealthData | null; ok: boolean | null } {
  const [data, setData] = useState<HealthData | null>(cached);
  const ok = data === null ? null : data.status === 'ok' || Boolean(data.uptime_seconds !== undefined);

  useEffect(() => {
    listeners.push(setData);
    
    // Only fetch if no cached data and not already loading
    if (!cached && !loading) {
      loading = true;
      fetch('/health')
        .then(r => r.json() as Promise<HealthData>)
        .then(d => notifyAll(d))
        .catch(() => notifyAll(null))
        .finally(() => { loading = false; });
    }

    // Refresh every 60s
    const id = setInterval(() => {
      fetch('/health')
        .then(r => r.json() as Promise<HealthData>)
        .then(d => notifyAll(d))
        .catch(() => { /* keep stale data */ });
    }, 60000);

    return () => {
      listeners = listeners.filter(fn => fn !== setData);
      clearInterval(id);
    };
  }, []);

  return { data, ok };
}