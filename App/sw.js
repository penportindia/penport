const CACHE_NAME = 'school-app-v1';
const OFFLINE_URL = '/Index.html';
const STATIC_ASSETS = [
    '/Index.html',
    '/icon-192.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => key !== CACHE_NAME && caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                return response;
            })
            .catch(() => caches.match(event.request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});