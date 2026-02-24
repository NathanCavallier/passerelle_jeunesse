/**
 * Service Worker pour Firebase Cloud Messaging (FCM)
 * Gère les notifications push en arrière-plan
 */

// Import des scripts Firebase pour service workers
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (doit correspondre à celle du client)
const firebaseConfig = {
  apiKey: "AIzaSyC...", // À remplacer par la vraie clé
  authDomain: "passerelle-jeunesse-2026.firebaseapp.com",
  projectId: "passerelle-jeunesse-2026",
  storageBucket: "passerelle-jeunesse-2026.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456..."
};

// Initialiser Firebase dans le service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Configuration des actions de notification
const NOTIFICATION_ACTIONS = {
  VIEW: 'view',
  REPLY: 'reply',
  DISMISS: 'dismiss'
};

/**
 * Gestion des messages en arrière-plan
 */
messaging.onBackgroundMessage((payload) => {
  console.log('📱 Message FCM reçu en arrière-plan:', payload);

  const { notification, data } = payload;
  
  // Configuration par défaut de la notification
  const notificationTitle = notification?.title || 'Passerelle Jeunesse';
  const notificationOptions = {
    body: notification?.body || 'Nouvelle notification',
    icon: notification?.icon || '/images/notification-icon.png',
    badge: '/images/badge-icon.png',
    tag: data?.type || 'general',
    
    // Options avancées
    requireInteraction: data?.priority === 'high',
    silent: false,
    renotify: true,
    
    // Données personnalisées
    data: {
      ...data,
      timestamp: Date.now(),
      clickAction: data?.url || '/dashboard'
    },
    
    // Actions rapides
    actions: getNotificationActions(data?.type)
  };

  // Badge de compteur
  if (data?.unreadCount) {
    notificationOptions.badge = `/images/badge-${data.unreadCount}.png`;
  }

  // Vibration pour mobile
  if ('vibrate' in navigator) {
    notificationOptions.vibrate = [200, 100, 200];
  }

  // Afficher la notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Gestion des clics sur notifications
 */
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Clic sur notification:', event);

  const { notification, action } = event;
  const data = notification.data || {};

  // Fermer la notification
  notification.close();

  // Gérer les actions
  handleNotificationAction(action, data, event);
});

/**
 * Gestion de la fermeture des notifications
 */
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification fermée:', event.notification.tag);
  
  // Optionnel: analyser les fermetures pour améliorer l'engagement
  if (event.notification.data?.trackClose) {
    // Envoyer analytics
  }
});

/**
 * Retourne les actions disponibles selon le type de notification
 */
function getNotificationActions(type) {
  const baseActions = [
    {
      action: NOTIFICATION_ACTIONS.DISMISS,
      title: 'Ignorer',
      icon: '/images/action-close.png'
    }
  ];

  switch (type) {
    case 'message_received':
      return [
        {
          action: NOTIFICATION_ACTIONS.REPLY,
          title: 'Répondre',
          icon: '/images/action-reply.png'
        },
        {
          action: NOTIFICATION_ACTIONS.VIEW,
          title: 'Voir',
          icon: '/images/action-view.png'
        },
        ...baseActions
      ];

    case 'booking_confirmed':
    case 'booking_started':
    case 'booking_completed':
      return [
        {
          action: NOTIFICATION_ACTIONS.VIEW,
          title: 'Voir détails',
          icon: '/images/action-view.png'
        },
        ...baseActions
      ];

    case 'reminder':
      return [
        {
          action: NOTIFICATION_ACTIONS.VIEW,
          title: 'Voir',
          icon: '/images/action-calendar.png'
        },
        ...baseActions
      ];

    default:
      return [
        {
          action: NOTIFICATION_ACTIONS.VIEW,
          title: 'Ouvrir',
          icon: '/images/action-view.png'
        },
        ...baseActions
      ];
  }
}

/**
 * Gestion des actions sur les notifications
 */
function handleNotificationAction(action, data, event) {
  switch (action) {
    case NOTIFICATION_ACTIONS.VIEW:
      openApp(data.clickAction || '/dashboard');
      break;

    case NOTIFICATION_ACTIONS.REPLY:
      if (data.type === 'message_received' && data.conversationId) {
        openApp(`/dashboard/messages?conversation=${data.conversationId}&reply=true`);
      } else {
        openApp('/dashboard/messages');
      }
      break;

    case NOTIFICATION_ACTIONS.DISMISS:
      // Ne rien faire, notification déjà fermée
      break;

    default:
      // Clic sur le corps de la notification
      openApp(data.clickAction || '/dashboard');
      break;
  }
}

/**
 * Ouvre l'application ou focus la fenêtre existante
 */
async function openApp(url) {
  try {
    // Chercher une fenêtre existante
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Si une fenêtre est déjà ouverte, la mettre en focus
    for (const client of clients) {
      if (client.url.includes(self.location.origin)) {
        // Naviguer vers la bonne URL si différente
        if (!client.url.includes(url)) {
          client.postMessage({
            type: 'NAVIGATE',
            url: url
          });
        }
        return client.focus();
      }
    }

    // Sinon, ouvrir une nouvelle fenêtre
    return self.clients.openWindow(url);
  } catch (error) {
    console.error('Erreur ouverture app:', error);
    // Fallback: ouvrir nouvelle fenêtre
    return self.clients.openWindow(url);
  }
}

/**
 * Gestion des messages du client
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      // Forcer l'activation du nouveau service worker
      self.skipWaiting();
      break;

    case 'UPDATE_BADGE':
      // Mettre à jour le badge (si supporté)
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(payload.count || 0);
      }
      break;

    case 'CLEAR_NOTIFICATIONS':
      // Effacer toutes les notifications
      self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
      break;

    default:
      console.log('Message SW non géré:', type);
  }
});

/**
 * Installation du service worker
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker FCM installé');
  self.skipWaiting();
});

/**
 * Activation du service worker
 */
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker FCM activé');
  event.waitUntil(self.clients.claim());
});

/**
 * Nettoyage périodique des anciennes notifications
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-notifications') {
    event.waitUntil(cleanupOldNotifications());
  }
});

/**
 * Nettoie les notifications anciennes (plus de 24h)
 */
async function cleanupOldNotifications() {
  try {
    const notifications = await self.registration.getNotifications();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures

    notifications.forEach(notification => {
      const timestamp = notification.data?.timestamp || 0;
      if (now - timestamp > maxAge) {
        notification.close();
      }
    });

    console.log('🧹 Nettoyage notifications anciennes terminé');
  } catch (error) {
    console.error('Erreur nettoyage notifications:', error);
  }
}