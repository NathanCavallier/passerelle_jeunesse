# Système de Suivi de Mission en Temps Réel

## Vue d'ensemble

Le système de suivi de mission permet aux parents de suivre en temps réel le déroulement des trajets de leurs enfants, avec des mises à jour de statut, des photos de confirmation et une visualisation chronologique complète.

## Architecture

### Composants développés

#### 1. Types et Interfaces (`src/types/firestore.ts`)

**MissionStatusUpdate**

```typescript
interface MissionStatusUpdate {
  status: MissionStatus;
  updatedAt: Timestamp;
  location?: LocationPoint;
  photoURL?: string;
  notes?: string;
  updatedBy: string; // ID de l'accompagnateur
}
```

**SimplifiedMissionTracking**

```typescript
interface SimplifiedMissionTracking {
  currentStatus: MissionStatus;
  statusHistory: MissionStatusUpdate[];
  departurePhoto?: string;
  arrivalPhoto?: string;
  lastUpdateAt?: Timestamp;
}
```

**Statuts de mission disponibles**

- `scheduled` - Mission programmée (pas encore démarrée)
- `en_route_to_pickup` - Accompagnateur en route vers le point de départ
- `waiting_at_pickup` - Accompagnateur sur place (attente)
- `picked_up` - Jeune pris en charge (photo de départ recommandée)
- `in_transit` - En trajet vers la destination
- `arriving_soon` - Arrivée imminente
- `delivered` - Jeune livré à destination (photo d'arrivée recommandée)
- `completed` - Mission terminée
- `incident` - Incident signalé
- `cancelled` - Mission annulée

#### 2. API Routes (`src/app/api/bookings/[id]/status/route.ts`)

**POST - Mettre à jour le statut de la mission**

Endpoint: `POST /api/bookings/[id]/status`

Body:

```json
{
  "userId": "accompagnateur_uid",
  "status": "picked_up",
  "notes": "Jeune pris en charge à l'heure",
  "photoURL": "https://storage.googleapis.com/...",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

Fonctionnalités:

- Authentification Firebase requise
- Vérification que l'utilisateur est l'accompagnateur assigné
- Ajout automatique du timestamp
- Mise à jour de `currentStatus`
- Ajout dans `statusHistory`
- Gestion automatique des photos (departure/arrival)
- Mise à jour du statut de réservation quand `completed`

Réponse:

```json
{
  "success": true,
  "missionTracking": {
    "currentStatus": "picked_up",
    "statusHistory": [...],
    "departurePhoto": "https://...",
    "lastUpdateAt": { "_seconds": 1234567890 }
  }
}
```

**GET - Récupérer le statut actuel**

Endpoint: `GET /api/bookings/[id]/status`

Pas d'authentification requise (parents peuvent consulter).

Réponse:

```json
{
  "currentStatus": "in_transit",
  "statusHistory": [...],
  "departurePhoto": "https://...",
  "lastUpdateAt": { "_seconds": 1234567890 }
}
```

#### 3. Composants Visuels

**MissionTimeline** (`src/components/mission/mission-timeline.tsx`)

Affiche une timeline verticale avec toutes les mises à jour de statut :

- Icônes colorées pour chaque statut
- Timestamps formatés
- Notes optionnelles
- Coordonnées GPS optionnelles
- Photos inline dans la timeline
- Photos de départ/arrivée en grille en bas
- Badge "En cours" sur la dernière mise à jour

Utilisation:

```tsx
import { MissionTimeline } from '@/components/mission/mission-timeline';

<MissionTimeline missionTracking={booking.missionTracking} />
```

**ActiveMissions** (`src/components/mission/active-missions.tsx`)

Carte dashboard affichant toutes les missions en cours :

- Liste des réservations avec missions actives
- Badge de statut actuel avec couleur
- Trajet (départ → arrivée)
- Nombre de jeunes
- Heure programmée
- Temps depuis dernière mise à jour
- Clic pour accéder au détail
- Bouton de rafraîchissement
- État vide si aucune mission active

Utilisation:

```tsx
import { ActiveMissions } from '@/components/mission/active-missions';

<ActiveMissions 
  bookings={bookings} 
  onRefresh={fetchBookings}
  refreshing={loadingBookings}
/>
```

**PhotoCapture** (`src/components/mission/photo-capture.tsx`)

Interface de capture/upload de photos :

- Capture via caméra mobile (attribut `capture="environment"`)
- Sélection de fichier depuis galerie
- Prévisualisation avant upload
- Compression automatique (max 1920x1080, 80% qualité)
- Barre de progression
- Gestion d'erreurs
- État "uploadé" avec aperçu

Utilisation:

```tsx
import { PhotoCapture } from '@/components/mission/photo-capture';

<PhotoCapture
  bookingId="booking_123"
  photoType="departure"
  onPhotoUploaded={(photoURL) => {
    // Utiliser l'URL pour mettre à jour le statut
    updateMissionStatus({
      status: 'picked_up',
      photoURL,
    });
  }}
/>
```

#### 4. Services

**photo-service.ts** (`src/lib/photo-service.ts`)

Service d'upload et compression de photos :

**Fonctions principales :**

- `uploadMissionPhoto(options)` - Upload une photo sur Firebase Storage
  - Compression automatique (1920x1080, 80% qualité)
  - Validation de taille (max 10MB avant compression)
  - Validation de type (images uniquement)
  - Callback de progression
  - Retourne URL publique et chemin de stockage

- `fileToBase64(file)` - Convertit un fichier en base64 pour prévisualisation

- `compressImage(file, maxWidth, maxHeight, quality)` - Compresse une image

Structure de stockage Firebase Storage:

```
mission-photos/
  ├── booking_id_1/
  │   ├── 1234567890_departure.jpg
  │   ├── 1234567891_arrival.jpg
  │   └── 1234567892_incident.jpg
  └── booking_id_2/
      └── ...
```

Métadonnées stockées :

- `bookingId` - ID de la réservation
- `photoType` - Type de photo (departure/arrival/incident/other)
- `uploadedAt` - Date/heure d'upload ISO

## Flux d'utilisation complet

### Côté Accompagnateur (Mobile App - à développer)

1. **Démarrage de mission**

```typescript
// GET bookings assignés
const assignedBookings = await fetch('/api/bookings?accompanistId=xxx');

// Sélectionner une mission
// Mettre à jour statut: en_route_to_pickup
await fetch(`/api/bookings/${bookingId}/status`, {
  method: 'POST',
  body: JSON.stringify({
    userId: accompanistId,
    status: 'en_route_to_pickup',
    location: { lat: 48.8566, lng: 2.3522 }
  })
});
```

1. **Arrivée au point de départ**

```typescript
// Statut: waiting_at_pickup
await updateStatus('waiting_at_pickup');
```

1. **Prise en charge avec photo**

```typescript
// 1. Prendre photo
<PhotoCapture
  bookingId={bookingId}
  photoType="departure"
  onPhotoUploaded={async (photoURL) => {
    // 2. Mettre à jour statut avec photo
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      body: JSON.stringify({
        userId: accompanistId,
        status: 'picked_up',
        photoURL,
        notes: 'Jeune pris en charge, tout va bien',
        location: { lat: 48.8566, lng: 2.3522 }
      })
    });
  }}
