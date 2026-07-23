import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsConfig {
  enabled: boolean;
  debug?: boolean;
}

// Simple analytics tracker
class Analytics {
  private config: AnalyticsConfig;
  private sessionId: string;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  trackPageView(path: string) {
    if (!this.config.enabled) return;

    const data = {
      event: 'pageview',
      path,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };

    if (this.config.debug) {
      console.log('[Analytics] Page view:', data);
    }

    // Send to backend analytics endpoint (placeholder)
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.config.enabled) return;

    const data = {
      event: eventName,
      properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    if (this.config.debug) {
      console.log('[Analytics] Event:', data);
    }

    // Send to backend analytics endpoint (placeholder)
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
  }

  trackError(error: Error, context?: Record<string, any>) {
    if (!this.config.enabled) return;

    const data = {
      event: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    if (this.config.debug) {
      console.log('[Analytics] Error:', data);
    }

    // Send to backend analytics endpoint (placeholder)
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
  }

  trackTiming(category: string, variable: string, value: number) {
    if (!this.config.enabled) return;

    const data = {
      event: 'timing',
      category,
      variable,
      value,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    if (this.config.debug) {
      console.log('[Analytics] Timing:', data);
    }

    // Send to backend analytics endpoint (placeholder)
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
  }
}

// Create singleton instance
export const analytics = new Analytics({
  enabled: import.meta.env.PROD, // Only track in production
  debug: import.meta.env.DEV, // Debug logging in development
});

// Hook to track page views
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location.pathname]);
};

// Performance monitoring
export const trackWebVitals = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Track Core Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            analytics.trackTiming('WebVitals', 'LCP', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            analytics.trackTiming('WebVitals', 'FID', fidEntry.processingStart - fidEntry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });

      // Track CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        analytics.trackTiming('WebVitals', 'CLS', clsValue);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }
};
