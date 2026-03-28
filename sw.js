const CACHE = 'pendu-v1.1.4';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
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
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true, ignoreVary: true })
      .then(function(response) {
        return response || fetch(e.request).catch(function() {
          return new Response('', { status: 404 });
        });
      })
  );
});
