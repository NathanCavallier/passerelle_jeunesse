/**
 * Service Worker pour PWA Passerelle Jeunesse - Accompagnateur
 * Gestion du cache offline, notifications push et background sync
 */

const CACHE_NAME = 'passerelle-jeunesse-accompanist-v1.0.0';
const STATIC_CACHE_NAME = 'static-accompanist-v1.0.0';
const DYNAMIC_CACHE_NAME = 'dynamic-accompanist-v1.0.0';

// Ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/dashboard/accompanist',
  '/dashboard/accompanist/missions',
  '/dashboard/accompanist/profile',
  '/dashboard/accompanist/messages',
  '/dashboard/accompanist/settings',
  '/manifest-accompanist.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  // CSS et JS critiques seront ajoutés automatiquement
];

// Routes API à mettre en cache avec stratégie spéciale
const API_CACHE_ROUTES = [
  '/api/bookings',
  '/api/availability',
  '/api/payments'
];

// Routes qui nécessitent une connexion (pas de cache offline)
const NETWORK_ONLY_ROUTES = [
  '/api/auth',
  '/api/webhooks',
  '/api/cron'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installation en cours...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activation en cours...');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('🗑️ SW: Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Routes Network Only (authentification, webhooks)
  if (NETWORK_ONLY_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(fetch(request));
    return;
  }

  // Routes API avec cache + réseau
  if (API_CACHE_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(cacheFirstWithNetworkFallback(request));
    return;
  }

  // Pages HTML - Network First avec cache fallback
  if (url.pathname.startsWith('/dashboard/accompanist') || request.destination === 'document') {
    event.respondWith(networkFirstWithCacheFallback(request));
    return;
  }

  // Ressources statiques (images, CSS, JS) - Cache First
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(cacheFirstWithNetworkUpdate(request));
    return;
  }

  // Autres requêtes - stratégie par défaut
  event.respondWith(networkFirstWithCacheFallback(request));
});

// Stratégie Cache First avec mise à jour réseau
async function cacheFirstWithNetworkUpdate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Retourner la réponse cachée et mettre à jour en arrière-plan
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
    }).catch(() => {
      // Ignorer les erreurs de mise à jour en arrière-plan
    });
    
    return cachedResponse;
  }

  // Pas de cache, essayer le réseau
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Retourner une réponse par défaut si possible
    if (request.destination === 'image') {
      return new Response('', { status: 200, statusText: 'Image not available offline' });
    }
    throw error;
  }
}

// Stratégie Network First avec cache en fallback
async function networkFirstWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Mettre en cache les réponses réussies
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 SW: Mode hors ligne, utilisation du cache pour:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Page d'erreur offline pour les pages HTML
    if (request.destination === 'document') {
      return caches.match('/dashboard/accompanist?offline=true');
    }

    throw error;
  }
}

// Stratégie Cache First avec fallback réseau
async function cacheFirstWithNetworkFallback(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('📬 SW: Notification push reçue');
  
  const options = {
    body: 'Nouvelle mission disponible',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-96x96.png',
    tag: 'mission-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Voir la mission',
        icon: '/images/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/images/icons/icon-96x96.png'
      }
    ],
    data: {
      url: '/dashboard/accompanist/missions'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification('Passerelle Jeunesse', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW: Clic sur notification');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/dashboard/accompanist';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Chercher une fenêtre existante avec l'URL cible
      for (const client of clientList) {
        if (client.url.includes('dashboard/accompanist') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // Ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Sync pour les données en attente
self.addEventListener('sync', (event) => {
  console.log('🔄 SW: Background sync:', event.tag);
  
  if (event.tag === 'mission-status-sync') {
    event.waitUntil(syncMissionStatus());
  }
  
  if (event.tag === 'photo-upload-sync') {
    event.waitUntil(syncPhotoUploads());
  }
});

// Synchroniser les statuts de mission en attente
async function syncMissionStatus() {
  try {
    // Récupérer les données en attente depuis IndexedDB
    const pendingUpdates = await getPendingStatusUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(`/api/bookings/${update.bookingId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });

        if (response.ok) {
          await removePendingStatusUpdate(update.id);
          console.log('✅ SW: Statut synchronisé:', update.bookingId);
        }
      } catch (error) {
        console.error('❌ SW: Erreur sync statut:', error);
      }
    }
  } catch (error) {
    console.error('❌ SW: Erreur background sync:', error);
  }
}

// Synchroniser les uploads de photos en attente
async function syncPhotoUploads() {
  try {
    const pendingUploads = await getPendingPhotoUploads();
    
    for (const upload of pendingUploads) {
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('bookingId', upload.bookingId);
        formData.append('photoType', upload.photoType);

        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          await removePendingPhotoUpload(upload.id);
          console.log('✅ SW: Photo synchronisée:', upload.bookingId);
        }
      } catch (error) {
        console.error('❌ SW: Erreur sync photo:', error);
      }
    }
  } catch (error) {
    console.error('❌ SW: Erreur sync photos:', error);
  }
}

// Fonctions utilitaires IndexedDB (implémentation simplifiée)
async function getPendingStatusUpdates() {
  // TODO: Implémenter avec IndexedDB
  return [];
}

async function removePendingStatusUpdate(id) {
  // TODO: Implémenter avec IndexedDB
}

async function getPendingPhotoUploads() {
  // TODO: Implémenter avec IndexedDB
  return [];
}

async function removePendingPhotoUpload(id) {
  // TODO: Implémenter avec IndexedDB
}

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('❌ SW: Erreur:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ SW: Promesse rejetée:', event.reason);
});