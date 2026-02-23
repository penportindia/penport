importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyDCGsnpr6SVf7rbSnRi2ipt5suZD99B2u4",
    databaseURL: "https://student-database-1882d-default-rtdb.firebaseio.com",
    projectId: "student-database-1882d",
    messagingSenderId: "420379838808",
    appId: "1:420379838808:web:bb4206ea2fed40f3907d2d"
});

const messaging = firebase.messaging();
const CACHE_NAME = 'school-app-v5';
const STATIC_ASSETS = ['/Index.html'];

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
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
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

                const responseClone = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseClone));

                return response;
            })
            .catch(() =>
                caches.match(event.request)
                    .then(res => res || caches.match('/Index.html'))
            )
    );
});

messaging.setBackgroundMessageHandler(payload => {
    if (!payload.notification) return;

    return self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: payload.data || {}
    });
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