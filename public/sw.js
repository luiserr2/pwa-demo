const CACHE_NAME = 'sisbirceca-pwa-v3';
const STATIC_ASSETS = [
  '/login',
  '/campo',
  '/captura',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Las APIs nunca se sirven desde caché: los datos operativos deben ser siempre los reales.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  // Network-First para navegación; sin red se sirve la página cacheada ignorando el query string
  // (p. ej. /captura?reporteId=... resuelve contra /captura).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copia = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(url.pathname, copia));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/login');
          })
        )
    );
    return;
  }

  // Cache-First para recursos estáticos del mismo origen
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
