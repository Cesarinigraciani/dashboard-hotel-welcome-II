self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('dashboard-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/main.js',
        '/styles.css',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
