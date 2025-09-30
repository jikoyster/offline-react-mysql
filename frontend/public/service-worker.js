// Very small service worker: cache shell and respond from cache.
const CACHE = 'offline-sync-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/index.js',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((r) => r || fetch(evt.request))
  );
});