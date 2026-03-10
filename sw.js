const CACHE_NAME = 'insight-notes-v2';
const ASSETS = [
    '/index.html',
    '/'
];

self.addEventListener('install', event => {
    // 새 서비스 워커 즉시 대기 상태 넘기기
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    // 이전 캐시 지우기
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 네트워크 우선 전략으로 변경: 최신 코드를 받도록
                return fetch(event.request).catch(() => {
                    return response || caches.match('/index.html');
                });
            })
    );
});
