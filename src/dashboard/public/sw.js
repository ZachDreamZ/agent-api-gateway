// Service worker for Agent API Gateway.
// Never cache-first HTML or hashed JS/CSS bundles — that freezes users on deleted chunk hashes after deploy.
const CACHE_NAME = 'agent-api-gateway-v2';
const PRECACHE = [
  '/manifest.json',
  '/brand/agent-api-gateway-mark-256.png',
  '/brand/agent-api-gateway-mark-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  );
  self.clients.claim();
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

function isHashedAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\.(?:js|css|map)$/i.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Always network-first for HTML and app shells so deploys take effect.
  if (isNavigationRequest(request) || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || Response.error();
        }),
    );
    return;
  }

  // Never intercept hashed build assets — browser cache + immutable headers are enough.
  if (isHashedAsset(url)) {
    return;
  }

  // Cache-first only for stable brand/static files.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
        return response;
      });
    }),
  );
});
