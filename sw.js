// sw.js - Service Worker para Modo Offline y PWA
const CACHE_NAME = 'lee-tiktok-v2.1'; // Incrementado a V3

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './datos.js',
    './manifest.json',
    './icon.png',
    // Audios (Asegúrate de que estas rutas sean correctas y los archivos existan)
    './audios/bocina.mp3',
    './audios/victoria.mp3',
    './audios/grillo.mp3',
    // Memes (Añade los memes que tengas para que funcionen offline)
    './memes/error.jpg',
    './memes/trampa.jpg',
    './memes/acierto1.jpg'
];

// Instalación: Guardar archivos en caché
self.addEventListener('install', (event) => {
    // Forzar la activación inmediata
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Cacheando archivos principales');
                // AHora sí ejecutamos el cacheo
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.error('SW: Error en install pre-cache', err))
    );
});

// Activación: Limpiar cachés viejos
self.addEventListener('activate', (event) => {
    // Tomar control inmediato de los clientes
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

// Estrategia de Cache: Network First, falling back to Cache
// Esto asegura que si hay internet traiga lo nuevo, y si no, use lo guardado.
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones que no sean GET (como las de analytics si tuvieras)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la red funciona, guardamos/actualizamos la copia en caché
                if(response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si la red falla, buscamos en la caché
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Si no está en caché ni en red, podrías devolver una página de error por defecto aquí
                    });
            })
    );
});
