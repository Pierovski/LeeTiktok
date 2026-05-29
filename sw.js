// sw.js - Service Worker para Modo Offline y PWA
const CACHE_NAME = 'lee-tiktok-v4.1'; // Incrementado a V4

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './datos.js',
    './manifest.json',
    './icon.png',
    './audios/bocina.mp3',
    './audios/victoria.mp3',
    './audios/grillo.mp3',
    './memes/error.jpg',
    './memes/trampa.jpg',
    './memes/acierto1.jpg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Cacheando archivos principales V4');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.error('SW: Error en install pre-cache', err))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Borrando caché vieja', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if(response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                    });
            })
    );
});
