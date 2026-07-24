import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { initVitals } from './lib/vitals';
import { initErrorReporter } from './lib/error-reporter';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Track Core Web Vitals
initVitals();

// Report unhandled errors
initErrorReporter();

const CHUNK_RELOAD_KEY = 'agentapi:chunk-reload';

function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? `${error.name} ${error.message}`
        : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed|ChunkLoadError|error loading dynamically imported module/i.test(
    message,
  );
}

function hardReloadOnceForStaleChunk(error: unknown) {
  if (!isChunkLoadError(error) || typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1') return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  } catch {
    // sessionStorage may be blocked; still attempt one reload path below.
  }
  window.location.reload();
}

// Recover from stale deploys where an old shell points at deleted hashed chunks.
window.addEventListener('error', (event) => {
  hardReloadOnceForStaleChunk(event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  hardReloadOnceForStaleChunk(event.reason);
});
window.addEventListener('load', () => {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // ignore
  }
});

// Register service worker for offline brand assets only.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update().catch(() => undefined);
      })
      .catch(() => {
        // Silent fail - service worker is optional
      });
  });
}
