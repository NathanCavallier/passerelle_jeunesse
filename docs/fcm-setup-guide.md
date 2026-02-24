# Guide d'installation et configuration des Notifications Push FCM

## Vue d'ensemble

Le système de notifications push Firebase Cloud Messaging (FCM) est maintenant implémenté et permet de recevoir des notifications en temps réel même quand l'application n'est pas ouverte.

## 🎯 Fonctionnalités implémentées

### ✅ Côté client (React/Next.js)

- **Service FCM** (`src/lib/fcm-service.ts`) : Gestion complète des tokens et permissions
- **Hook React** (`src/hooks/use-fcm.ts`) : Interface simple pour les composants
- **Composant UI** (`src/components/notifications/fcm-notification-settings.tsx`) : Interface utilisateur complète
- **Intégration** dans la page notifications (`src/app/dashboard/notifications/page.tsx`)

### ✅ Service Worker

- **Notifications background** (`public/firebase-messaging-sw.js`) : Gestion des notifications quand l'app est fermée
- **Actions rapides** : Répondre, Voir, Ignorer
- **Auto-focus** : Réouverture intelligente de l'application

### ✅ Types et configuration

- **Types étendus** (`src/types/firestore.ts`) : FCMTokens, NotificationPayload, etc.
- **Variables d'environnement** : Configuration VAPID et Firebase

## 📋 Étapes de configuration Firebase

### 1. Configuration FCM dans Firebase Console

1. **Générer une clé VAPID** :

   ```bash
   # Dans Firebase Console > Project Settings > Cloud Messaging
   # Cliquer sur "Web configuration" > "Generate key pair"
   ```

2. **Remplacer la clé VAPID** dans `.env.local` :

   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_ACTUAL_VAPID_KEY_HERE
   ```

3. **Mettre à jour le Service Worker** (`public/firebase-messaging-sw.js`) :

   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     // ... autres paramètres
   };
   ```

### 2. Permissions et domaine

1. **HTTPS requis** : Les notifications push nécessitent HTTPS (ou localhost en dev)
2. **Domaine autorisé** : Ajouter votre domaine dans Firebase Console > Authentication > Authorized domains

## 🛠️ Utilisation

### Dans un composant React

```tsx
import { useFCM } from '@/hooks/use-fcm';

function MyComponent() {
  const { 
    isEnabled, 
    enableNotifications, 
    onNotificationReceived,
    unreadCount
  } = useFCM();

  // Écouter les notifications
  useEffect(() => {
    onNotificationReceived((payload) => {
      console.log('Notification reçue:', payload.title);
    });
  }, []);

  return (
    <div>
      {isEnabled ? (
        <span>Notifications activées ({unreadCount} non lues)</span>
      ) : (
        <button onClick={enableNotifications}>
          Activer les notifications
        </button>
      )}
    </div>
  );
}
```

### Envoyer une notification (côté serveur)

```js
// Cloud Function ou API Route
import { getMessaging } from 'firebase-admin/messaging';

const message = {
  notification: {
    title: 'Nouvelle réservation',
    body: 'Votre trajet commence dans 1 heure'
  },
  data: {
    type: 'booking_started',
    bookingId: '123',
    url: '/dashboard/bookings/123'
  },
  token: userFCMToken
};

await getMessaging().send(message);
```

## 🎨 Interface utilisateur

Le composant `FCMNotificationSettings` offre :

- **Toggle d'activation** avec gestion des permissions
- **Statut visuel** : badges et icônes selon l'état
- **Test de notification** : bouton pour tester le système
- **Messages d'aide** contextuels selon l'état
- **Support responsive** : interface adaptée mobile/desktop

## 🔧 Événements supportés

Types de notifications configurables :

- `booking_confirmed` : Réservation confirmée
- `booking_started` : Trajet commencé
- `booking_completed` : Trajet terminé  
- `booking_cancelled` : Réservation annulée
- `message_received` : Nouveau message
- `payment_processed` : Paiement traité
- `reminder` : Rappels de trajet
- `system` : Notifications système

## 📱 Actions rapides

Le service worker supporte des boutons d'action :

- **Répondre** : Ouvre directement la conversation  
- **Voir** : Navigue vers le détail (réservation, message)
- **Ignorer** : Ferme la notification

## 🐛 Résolution de problèmes

### Permission refusée

```js
// Vérifier le statut
console.log(Notification.permission); // "granted", "denied", "default"

// Dans Chrome DevTools > Application > Notifications
// Réinitialiser les permissions si nécessaire
```

### Service Worker non enregistré

```js
// Vérifier dans DevTools > Application > Service Workers
// Le fichier firebase-messaging-sw.js doit être visible
```

### Token non généré

```js
// Vérifier la console pour les erreurs FCM
// S'assurer que VAPID_KEY est correcte
// Vérifier que le domaine est autorisé dans Firebase
```

## 🚀 Prochaines évolutions possibles

1. **Cloud Functions** : Automatiser l'envoi selon les événements Firestore
2. **Segmentation** : Cibler les notifications par profil utilisateur
3. **Analytics** : Tracking des taux d'ouverture et engagement
4. **Rich notifications** : Images, boutons avancés, cartes d'actions

## 📁 Fichiers concernés

```
src/
├── lib/fcm-service.ts                    # Service principal FCM
├── hooks/use-fcm.ts                      # Hook React
├── components/notifications/
│   └── fcm-notification-settings.tsx    # Composant UI
├── app/dashboard/notifications/page.tsx  # Page intégrée
└── types/firestore.ts                   # Types étendus

public/
└── firebase-messaging-sw.js             # Service Worker

.env.local                               # Variables d'environnement
```

---

**Status :** ✅ **Implémentation complète** - Prêt pour les tests et déploiement !