/>
```

1. **Trajet**

```typescript
// En trajet
await updateStatus('in_transit', {
  notes: 'Trajet en cours, pas de problème',
  location: currentLocation
});

// Proche de l'arrivée
await updateStatus('arriving_soon');
```

1. **Arrivée avec photo**

```typescript
// Photo d'arrivée
<PhotoCapture
  bookingId={bookingId}
  photoType="arrival"
  onPhotoUploaded={async (photoURL) => {
    await updateStatus('delivered', {
      photoURL,
      notes: 'Jeune livré à destination'
    });
  }}
/>

// Terminer la mission
await updateStatus('completed');
```

### Côté Parent (Dashboard Web)

#### Dashboard principal

```tsx
// Affiche toutes les missions en cours
<ActiveMissions bookings={bookings} />
```

#### Page détail réservation

```tsx
// Timeline complète de la mission
{booking.status !== 'cancelled' && booking.status !== 'pending' && (
  <MissionTimeline missionTracking={booking.missionTracking} />
)}
```

#### Rafraîchissement manuel ou automatique

```typescript
// Option 1: Polling (toutes les 30 secondes)
useEffect(() => {
  const interval = setInterval(() => {
    fetchBookingStatus();
  }, 30000);
  return () => clearInterval(interval);
}, []);

// Option 2: Firebase Realtime (recommandé)
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'bookings', bookingId),
    (doc) => {
      if (doc.exists()) {
        setBooking({ id: doc.id, ...doc.data() });
      }
    }
  );
  return () => unsubscribe();
}, [bookingId]);
```

## Configuration Firebase

### Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      // Lecture: parent ou accompagnateur assigné
      allow read: if request.auth != null && (
        resource.data.parentId == request.auth.uid ||
        resource.data.accompanistId == request.auth.uid
      );
      
      // Écriture missionTracking: uniquement accompagnateur
      allow update: if request.auth != null &&
        resource.data.accompanistId == request.auth.uid &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['missionTracking', 'status', 'updatedAt']);
    }
  }
}
```

