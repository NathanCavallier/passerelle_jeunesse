/**
 * Service Worker pour PWA Passerelle Jeunesse - Parent
 * Cache offline, notifications push, background sync
 */

const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `passerelle-jeunesse-parent-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `static-parent-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-parent-v${CACHE_VERSION}`;
const DATA_CACHE_NAME = `data-parent-v${CACHE_VERSION}`;

// Pages statiques à précacher
const STATIC_ASSETS = [
  '/dashboard',
  '/dashboard/bookings',
  '/dashboard/messages',
  '/dashboard/payments',
  '/dashboard/reviews',
  '/dashboard/loyalty',
  '/dashboard/notifications',
  '/dashboard/settings',
  '/offline',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
];

// Routes API à cacher avec stratégie cache-first
const API_CACHE_ROUTES = [
  '/api/bookings',
  '/api/reviews',
  '/api/loyalty',
  '/api/availability',
];

// Routes jamais cachées
const NETWORK_ONLY_ROUTES = [
  '/api/auth',
  '/api/webhooks',
  '/api/cron',
  '/api/admin',
];

// --- INSTALLATION ---
self.addEventListener('install', (event) => {
  console.log('🔧 SW Parent: Installation en cours...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('⚠️ SW Parent: Certaines ressources statiques non cachées:', err);
        });
      }),
      self.skipWaiting(),
    ])
  );
});

// --- ACTIVATION ---
self.addEventListener('activate', (event) => {
  console.log('✅ SW Parent: Activation...');

  event.waitUntil(
    Promise.all([
      // Nettoyer anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName.startsWith('passerelle-jeunesse-parent-') ||
              cacheName.startsWith('static-parent-') ||
              cacheName.startsWith('dynamic-parent-') ||
              cacheName.startsWith('data-parent-')
            ) {
              if (
                cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== DATA_CACHE_NAME
              ) {
                console.log('🗑️ SW Parent: Suppression cache obsolète:', cacheName);
                return caches.delete(cacheName);
              }
            }
            return Promise.resolve();
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// --- STRATÉGIES DE CACHE ---

/**
 * Stale-While-Revalidate : retourne le cache immédiatement, 
 * puis met à jour en arrière-plan
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

/**
 * Network First : essaie le réseau, puis le cache en fallback
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Fallback page offline pour les navigations
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    throw error;
  }
}

/**
 * Cache First avec mise à jour réseau en arrière-plan
 */
async function cacheFirstWithUpdate(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Mise à jour en arrière-plan
  fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
    })
    .catch(() => {});

  if (cachedResponse) return cachedResponse;
  return fetch(request);
}

/**
 * Données API avec cache TTL
 */
async function apiCacheStrategy(request) {
  const cache = await caches.open(DATA_CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// --- FETCH HANDLER ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes non-HTTP(S)
  if (!url.protocol.startsWith('http')) return;

  // Ignorer les requêtes Chrome extension, etc.
  if (url.origin !== self.location.origin) return;

  // Routes network-only
  if (NETWORK_ONLY_ROUTES.some((route) => url.pathname.startsWith(route))) {
    return;
  }

  // Routes API avec cache
  if (API_CACHE_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(apiCacheStrategy(event.request));
    return;
  }

  // Pages HTML (navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Ressources statiques (JS, CSS, images)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirstWithUpdate(event.request));
    return;
  }

  // Tout le reste : stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event.request));
});

// --- NOTIFICATIONS PUSH ---
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, badge, tag, url, type } = data;

  const options = {
    body: body || 'Nouvelle notification',
    icon: icon || '/images/icons/icon-192x192.png',
    badge: badge || '/images/icons/icon-72x72.png',
    tag: tag || `notification-${Date.now()}`,
    vibrate: [200, 100, 200],
    data: { url: url || '/dashboard', type },
    actions: getNotificationActions(type),
    requireInteraction: type === 'booking_started' || type === 'mission_update',
  };

  event.waitUntil(
    self.registration.showNotification(title || 'Passerelle Jeunesse', options)
  );
});

function getNotificationActions(type) {
  switch (type) {
    case 'message_received':
      return [
        { action: 'reply', title: '💬 Répondre' },
        { action: 'view', title: '👁️ Voir' },
      ];
    case 'booking_confirmed':
    case 'booking_started':
    case 'booking_completed':
      return [
        { action: 'view', title: '📋 Voir détails' },
        { action: 'dismiss', title: '✕ Fermer' },
      ];
    case 'mission_update':
      return [
        { action: 'track', title: '📍 Suivre' },
        { action: 'view', title: '👁️ Voir' },
      ];
    case 'review_request':
      return [
        { action: 'review', title: '⭐ Évaluer' },
        { action: 'later', title: '⏰ Plus tard' },
      ];
    default:
      return [{ action: 'view', title: '👁️ Voir' }];
  }
}

// --- NOTIFICATION CLICK ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { url, type } = event.notification.data || {};
  let targetUrl = url || '/dashboard';

  switch (event.action) {
    case 'reply':
      targetUrl = '/dashboard/messages';
      break;
    case 'track':
      targetUrl = url || '/dashboard';
      break;
    case 'review':
      targetUrl = '/dashboard/reviews';
      break;
    case 'later':
    case 'dismiss':
      return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus fenêtre existante si possible
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      return self.clients.openWindow(targetUrl);
    })
  );
});

// --- BACKGROUND SYNC ---
self.addEventListener('sync', (event) => {
  console.log('🔄 SW Parent: Background sync:', event.tag);

  switch (event.tag) {
    case 'booking-sync':
      event.waitUntil(syncPendingBookings());
      break;
    case 'message-sync':
      event.waitUntil(syncPendingMessages());
      break;
    case 'review-sync':
      event.waitUntil(syncPendingReviews());
      break;
  }
});

async function syncPendingBookings() {
  try {
    const pending = await getFromIndexedDB('pending-bookings');
    for (const booking of pending) {
      await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      await removeFromIndexedDB('pending-bookings', booking.id);
    }
    console.log(`✅ SW Parent: ${pending.length} réservation(s) synchronisée(s)`);
  } catch (error) {
    console.error('❌ SW Parent: Erreur sync réservations:', error);
  }
}

async function syncPendingMessages() {
  try {
    const pending = await getFromIndexedDB('pending-messages');
    for (const message of pending) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      await removeFromIndexedDB('pending-messages', message.id);
    }
    console.log(`✅ SW Parent: ${pending.length} message(s) synchronisé(s)`);
  } catch (error) {
    console.error('❌ SW Parent: Erreur sync messages:', error);
  }
}

async function syncPendingReviews() {
  try {
    const pending = await getFromIndexedDB('pending-reviews');
    for (const review of pending) {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      await removeFromIndexedDB('pending-reviews', review.id);
    }
    console.log(`✅ SW Parent: ${pending.length} avis synchronisé(s)`);
  } catch (error) {
    console.error('❌ SW Parent: Erreur sync avis:', error);
  }
}

// --- INDEXEDDB HELPERS ---
const DB_NAME = 'passerelle-jeunesse-parent';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-bookings')) {
        db.createObjectStore('pending-bookings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-messages')) {
        db.createObjectStore('pending-messages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-reviews')) {
        db.createObjectStore('pending-reviews', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cached-data')) {
        db.createObjectStore('cached-data', { keyPath: 'key' });
      }
    };
  });
}

async function getFromIndexedDB(storeName) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function removeFromIndexedDB(storeName, id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ IndexedDB delete error:', error);
  }
}

// --- CLIENT MESSAGES ---
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_URLS':
      if (event.data.urls) {
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.addAll(event.data.urls).catch(() => {});
        });
      }
      break;
    case 'CLEAR_CACHE':
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.startsWith('dynamic-parent-') || name.startsWith('data-parent-')) {
            caches.delete(name);
          }
        });
      });
      break;
    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.source.postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
  }
});

async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      usagePercent: Math.round(((estimate.usage || 0) / (estimate.quota || 1)) * 100),
    };
  }
  return { usage: 0, quota: 0, usagePercent: 0 };
}

// --- ERROR HANDLING ---
self.addEventListener('error', (event) => {
  console.error('❌ SW Parent Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ SW Parent Unhandled rejection:', event.reason);
});
