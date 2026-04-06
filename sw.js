const CACHE = 'pendu-v1.4.8';

const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './Menu.png',
  './Game.png',
  './01.mp3',
  './02.mp3',
  './03.mp3',
  './menu.mp3',
  './Motmagique.mp3',
  './Motmagique.gif'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html', { ignoreSearch: true })
        .then((response) =>
          response || fetch(e.request).catch(() => new Response('', { status: 404 }))
        )
    );
    return;
  }

  // codes.js : réseau d'abord, cache en secours
  if (e.request.url.includes('codes.js')) {
    e.respondWith(
      fetch(new Request(e.request, { cache: 'reload' }))
        .then((response) =>
          caches.open(CACHE).then((cache) => {
            cache.put(e.request, response.clone());
            return response;
          })
        )
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then((response) =>
        response || fetch(e.request).catch(() => new Response('', { status: 404 }))
      )
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'getVersion') {
    e.source.postMessage(CACHE);
  }
});