### Règles de sécurité Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /mission-photos/{bookingId}/{filename} {
      // Lecture: parent ou accompagnateur du booking
      allow read: if request.auth != null && (
        firestore.get(/databases/(default)/documents/bookings/$(bookingId))
          .data.parentId == request.auth.uid ||
        firestore.get(/databases/(default)/documents/bookings/$(bookingId))
          .data.accompanistId == request.auth.uid
      );
      
      // Écriture: uniquement accompagnateur
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/bookings/$(bookingId))
          .data.accompanistId == request.auth.uid &&
        request.resource.size < 10 * 1024 * 1024 && // Max 10MB
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Tests

### Test manuel - Scénario complet

1. **Créer une réservation de test**

```typescript
const testBooking = {
  parentId: 'parent_test_uid',
  accompanistId: 'accompanist_test_uid',
  status: 'assigned',
  scheduledFor: new Date(),
  trip: {
    departure: { city: 'Paris', postalCode: '75001' },
    arrival: { city: 'Lyon', postalCode: '69001' }
  },
  youngsters: [{ firstName: 'Test', lastName: 'Jeune', age: 10 }]
};
```

1. **Tester la séquence de statuts**

```bash
# 1. En route
POST /api/bookings/test_booking_id/status
{
  "userId": "accompanist_test_uid",
  "status": "en_route_to_pickup"
}

# 2. Sur place
POST /api/bookings/test_booking_id/status
{
  "userId": "accompanist_test_uid",
  "status": "waiting_at_pickup"
}

# 3. Pris en charge avec photo
POST /api/bookings/test_booking_id/status
{
  "userId": "accompanist_test_uid",
  "status": "picked_up",
  "photoURL": "https://...",
  "notes": "Tout va bien"
}

# 4. En trajet
POST /api/bookings/test_booking_id/status
{
  "userId": "accompanist_test_uid",
  "status": "in_transit"
}

# 5. Livré avec photo
POST /api/bookings/test_booking_id/status
{
  "userId": "accompanist_test_uid",
  "status": "delivered",
  "photoURL": "https://..."
}

# 6. Terminé
POST /api/bookings/test_booking_id/status
{
  "userId": "accompanist_test_uid",
  "status": "completed"
}
```

1. **Vérifier dans le dashboard parent**

- ActiveMissions affiche la mission pendant les statuts actifs
- Timeline montre toutes les étapes avec photos
- Photos de départ et arrivée visibles en bas

## Prochaines étapes

### Priorité HAUTE

- [ ] **Application mobile accompagnateur** (React Native ou PWA)
  - Interface dédiée pour mises à jour rapides
  - Capture photo optimisée mobile
  - GPS automatique
  - Notifications push
  - Mode offline (queue de synchronisation)

- [ ] **Mises à jour en temps réel**
  - Implémenter Firebase onSnapshot dans dashboard
  - Notifications push pour parents (FCM)
  - Indicateur "Live" avec badge
  - Toast notifications sur changement de statut

### Priorité MOYENNE

- [ ] **Géolocalisation temps réel**
  - Tracker GPS de l'accompagnateur
  - Carte interactive avec position
  - Estimation temps d'arrivée (ETA)
  - Historique du trajet

- [ ] **Notifications automatiques**
  - SMS/Email à chaque changement de statut
  - Personnalisation des préférences parent
  - Templates de messages par statut

### Priorité BASSE

- [ ] **Analytiques et reporting**
  - Dashboard admin avec statistiques missions
  - Temps moyen par statut
  - Taux incidents
  - Performance accompagnateurs

- [ ] **Améliorations UX**
  - Animations de transitions
  - Indicateurs de chargement optimisés
  - Mode sombre
  - Accessibilité (ARIA labels complets)

## Dépendances

- **Firebase SDK** : v10+
  - `firebase/firestore` - Base de données
  - `firebase/storage` - Stockage photos
  - `firebase/auth` - Authentification

- **Frontend**
  - `next` : v14+
  - `react` : v18+
  - `shadcn/ui` : Composants UI
  - `lucide-react` : Icônes
  - `date-fns` : Formatage dates

## Support et maintenance

### Logs d'erreurs

Tous les services loguent les erreurs dans la console :

```typescript
console.error('Erreur lors de l\'upload de la photo:', error);
```

### Monitoring recommandé

- Firebase Console > Firestore > Utilisation
- Firebase Console > Storage > Utilisation
- Sentry.io pour tracking erreurs production

### Contacts

- **Développeur** : Nathan Imogo
- **Documentation** : `/docs/mission-tracking.md`
- **Roadmap** : `/docs/roadmap.md`
