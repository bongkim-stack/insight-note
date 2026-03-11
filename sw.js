// 서비스 워커 v5 - 강제 캐시 정리 및 해제
// 모든 캐시를 삭제하고 서비스 워커를 해제합니다.

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => caches.delete(key)));
        }).then(() => {
            console.log('[SW] All caches cleared');
            return self.clients.claim();
        })
    );
});

// 모든 요청을 네트워크로 직접 전달 (캐싱 완전 비활성화)
self.addEventListener('fetch', event => {
    // 서비스 워커가 개입하지 않음 - 브라우저가 직접 네트워크 요청
    return;
});
