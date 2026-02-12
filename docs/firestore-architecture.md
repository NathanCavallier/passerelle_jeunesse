# 🗄️ Architecture Firestore - Passerelle Jeunesse

## Vue d'ensemble

Cette documentation détaille la structure complète de la base de données Firestore pour la plateforme Passerelle Jeunesse.

**Principes de conception :**

- Optimisation pour les lectures (facturation Firestore)
- Dénormalisation stratégique pour performance
- Sécurité par règles Firestore
- Scalabilité (structure prête pour 10 000+ documents)

---

## 📊 Schéma global

```
firestore/
├── users/                          # Utilisateurs (parents/accompagnateurs/admin)
│   ├── {userId}/
│   │   └── youngsters/             # Sous-collection des jeunes
│   │       └── {youngsterId}/
├── bookings/                       # Réservations de prestations
│   └── {bookingId}/
├── missions/                       # Missions en cours/terminées
│   └── {missionId}/
├── payments/                       # Paiements et factures
│   └── {paymentId}/
├── reviews/                        # Avis clients
│   └── {reviewId}/
├── notifications/                  # Notifications temps réel
│   └── {notificationId}/
├── messages/                       # Messages accompagnateur ↔ parent
│   └── {messageId}/
├── stats/                          # Statistiques agrégées (admin)
│   └── {period}/
├── settings/                       # Configuration globale
│   └── general/
└── audit/                          # Logs d'audit (actions sensibles)
    └── {auditId}/
```

---

## 📁 Collection : `users`

**Path :** `/users/{userId}`

Stocke les informations de tous les utilisateurs de la plateforme.

### Structure du document

```typescript
{
  // Identification
  uid: string;                      // Firebase Auth UID
  email: string;
  emailVerified: boolean;
  
  // Type utilisateur
  role: 'parent' | 'accompanist' | 'admin';
  
  // Informations personnelles
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  
  // Photo de profil
  photoURL?: string;                // URL Firebase Storage
  
  // Préférences
  preferences: {
    language: 'fr' | 'en' | 'de';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    newsletter: boolean;
  };
  
  // Métadonnées spécifiques au rôle
  parentProfile?: {
    emergencyContact: {
      name: string;
      phoneNumber: string;
      relationship: string;
    };
    numberOfYoungsters: number;
    totalBookings: number;           // Compteur dénormalisé
    totalSpent: number;              // En centimes
    loyaltyPoints: number;
    referralCode: string;            // Code de parrainage unique
  };
  
  accompanistProfile?: {
    biography: string;
    experience: string;
    certifications: string[];
    availability: {
      monday: { start: string; end: string }[];
      tuesday: { start: string; end: string }[];
      // ... autres jours
    };
    zones: string[];                 // ['Metz', 'Saint-Avold', ...]
    longDistanceAvailable: boolean;
    maxYoungsters: number;
    rating: number;                  // Moyenne des avis (0-5)
    totalMissions: number;           // Compteur dénormalisé
    totalEarnings: number;           // En centimes
    documents: {
      criminalRecord: {
        verified: boolean;
        verifiedAt?: Timestamp;
        expiresAt?: Timestamp;
      };
      insurance: {
        verified: boolean;
        policyNumber?: string;
        expiresAt?: Timestamp;
      };
      idCard: {
        verified: boolean;
        verifiedAt?: Timestamp;
      };
    };
  };
  
  // Statut
  status: 'active' | 'suspended' | 'deleted';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

### Sous-collection : `users/{userId}/youngsters`

**Path :** `/users/{userId}/youngsters/{youngsterId}`

Informations sur les jeunes accompagnés (enfants du parent).

```typescript
{
  id: string;                        // Auto-généré
  parentId: string;                  // Référence au parent
  
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  age: number;                       // Calculé automatiquement
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  photoURL?: string;
  
  // Documents
  idCardURL?: string;                // URL Firebase Storage
  idCardType: 'passport' | 'id_card' | 'residence_permit';
  idCardNumber: string;
  
  // Santé et sécurité
  healthInfo: {
    bloodType?: string;
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
    doctorName?: string;
    doctorPhone?: string;
    healthInsuranceNumber: string;
  };
  
  // Contacts d'urgence
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phoneNumber: string;
    isPrimary: boolean;
  }>;
  
  // Autorisations parentales
  authorizations: {
    photo: boolean;
    medicalCare: boolean;
    publicTransport: boolean;
    activitiesParticipation: boolean;
  };
  
  // Préférences comportementales
  behaviouralNotes?: string;         // Notes spéciales pour l'accompagnateur
  specialNeeds?: string[];           // Autisme, TDAH, etc.
  
  // Statistiques
  totalTrips: number;
  
  // Statut
  status: 'active' | 'inactive';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📁 Collection : `bookings`

