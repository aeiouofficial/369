// Service Worker for 613 Portal v2 PWA
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = '369-portal-' + CACHE_VERSION;
const AUDIO_CACHE = '369-audio-cache';

// Assets to cache immediately
const STATIC_ASSETS = [
    './',
    './WEBSiTE v2 - 613-portal-v2.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[SW] Cache failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('369-portal-') && name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip cross-origin requests (except CDN assets)
    if (url.origin !== location.origin && !url.hostname.includes('cdn.jsdelivr.net')) {
        return;
    }
    
    // Audio files - cache on demand
    if (url.pathname.includes('.mp3') || url.pathname.includes('audio.')) {
        event.respondWith(
            caches.open(AUDIO_CACHE)
                .then(cache => {
                    return cache.match(request)
                        .then(response => {
                            if (response) {
                                console.log('[SW] Serving audio from cache:', url.pathname);
                                return response;
                            }
                            
                            return fetch(request)
                                .then(networkResponse => {
                                    cache.put(request, networkResponse.clone());
                                    return networkResponse;
                                })
                                .catch(() => {
                                    console.log('[SW] Audio unavailable offline');
                                    return new Response('Audio unavailable offline', {
                                        status: 503,
                                        statusText: 'Service Unavailable'
                                    });
                                });
                        });
                })
        );
        return;
    }
    
    // Static assets - cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    console.log('[SW] Serving from cache:', url.pathname);
                    return response;
                }
                
                console.log('[SW] Fetching from network:', url.pathname);
                return fetch(request)
                    .then(networkResponse => {
                        // Cache successful GET requests
                        if (request.method === 'GET' && networkResponse.status === 200) {
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, networkResponse.clone()));
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('[SW] Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('./');
                        }
                        
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting');
        self.skipWaiting();
    }
});

// Background sync for analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    // Placeholder for future analytics sync
    console.log('[SW] Syncing analytics data');
}

// Push notifications (placeholder for future)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '613 Portal Update',
        icon: './icon-192.png',
        badge: './badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('613 Portal', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});

console.log('[SW] Service Worker script loaded');
