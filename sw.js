const CACHE_NAME = 'sniper-crm-v2';
const ASSETS = [
  './',
  './index.html',
  './data.json',
  './logo.jpg',
  './manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Force activation of the new Service Worker
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Clear old caches
          }
        })
      );
    }).then(() => self.clients.claim()) // Claim control of the page immediately
  );
});

// Network-First Fetch Intercept
self.addEventListener('fetch', (e) => {
  // Only handle standard http/https schemes (avoid chrome-extension issues)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If successful network response, clone and update cache
        if (networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fall back to cache if offline/network fails
        return caches.match(e.request);
      })
  );
});
