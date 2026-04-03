const CACHE_NAME = 'basha-biryani-prod-v7'; // Incremented v7
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/favicon-48.png',
  '/apple-touch-icon.png',
  '/assets/logo.webp',
  '/logo-min.webp',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - skip waiting to ensure new SW takes over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Skip caching for development, API calls, and uploads
  // We want these to always be fresh from the API
  if (
    url.hostname === 'localhost' || 
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/uploads')
  ) {
    return;
  }

  // Strategy: Network First for HTML/Documents, Cache First for Assets (JS/CSS/Local Images)
  const isDocument = event.request.destination === 'document';

  if (isDocument) {
    // Network First: Always try to get the latest HTML/UI first
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache First: Static Assets serve from cache for speed
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          // Robust check: Only cache successful responses that ARE NOT HTML 
          // (to prevent caching SPA fallbacks as images/assets)
          const contentType = networkResponse.headers.get('content-type');
          if (
            networkResponse.status === 200 && 
            contentType && 
            !contentType.includes('text/html')
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
