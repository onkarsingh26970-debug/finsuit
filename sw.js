const CACHE = 'finsuite-v5';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

// Install: pre-cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// NETWORK-FIRST: always try network, fall back to cache if offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Got fresh response — update cache too
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(e.request).then(r => r || caches.match('./index.html'));
      })
  );
});
