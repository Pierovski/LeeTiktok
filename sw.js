const CACHE_NAME = 'lee-tiktok-v5.7-dev';

self.addEventListener('install', (event) => {
    // Instala inmediatamente el nuevo Service Worker
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Toma el control de la app al instante
    event.waitUntil(self.clients.claim());
    
    // Borra CUALQUIER caché vieja para obligar a descargar tu código nuevo
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Estrategia Red Primero: Siempre busca tus cambios más recientes
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Solo si no hay internet (offline), carga lo guardado
                return caches.match(event.request);
            })
    );
});
