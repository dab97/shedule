const CACHE_NAME = 'rgsu-schedule-v1';

// Ресурсы для кеширования при установке
const STATIC_ASSETS = [
    '/',
    '/favicon.png',
    '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Активировать сразу после установки
    self.skipWaiting();
});

// Активация и очистка старых кешей
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Взять контроль над всеми клиентами
    self.clients.claim();
});

// Стратегия: Network First с фолбэком на кеш
self.addEventListener('fetch', (event) => {
    // Пропускаем не-GET запросы и API
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Кешируем успешные ответы
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // При ошибке сети — возвращаем из кеша
                return caches.match(event.request);
            })
    );
});
