```js
const CACHE = 'pendu-v1.0.8';

const FILES = [
  '/',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  '01.mp3',
  '02.mp3',
  '03.mp3',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'vid/1.mp4',
  'vid/2.mp4',
  'vid/3.mp4',
  'vid/4.mp4',
  'vid/5.mp4',
  'vid/6.mp4',
  ];

// INSTALL
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(
        FILES.map(f => new Request(f, { cache: 'reload' }))
      );
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE; })
          .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true, ignoreVary: true })
      .then(function(response) {
        return response || fetch(e.request).catch(() => {
          return new Response('', { status: 404 });
        });
      })
  );
});
```
