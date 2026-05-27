const CACHE_NAME = 'lee-tiktok-v1';
const urlsToCache = ['./', './index.html', './style.css', './app.js', './data.json', './icono.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

// Interceptor inteligente (Guarda los audios y memes sobre la marcha)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response; // Si ya lo tiene, lo saca del caché offline
      
      // Si no lo tiene, lo busca en internet/local y LO GUARDA para la próxima
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
