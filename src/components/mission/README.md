# Mission Tracking Components

Composants pour le suivi en temps réel des missions d'accompagnement.

## Composants disponibles

### `<MissionTimeline />`

Timeline verticale affichant l'historique complet d'une mission avec statuts, photos, notes et coordonnées GPS.

**Props:**

- `missionTracking?: SimplifiedMissionTracking` - Données de suivi de la mission

**Exemple:**

```tsx
import { MissionTimeline } from '@/components/mission/mission-timeline';

<MissionTimeline missionTracking={booking.missionTracking} />
```

**Caractéristiques:**

- 10 statuts configurés avec icônes et couleurs
- Timeline verticale avec ligne de connexion
- Affichage des timestamps (HH:mm)
- Support notes, photos et GPS
- Badge "En cours" sur dernière mise à jour
- État vide si mission non démarrée

---

### `<ActiveMissions />`

Widget dashboard affichant uniquement les missions actuellement en cours (statuts actifs).

**Props:**

- `bookings: Booking[]` - Liste de toutes les réservations
- `onRefresh?: () => void` - Callback pour rafraîchir les données
- `refreshing?: boolean` - État de chargement du rafraîchissement

**Exemple:**

```tsx
import { ActiveMissions } from '@/components/mission/active-missions';

<ActiveMissions 
  bookings={bookings} 
  onRefresh={fetchBookings}
  refreshing={loadingBookings}
/>
```

**Caractéristiques:**

- Filtrage automatique des missions actives uniquement
  - Statuts: `en_route_to_pickup`, `waiting_at_pickup`, `picked_up`, `in_transit`, `arriving_soon`
- Badge de statut avec couleur
- Trajet visuel (départ → arrivée)
- Infos: nombre de jeunes, heure programmée
- Temps depuis dernière mise à jour
- Navigation vers détail booking au clic
- Bouton de rafraîchissement
- État vide si aucune mission active

---

### `<PhotoCapture />`

Interface de capture/upload de photos de confirmation de mission (départ, arrivée, incident).

**Props:**

- `bookingId: string` - ID de la réservation
- `photoType: 'departure' | 'arrival' | 'incident' | 'other'` - Type de photo
- `onPhotoUploaded: (photoURL: string) => void` - Callback avec URL de la photo uploadée
- `disabled?: boolean` - Désactiver l'interface

**Exemple:**

```tsx
import { PhotoCapture } from '@/components/mission/photo-capture';

<PhotoCapture
  bookingId="booking_123"
  photoType="departure"
  onPhotoUploaded={(photoURL) => {
    // Mettre à jour le statut avec la photo
    updateMissionStatus({
      status: 'picked_up',
      photoURL,
    });
  }}
  disabled={uploading}
/>
```

**Caractéristiques:**

- Capture via caméra mobile (attribut `capture="environment"`)
- Sélection depuis galerie photo
- Prévisualisation avant upload
- Compression automatique (1920x1080, 80% qualité)
- Validation: max 10MB, images uniquement
- Barre de progression
- Gestion d'erreurs
- État "uploadé" avec aperçu
- Possibilité de reprendre une photo

---

## API Routes

### `POST /api/bookings/[id]/status`

Met à jour le statut d'une mission (accompagnateur uniquement).

**Body:**

```json
{
  "userId": "accompagnateur_uid",
  "status": "picked_up",
  "notes": "Jeune pris en charge à l'heure",
  "photoURL": "https://...",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

**Authentification:** Requise (Firebase Auth)  
**Autorisation:** Uniquement l'accompagnateur assigné

---

### `GET /api/bookings/[id]/status`

Récupère le statut actuel d'une mission.

**Authentification:** Non requise (parents peuvent consulter)

**Réponse:**

```json
{
  "currentStatus": "in_transit",
  "statusHistory": [...],
  "departurePhoto": "https://...",
  "arrivalPhoto": "https://...",
  "lastUpdateAt": { "_seconds": 1234567890 }
}
```

---

## Services

### `photo-service.ts`

Service d'upload et compression de photos.

**Fonctions:**

- `uploadMissionPhoto(options)` - Upload sur Firebase Storage avec compression
- `fileToBase64(file)` - Conversion pour prévisualisation
- `compressImage(file, maxWidth, maxHeight, quality)` - Compression manuelle
- `validateImageDimensions(file, maxWidth, maxHeight)` - Validation dimensions

**Exemple:**

```typescript
import { uploadMissionPhoto } from '@/lib/photo-service';

