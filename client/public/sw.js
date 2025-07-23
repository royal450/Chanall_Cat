// Service Worker for PWA functionality
const CACHE_NAME = 'channel-market-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/src/pages/dashboard.tsx',
  '/src/pages/login.tsx',
  '/src/pages/signup.tsx',
  '/src/pages/payment.tsx',
  '/src/components/navbar.tsx',
  '/src/components/footer.tsx',
  'https://cdn.jsdelivr.net/gh/royal450/Ai_Video_Gen@main/file_0000000068d8622fb0c9568dfe1b5d55.png'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});