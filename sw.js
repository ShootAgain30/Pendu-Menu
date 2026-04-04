const CACHE = 'pendu-v1.3.7';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'Menu.png',
  'Game.png',
  '01.mp3',
  '02.mp3',
  '03.mp3',
  'menu.mp3',
  'Motmagique.mp3',
  'Motmagique.gif'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('index.html', { ignoreSearch: true, ignoreVary: true })
        .then(function(response) {
          return response || fetch(e.request).catch(function() {
            return new Response('', { status: 404 });
          });
        })
    );
    return;
  }

  // codes.js : toujours essayer le réseau en premier, cache en fallback
  if (e.request.url.includes('codes.js')) {
    e.respondWith(
      fetch(new Request(e.request, { cache: 'reload' }))
        .then(function(response) {
          return caches.open(CACHE).then(function(cache) {
            cache.put(e.request, response.clone());
            return response;
          });
        })
        .catch(function() {
          return caches.match(e.request);
        })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true, ignoreVary: true })
      .then(function(response) {
        return response || fetch(e.request).catch(function() {
          return new Response('', { status: 404 });
        });
      })
  );
});

self.addEventListener('message', function(e) {
  if (e.data === 'getVersion') {
    e.source.postMessage(CACHE);
  }
});