**Path :** `/bookings/{bookingId}`

Gère toutes les demandes de réservation de prestations.

### Structure du document

```typescript
{
  id: string;
  
  // Références
  parentId: string;                  // Ref: users/{userId}
  accompanistId?: string;            // Assigné après validation
  youngstersIds: string[];           // Refs: users/{parentId}/youngsters/{id}
  
  // Type de prestation
  serviceType: 'local' | 'long_distance';
  
  // Détails du trajet
  trip: {
    // Départ
    departure: {
      address: string;
      city: string;
      postalCode: string;
      coordinates?: { lat: number; lng: number };
      date: Timestamp;
      time: string;                  // Format HH:mm
      contactPerson: string;
      contactPhone: string;
    };
    
    // Arrivée
    arrival: {
      address: string;
      city: string;
      postalCode: string;
      coordinates?: { lat: number; lng: number };
      estimatedDate: Timestamp;
      estimatedTime: string;
      contactPerson: string;
      contactPhone: string;
    };
    
    // Correspondances (trajets longue distance)
    connections?: Array<{
      station: string;
      arrivalTime: string;
      departureTime: string;
      waitingTime: number;           // En minutes
    }>;
    
    // Transport
    transportType: 'train' | 'bus' | 'car' | 'metro' | 'tram';
    ticketsProvided: boolean;
    ticketsURLs?: string[];          // URLs des billets uploadés
  };
  
  // Détails des jeunes
  youngsters: Array<{
    youngsterId: string;
    firstName: string;
    age: number;
    specialNotes?: string;
  }>;
  
  // Tarification
  pricing: {
    basePrice: number;               // En centimes
    youngstersSuplement: number;     // Supplément jeunes additionnels
    distanceSupplement?: number;     // Supplément distance
    urgencySupplement?: number;      // Supplément réservation urgente
    discounts: Array<{
      type: 'fratrie' | 'loyalty' | 'promo_code' | 'first_booking';
      amount: number;                // En centimes (négatif)
      code?: string;
    }>;
    subtotal: number;
    taxes: number;
    total: number;                   // Montant total TTC en centimes
    deposit: number;                 // Acompte (30%)
    depositPaid: boolean;
    balance: number;                 // Solde à payer
    balancePaid: boolean;
    currency: 'EUR';
  };
  
  // Informations complémentaires
  additionalInfo?: string;           // Notes spéciales du parent
  internalNotes?: string;            // Notes internes (admin)
  
  // Documents
  documents: {
    quoteURL?: string;               // Devis PDF
    contractURL?: string;            // Contrat PDF
    invoiceURL?: string;             // Facture PDF
    parentalAuthorizationURL?: string;
    informationSheetURL?: string;
  };
  
  // Statut du booking
  status: 
    | 'pending'                      // En attente de validation
    | 'confirmed'                    // Confirmé, en attente de paiement
    | 'paid'                         // Payé (acompte ou total)
    | 'assigned'                     // Accompagnateur assigné
    | 'in_progress'                  // Mission en cours
    | 'completed'                    // Terminée
    | 'cancelled'                    // Annulée
    | 'refunded';                    // Remboursée
  
  cancellation?: {
    cancelledBy: 'parent' | 'accompanist' | 'admin';
    cancelledAt: Timestamp;
    reason: string;
    refundAmount: number;            // En centimes
    refundStatus: 'pending' | 'processed';
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  scheduledFor: Timestamp;           // Date/heure prévue de la mission
}
```