const result = await uploadMissionPhoto({
  bookingId: 'booking_123',
  photoType: 'departure',
  file: selectedFile,
  onProgress: (progress) => console.log(`${progress}%`),
});

console.log('URL:', result.url);
```

---

## Types

### `MissionStatus`

Enum des statuts de mission (10 états):

- `scheduled` - Mission programmée
- `en_route_to_pickup` - En route vers départ
- `waiting_at_pickup` - Sur place (attente)
- `picked_up` - Prise en charge
- `in_transit` - En trajet
- `arriving_soon` - Arrivée proche
- `delivered` - Livré
- `completed` - Terminée
- `incident` - Incident
- `cancelled` - Annulée

### `MissionStatusUpdate`

```typescript
interface MissionStatusUpdate {
  status: MissionStatus;
  updatedAt: Timestamp;
  location?: LocationPoint; // { lat: number; lng: number }
  photoURL?: string;
  notes?: string;
  updatedBy: string; // accompagnateur ID
}
```

### `SimplifiedMissionTracking`

```typescript
interface SimplifiedMissionTracking {
  currentStatus: MissionStatus;
  statusHistory: MissionStatusUpdate[];
  departurePhoto?: string;
  arrivalPhoto?: string;
  lastUpdateAt?: Timestamp;
}
```

---

## Flux d'utilisation

### Accompagnateur (exemple simplifié)

```typescript
// 1. Démarrer mission
await fetch(`/api/bookings/${bookingId}/status`, {
  method: 'POST',
  body: JSON.stringify({
    userId: accompanistId,
    status: 'en_route_to_pickup',
    location: currentLocation,
  })
});

// 2. Prise en charge avec photo
<PhotoCapture
  bookingId={bookingId}
  photoType="departure"
  onPhotoUploaded={async (photoURL) => {
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      body: JSON.stringify({
        userId: accompanistId,
        status: 'picked_up',
        photoURL,
        notes: 'Tout va bien',
      })
    });
  }}
/>

// 3. En trajet
await updateStatus('in_transit');

// 4. Arrivée avec photo
<PhotoCapture
  bookingId={bookingId}
  photoType="arrival"
  onPhotoUploaded={async (photoURL) => {
    await updateStatus('delivered', { photoURL });
  }}
/>

// 5. Terminer
await updateStatus('completed');
```

### Parent (dashboard)

```tsx
// Dashboard principal - Vue d'ensemble
<ActiveMissions bookings={bookings} />

// Page détail - Timeline complète
<MissionTimeline missionTracking={booking.missionTracking} />
```

---

## Configuration Firebase

### Règles Firestore (bookings)

```javascript
match /bookings/{bookingId} {
  allow read: if request.auth != null && (
    resource.data.parentId == request.auth.uid ||
    resource.data.accompanistId == request.auth.uid
  );
  
  allow update: if request.auth != null &&
    resource.data.accompanistId == request.auth.uid &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['missionTracking', 'status', 'updatedAt']);
}
```

### Règles Storage (photos)

```javascript
match /mission-photos/{bookingId}/{filename} {
  allow read: if request.auth != null;
  
  allow write: if request.auth != null &&
    firestore.get(/databases/(default)/documents/bookings/$(bookingId))
      .data.accompanistId == request.auth.uid &&
    request.resource.size < 10 * 1024 * 1024 &&
    request.resource.contentType.matches('image/.*');
}
```

---

## Documentation complète

Voir [`/docs/mission-tracking.md`](../../docs/mission-tracking.md) pour:

- Architecture détaillée
- Flux complets côté accompagnateur/parent
- Exemples d'API
- Tests manuels
- Prochaines fonctionnalités
