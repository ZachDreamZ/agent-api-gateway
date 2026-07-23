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

// Register service worker for offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - service worker is optional
    });
  });
}