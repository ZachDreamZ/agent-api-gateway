import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Web Vitals tracking
 * Measures Core Web Vitals (CLS, FID, LCP) + FCP and TTFB
 * Logs to console in dev; in prod, could send to analytics endpoint
 */

function sendToAnalytics(metric: Metric) {
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    // In dev: log to console with color coding
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      INP: { good: 200, needsImprovement: 500 },
      LCP: { good: 2500, needsImprovement: 4000 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 },
    };

    const threshold = thresholds[metric.name];
    let rating = 'poor';
    if (threshold) {
      if (metric.value <= threshold.good) rating = 'good';
      else if (metric.value <= threshold.needsImprovement) rating = 'needs-improvement';
    }

    const colors = {
      good: 'color: #10b981',
      'needs-improvement': 'color: #f59e0b',
      poor: 'color: #ef4444',
    };

    console.log(
      `%c[Vitals] ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${rating})`,
      colors[rating as keyof typeof colors]
    );
  } else {
    // In prod: send to backend analytics endpoint (not implemented yet)
    // fetch('/api/analytics/vitals', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   headers: { 'Content-Type': 'application/json' },
    //   keepalive: true,
    // });
  }
}

/**
 * Initialize Web Vitals tracking
 * Call once from app root
 */
export function initVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
