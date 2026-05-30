// Minimal Service Worker to satisfy PWA installability requirements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch handler is enough for PWA criteria.
  // We don't intercept/cache pages to avoid conflict with Next.js router.
  return;
});
