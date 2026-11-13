// alyxfiles Service Worker
// Cache name — bump version to force cache update
const CACHE_NAME = 'alyxfiles-v2';

// Static assets to cache on install
const CACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './offline.html',
  './manifest.json',
  // Assets
  './assets/logo.png',
  './assets/alyxfiles-icon.png',
  './assets/faizanali_creator.png',
  // PDF, Image & Utility Libraries
  './lib/pdf-lib.min.js',
  './lib/pdf.min.js',
  './lib/pdf.worker.min.js',
  './lib/jszip.min.js',
  // Word & Document Conversion Libraries
  './lib/mammoth.browser.min.js',
  './lib/docx.umd.min.js',
  './lib/jspdf.umd.min.js',
  './lib/html2canvas.min.js'
];

// ── Install: pre-cache all static assets ────────────────────────────────
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_ASSETS);
    }).then(function () {
      // Activate immediately
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean up stale caches ─────────────────────────────────────
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    }).then(function () {
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(function () {
      // Notify all clients that a new SW version is active
      return self.clients.matchAll({ type: 'window' });
    }).then(function (clients) {
      clients.forEach(function (client) {
        client.postMessage({ type: 'SW_UPDATED' });
      });
    })
  );
});

// ── Fetch: routing strategy ─────────────────────────────────────────────
self.addEventListener('fetch', function (event) {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Never cache blob: or data: URLs (used for user files)
  if (req.url.startsWith('blob:') || req.url.startsWith('data:')) return;

  // Navigation requests (HTML pages): Network-first, fallback to cache, fallback to offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (networkResponse) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, clone);
          });
          return networkResponse;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match('./offline.html');
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, libraries): Cache-first, fallback to network
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;

      // Not in cache — fetch from network and cache for next time
      return fetch(req).then(function (networkResponse) {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, clone);
          });
        }
        return networkResponse;
      }).catch(function () {
        return new Response('Resource unavailable offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// ── Message handler ─────────────────────────────────────────────────────
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
