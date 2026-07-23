import os

sw_code = '''// Service Worker for Agent API Gateway
const CACHE_NAME = 'agent-api-gateway-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/brand/agent-api-gateway-mark-256.png',
  '/brand/agent-api-gateway-mark-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
'''

with open('src/dashboard/public/sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_code)

print('Created service worker sw.js')
