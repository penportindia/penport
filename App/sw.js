const CACHE_NAME = 'school-app-v2'; // Version badlate rahein updates ke liye
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    'https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/font/lucide.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// INSTALL: Assets ko cache mein dalna
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting(); // Naye SW ko turant activate karne ke liye
});

// ACTIVATE: Purane cache ko delete karna (V. Important)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// FETCH: Network First Strategy (School Apps ke liye best)
// Pehle internet se try karo, nahi toh cache se dikhao
self.addEventListener('fetch', event => {
    // Sirf GET requests handle karein
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(networkRes => {
                // Agar internet hai, toh cache update karo aur result bhejo
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkRes.clone());
                    return networkRes;
                });
            })
            .catch(() => {
                // Agar internet nahi hai, toh cache check karo
                return caches.match(event.request).then(fallbackRes => {
                    return fallbackRes || caches.match('/index.html'); // Offline hone par home page
                });
            })
    );
});