---

## 📁 Collection : `missions`

**Path :** `/missions/{missionId}`

Suit l'exécution en temps réel des missions d'accompagnement.

### Structure du document

```typescript
{
  id: string;
  bookingId: string;                 // Ref: bookings/{id}
  
  // Participants
  accompanistId: string;
  youngstersIds: string[];
  parentId: string;
  
  // Statut temps réel
  status:
    | 'scheduled'                    // Planifiée
    | 'en_route_to_pickup'          // Accompagnateur en route
    | 'waiting_at_pickup'           // En attente au point de départ
    | 'picked_up'                   // Jeune(s) pris en charge
    | 'in_transit'                  // En transport
    | 'arriving_soon'               // Arrivée imminente
    | 'delivered'                   // Remis au destinataire
    | 'completed'                   // Mission terminée
    | 'incident'                    // Incident signalé
    | 'cancelled';                  // Annulée
  
  // Suivi GPS (optionnel, avec consentement)
  tracking?: {
    enabled: boolean;
    parentConsent: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
      timestamp: Timestamp;
    };
    locationHistory: Array<{
      lat: number;
      lng: number;
      timestamp: Timestamp;
    }>;
  };
  
  // Checkpoints de la mission
  checkpoints: {
    departure: {
      arrivedAt?: Timestamp;
      pickedUpAt?: Timestamp;
      photoURL?: string;             // Photo de confirmation
      notes?: string;
    };
    
    connections?: Array<{
      station: string;
      arrivedAt?: Timestamp;
      departedAt?: Timestamp;
      notes?: string;
    }>;
    
    arrival: {
      arrivedAt?: Timestamp;
      deliveredAt?: Timestamp;
      photoURL?: string;
      recipientName: string;
      recipientSignature?: string;  // Base64 ou URL
      notes?: string;
    };
  };
  
  // Communication
  messagesCount: number;             // Compteur dénormalisé
  lastMessageAt?: Timestamp;
  
  // Incidents
  incidents?: Array<{
    type: 'delay' | 'health' | 'behaviour' | 'transport' | 'other';
    severity: 'low' | 'medium' | 'high';
    description: string;
    reportedAt: Timestamp;
    resolvedAt?: Timestamp;
    resolution?: string;
  }>;
  
  // Rapport de mission
  report?: {
    behaviour: 'excellent' | 'good' | 'average' | 'difficult';
    cooperation: 'excellent' | 'good' | 'average' | 'difficult';
    generalNotes: string;
    recommendations?: string;
    submittedAt: Timestamp;
  };
  
  // Timestamps
  scheduledStartAt: Timestamp;
  actualStartAt?: Timestamp;
  scheduledEndAt: Timestamp;
  actualEndAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📁 Collection : `payments`

**Path :** `/payments/{paymentId}`

Gère tous les paiements et transactions financières.

### Structure du document

```typescript
{
  id: string;
  bookingId: string;                 // Ref: bookings/{id}
  userId: string;                    // Payeur (parent)
  
  // Type de paiement
  type: 'deposit' | 'balance' | 'full' | 'refund';
  
  // Montants
  amount: number;                    // En centimes
  currency: 'EUR';
  
  // Payment provider (Stripe)
  provider: 'stripe';
  paymentIntentId?: string;          // Stripe Payment Intent ID
  chargeId?: string;                 // Stripe Charge ID
  refundId?: string;                 // Stripe Refund ID (si applicable)
  
  // Méthode de paiement
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'check' | 'cash';
    last4?: string;                  // 4 derniers chiffres carte
    brand?: string;                  // visa, mastercard, etc.
    expiryMonth?: number;
    expiryYear?: number;
  };
  
  // Statut
  status:
    | 'pending'                      // En attente
    | 'processing'                   // En cours de traitement
    | 'succeeded'                    // Réussi
    | 'failed'                       // Échoué
    | 'cancelled'                    // Annulé
    | 'refunded';                    // Remboursé
  
  // Facturation
  invoice?: {
    number: string;                  // Numéro de facture unique
    pdfURL: string;                  // URL du PDF
    sentAt?: Timestamp;
  };
  
  // Métadonnées
  metadata?: {
    failureReason?: string;
    receiptURL?: string;
    description?: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  processedAt?: Timestamp;
  refundedAt?: Timestamp;
}
```

---

## 📁 Collection : `reviews`

**Path :** `/reviews/{reviewId}`

Avis et évaluations des prestations.

### Structure du document

```typescript
{
  id: string;
  bookingId: string;
  missionId: string;
  
  // Auteur
  authorId: string;                  // Parent
  authorName: string;
  
  // Évaluation
  rating: number;                    // 1-5 étoiles
  categories: {
    punctuality: number;             // 1-5
    communication: number;
    professionalism: number;
    youngsterSafety: number;
    youngsterComfort: number;
  };
  overallRating: number;             // Moyenne automatique
  
  // Commentaire
  comment?: string;
  
  // Recommandation
  wouldRecommend: boolean;
  
  // Modération
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  moderationNotes?: string;
  
  // Visibilité
  isPublic: boolean;
  isAnonymous: boolean;              // Masquer le nom
  
  // Réponse de l'accompagnateur
  response?: {
    text: string;
    respondedAt: Timestamp;
    respondedBy: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📁 Collection : `notifications`

**Path :** `/notifications/{notificationId}`

Notifications temps réel pour les utilisateurs.

### Structure du document

```typescript
{
  id: string;
  recipientId: string;               // Destinataire
  
  // Type de notification
  type:
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'payment_received'
    | 'mission_started'
    | 'mission_completed'
    | 'message_received'
    | 'review_request'
    | 'document_required'
    | 'reminder'
    | 'system';
  
  // Contenu
  title: string;
  body: string;
  imageURL?: string;
  
  // Action associée
  action?: {
    type: 'navigate' | 'open_url';
    target: string;                  // Route ou URL
  };
  
  // Données associées
  data?: {
    bookingId?: string;
    missionId?: string;
    messageId?: string;
  };
  
  // Canaux d'envoi
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  
  // Statut
  read: boolean;
  readAt?: Timestamp;
  dismissed: boolean;
  
  // Priorité
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Timestamps
  createdAt: Timestamp;
  expiresAt?: Timestamp;             // Pour les notifications temporaires
}
```

---

## 📁 Collection : `messages`

**Path :** `/messages/{messageId}`

Chat entre accompagnateur et parent durant une mission.

### Structure du document

```typescript
{
  id: string;
  missionId: string;
  bookingId: string;
  
  // Participants
  senderId: string;
  receiverId: string;
  
  // Contenu
  text: string;
  
  // Médias
  attachments?: Array<{
    type: 'image' | 'document' | 'location';
    url: string;
    fileName?: string;
    size?: number;
    thumbnailURL?: string;
  }>;
  
  // Localisation
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  
  // Statut
  status: 'sent' | 'delivered' | 'read';
  readAt?: Timestamp;
  
  // Modération (pour sécurité)
  flagged: boolean;
  flagReason?: string;
  
  // Timestamps
  createdAt: Timestamp;
}
```

---

## 📁 Collection : `stats`

**Path :** `/stats/{period}`

Statistiques agrégées pour le dashboard admin.

### Structure du document

```typescript
{
  id: string;                        // Format: YYYY-MM ou YYYY-MM-DD
  period: 'daily' | 'monthly' | 'yearly';
  
  // Réservations
  bookings: {
    total: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    conversionRate: number;          // %
  };
  
  // Finances
  revenue: {
    gross: number;                   // En centimes
    net: number;
    refunds: number;
    averageBookingValue: number;
  };
  
  // Utilisateurs
  users: {
    newParents: number;
    activeParents: number;
    newAccompanists: number;
    activeAccompanists: number;
  };
  
  // Missions
  missions: {
    total: number;
    completed: number;
    withIncidents: number;
    averageDuration: number;         // En minutes
  };
  
  // Satisfaction
  satisfaction: {
    averageRating: number;
    totalReviews: number;
    recommendationRate: number;      // %
  };
  
  // Top performers
  topAccompanists: Array<{
    accompanistId: string;
    missionsCount: number;
    averageRating: number;
  }>;
  
  // Timestamps
  calculatedAt: Timestamp;
}
```

---

## 📁 Collection : `settings`

**Path :** `/settings/general`

Configuration globale de l'application.

### Structure du document

```typescript
{
  // Tarification
  pricing: {
    local: {
      hourly: number;                // Prix/heure en centimes
      halfDay: number;
      fullDay: number;
    };
    longDistance: {
      basePrice: number;
      perKm?: number;
      perHour?: number;
    };
    supplements: {
      additionalYoungster: number;
      urgentBooking: number;         // < 48h
      weekend: number;
      holiday: number;
    };
    discounts: {
      fratrie: {
        secondYoungster: number;     // % de réduction
        thirdAndMore: number;
      };
      loyalty: {
        threshold: number;           // Nombre de points
        discount: number;            // % ou montant fixe
      };
    };
  };
  
  // Zones d'intervention
  zones: Array<{
    name: string;
    postalCodes: string[];
    active: boolean;
  }>;
  
  // Horaires d'ouverture
  businessHours: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    // ... autres jours
  };
  
  // Paramètres système
  system: {
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    minBookingAdvance: number;       // Heures
    maxBookingAdvance: number;       // Jours
    cancellationDeadline: number;    // Heures avant mission
  };
  
  // Contact
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  
  // Intégrations
  integrations: {
    stripe: {
      enabled: boolean;
      publicKey?: string;
    };
    sendgrid: {
      enabled: boolean;
    };
    twilio: {
      enabled: boolean;
    };
  };
  
  // Mise à jour
  updatedAt: Timestamp;
  updatedBy: string;
}
```

---

## 📁 Collection : `audit`

**Path :** `/audit/{auditId}`

Logs d'audit pour traçabilité des actions sensibles.

### Structure du document

```typescript
{
  id: string;
  
  // Action
  action:
    | 'user_created'
    | 'user_updated'
    | 'user_deleted'
    | 'booking_created'
    | 'booking_cancelled'
    | 'payment_processed'
    | 'refund_issued'
    | 'document_accessed'
    | 'settings_changed'
    | 'accompanist_approved'
    | 'review_moderated';
  
  // Acteur
  actorId: string;
  actorRole: 'parent' | 'accompanist' | 'admin' | 'system';
  actorEmail: string;
  
  // Cible
  targetType: 'user' | 'booking' | 'mission' | 'payment' | 'settings';
  targetId?: string;
  
  // Détails
  details: any;                      // Objet flexible selon l'action
  
  // Contexte
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamp
  createdAt: Timestamp;
}
```

---

## 🔐 Règles de sécurité Firestore

Les règles seront définies dans un fichier séparé `firestore.rules`.

### Principes de sécurité

1. **Authentification obligatoire** pour toutes les opérations
2. **Autorisation basée sur les rôles** (parent, accompanist, admin)
3. **Isolation des données** : un parent ne voit que ses données
4. **Validation des schémas** : types et champs obligatoires
5. **Audit trail** : toutes les actions sensibles loggées

---

## 📈 Optimisations & Index

### Index composites requis

```javascript
// Bookings par parent et statut
bookings: [parentId, status, createdAt]

// Missions par accompagnateur et date
missions: [accompanistId, scheduledStartAt]

// Notifications non lues
notifications: [recipientId, read, createdAt]

// Avis publics et approuvés
reviews: [status, isPublic, createdAt]

// Paiements par utilisateur
payments: [userId, status, createdAt]
```

---

## 🚀 Migration & Seed Data

### Ordre de création des collections

1. `settings` (configuration initiale)
2. `users` (créer admin + accompagnateurs tests)
3. `bookings` (données de test)
4. `missions` (simuler missions complètes)
5. `payments` (historique)
6. `reviews` (témoignages)

---

**Prochaine étape :** Créer les types TypeScript correspondants et les règles Firestore.
