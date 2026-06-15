const CACHE_NAME = 'quran-app-v1';
const CACHE_VERSION = 1;

// Files to cache for offline use
const STATIC_ASSETS = [
  './',
  './index.html',
  './reader.html',
  './audio_home.html',
  './manifest.json',
  './quran_data.json',
  './JF-Flat-regular.ttf',
  './background.jpg',
  // All surah pages
  ...Array.from({length: 114}, (_, i) => `./${i + 1}.html`)
];

// ─── INSTALL: cache static assets ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      // Cache in chunks to avoid timeout
      const chunks = [];
      for (let i = 0; i < STATIC_ASSETS.length; i += 20) {
        chunks.push(STATIC_ASSETS.slice(i, i + 20));
      }
      return chunks.reduce((promise, chunk) => {
        return promise.then(() =>
          cache.addAll(chunk).catch(err => {
            console.warn('[SW] Failed to cache some assets:', err);
          })
        );
      }, Promise.resolve());
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: clean old caches ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: serve from cache, fallback to network ───
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip audio files from cache (too large, stream them)
  if (url.pathname.includes('/audio/')) {
    event.respondWith(fetch(event.request).catch(() =>
      new Response('Audio not available offline', { status: 503 })
    ));
    return;
  }

  // Cache-first strategy for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache valid responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ─── MESSAGE: force update ───
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
