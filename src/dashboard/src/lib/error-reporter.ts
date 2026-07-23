/**
 * Error Reporter
 * Sends critical errors to backend for monitoring in production
 * In dev: logs to console only
 */

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

let errorQueue: ErrorReport[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

const FLUSH_DELAY = 2000; // Batch errors over 2s
const MAX_QUEUE_SIZE = 10;

async function flushErrorQueue() {
  if (errorQueue.length === 0) return;

  const errors = [...errorQueue];
  errorQueue = [];

  try {
    await fetch('/api/frontend-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors }),
      keepalive: true,
    });
  } catch (err) {
    // Silently fail - don't create error loops
    console.warn('[ErrorReporter] Failed to send error batch', err);
  }
}

function scheduleFlush() {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushErrorQueue, FLUSH_DELAY);
}

export function reportError(error: Error, componentStack?: string) {
  const isDev = import.meta.env.DEV;

  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    console.error('[ErrorReporter]', {
      message: report.message,
      stack: report.stack,
      component: componentStack,
    });
    return;
  }

  // Production: batch and send to backend
  errorQueue.push(report);

  if (errorQueue.length >= MAX_QUEUE_SIZE) {
    // Flush immediately if queue is full
    if (flushTimeout) clearTimeout(flushTimeout);
    flushErrorQueue();
  } else {
    scheduleFlush();
  }
}

/**
 * Report unhandled promise rejections
 */
export function initErrorReporter() {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    reportError(error);
  });

  // Flush any pending errors before page unload
  window.addEventListener('beforeunload', () => {
    if (errorQueue.length > 0) {
      flushErrorQueue();
    }
  });
}
