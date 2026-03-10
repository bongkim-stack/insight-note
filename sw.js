const CACHE_NAME = 'insight-notes-v3';
const ASSETS = [
    '/index.html',
    '/',
    '/manifest.json'
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
    const url = event.request.url;

    // 1. Firebase Auth 및 소셜 로그인 관련 요청은 절대 캐싱하지 않고 네트워크로 직접 전달
    if (
        url.includes('firebaseapp.com/__/auth/') ||
        url.includes('googleapis.com') ||
        url.includes('firebaseio.com') ||
        url.includes('accounts.google.com') ||
        url.includes('web.app')
    ) {
        return; // 서비스 워커가 개입하지 않음 (네트워크로 직접 이동)
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 네트워크 성공 시 해당 응답을 캐시에 저장(업데이트)하고 반환
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // 오프라인이거나 네트워크 실패 시 캐시에서 반환
                return caches.match(event.request).then(res => res || caches.match('/index.html'));
            })
    );
});
