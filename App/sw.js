const CACHE_NAME = 'school-app-v2';
const OFFLINE_URL = '/';

const STATIC_ASSETS = [
    '/',
    '/icon-192.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            for (const url of STATIC_ASSETS) {
                try {
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) throw new Error();
                    await cache.put(url, res.clone());
                } catch (e) {}
            }
        })
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
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const clone = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone).catch(() => {});
                });

                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);
                return cached || caches.match(OFFLINE_URL);
            })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow('/');
            })
    );
});