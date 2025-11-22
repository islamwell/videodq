// Service Worker for VideoDQ - Advanced PWA Features
const VERSION = 'v2.0.0';
const CACHE_NAME = `videodq-${VERSION}`;
const DATA_CACHE = `videodq-data-${VERSION}`;
const IMAGE_CACHE = `videodq-images-${VERSION}`;
const VIDEO_CACHE = `videodq-videos-${VERSION}`;

// Assets to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// API endpoints to cache with network-first strategy
const API_CACHE_URLS = [
  '/api/videos',
  '/api/playlists'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version:', VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating version:', VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== DATA_CACHE &&
                cacheName !== IMAGE_CACHE &&
                cacheName !== VIDEO_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DATA_CACHE));
    return;
  }

  // Images - Cache First strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Videos - Cache First with size limit
  if (request.destination === 'video') {
    event.respondWith(cacheFirstStrategy(request, VIDEO_CACHE, 50 * 1024 * 1024)); // 50MB limit
    return;
  }

  // Static assets - Stale While Revalidate
  event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME));
});

/**
 * Network First Strategy
 * Try network first, fallback to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, trying cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(request, cacheName, sizeLimit = null) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Check size limit for videos
    if (sizeLimit && networkResponse.headers.get('content-length')) {
      const size = parseInt(networkResponse.headers.get('content-length'));
      if (size > sizeLimit) {
        return networkResponse; // Don't cache large files
      }
    }

    // Cache the response
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Cache and network both failed:', error);
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    console.log('[ServiceWorker] Background update failed:', request.url);
  });

  return cachedResponse || networkPromise;
}

// Background Sync - for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-watch-progress') {
    event.waitUntil(syncWatchProgress());
  }

  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncWatchProgress() {
  // TODO: Implement syncing watch progress when back online
  console.log('[ServiceWorker] Syncing watch progress...');
}

async function syncFavorites() {
  // TODO: Implement syncing favorites when back online
  console.log('[ServiceWorker] Syncing favorites...');
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');

  const options = {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  let title = 'VideoDQ';
  let body = 'You have a new notification';

  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    body = data.body || body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      ...options
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if window is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler for communication with clients
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Periodic background sync (for modern browsers)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  console.log('[ServiceWorker] Periodic content update');
  // TODO: Fetch latest videos and cache them
}
