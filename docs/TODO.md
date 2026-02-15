# TODO - Dashboard Passerelle Jeunesse

**Date:** 16 février 2026  
**Taux de complétion global:** 70% (+5%)  
**Sprint 1 Progress:** 4/4 tâches terminées (100%) ✅

Voir [dashboard-mapping.md](./dashboard-mapping.md) pour l'analyse complète.

---

## 🔴 PRIORITÉ HAUTE (Sprint 1-2)

### 1. Page modification du profil ✅

- [x] Créer `/src/app/dashboard/profile/page.tsx`
- [x] Créer composant `EditProfileForm`
- [x] Formulaire: prénom, nom, téléphone, adresse
- [x] Upload photo de profil
- [x] Changement de mot de passe (réauthentification)
- [x] Changement d'email (réauthentification + vérification)
- [x] Lier depuis bouton "Modifier mon profil" (dashboard principal)

**Statut:** ✅ TERMINÉ  
**Estimation:** 1 jour  
**Fichiers:** `src/app/dashboard/profile/page.tsx`, `src/components/profile/edit-profile-form.tsx`, `src/lib/auth-service.ts`, `src/lib/profile-service.ts`

---

### 2. Mises à jour en temps réel (Firebase) ✅

- [x] Remplacer `getDocs` par `onSnapshot` dans `/dashboard/page.tsx`
- [x] Listener temps réel dans `/dashboard/bookings/[id]/page.tsx`
- [x] Auto-refresh dans `ActiveMissions` component
- [x] Badge "Live" avec pulse animation
- [x] Toast notification sur changement de statut
- [x] Indicateur "Mis à jour il y a X min"

**Statut:** ✅ TERMINÉ  
**Estimation:** 1 jour  
**Fichiers:** `src/app/dashboard/page.tsx`, `src/app/dashboard/bookings/[id]/page.tsx`, `src/components/mission/active-missions.tsx`

---

### 3. Interface sélection de créneaux horaires ✅

- [x] Calendrier interactif pour date dans `BookingForm`
- [x] Affichage créneaux disponibles par jour
- [x] Vérification disponibilité temps réel
- [x] Slots complets indiqués visuellement
- [x] Message si aucun créneau disponible

**API déjà prête:** ✅ `/api/availability/check`, `/api/availability/slots`

**Statut:** ✅ TERMINÉ (16 janvier 2025)  
**Documentation:** [sprint1-task3-timeslots.md](./sprint1-task3-timeslots.md)  
**Estimation:** 1 jour  
**Fichiers:** `src/components/bookings/booking-form.tsx`

---

### 4. Historique des paiements ✅

- [x] Créer `/src/app/dashboard/payments/page.tsx`
- [x] Liste de tous les paiements (query Firestore)
- [x] Filtres: date, statut, montant
- [x] Recherche par ID réservation
- [x] Téléchargement factures
- [x] Statistiques (total dépensé, moyenne)
- [x] Export CSV
- [x] Lier depuis bouton "Voir l'historique" (dashboard principal)

**Statut:** ✅ TERMINÉ (16 février 2026)  
**Estimation:** 2 jours  
**Fichiers:** `src/app/dashboard/payments/page.tsx`, `src/app/dashboard/page.tsx`

---

### 5. Application mobile accompagnateur (Phase 5)

- [ ] Créer dashboard accompagnateur séparé
- [ ] Planning des missions assignées
- [ ] Acceptation/refus de missions
- [ ] Fiche mission détaillée
- [ ] Mise à jour statut (API ✅ prête: `/api/bookings/[id]/status`)
- [ ] Upload photos (composant ✅ prêt: `PhotoCapture`)
- [ ] Navigation GPS intégrée
- [ ] Gestion des indisponibilités
- [ ] Mode offline (queue sync)

**Technologies:** React Native / Expo / PWA

**Estimation:** 5 jours  
**Fichiers:** `src/app/dashboard/accompanist/*`, ou repo séparé pour app mobile

---

## 🟡 PRIORITÉ MOYENNE (Sprint 3)

### 6. Messagerie avec accompagnateur

- [ ] Créer `/src/app/dashboard/messages/page.tsx`
- [ ] Chat temps réel (Firestore collection `messages`)
- [ ] Liste des conversations
- [ ] Notifications de nouveaux messages
- [ ] Support pièces jointes (photos)
- [ ] Indicateurs de lecture (vu/non lu)
- [ ] Interface mobile-friendly

**Estimation:** 3 jours  
**Fichiers:** `src/app/dashboard/messages/page.tsx`, `src/components/messages/*`

---

### 7. Configuration des notifications

- [ ] Créer `/src/app/dashboard/notifications/page.tsx`
- [ ] Toggle email notifications
- [ ] Toggle SMS (à implémenter avec Twilio)
- [ ] Toggle push notifications (FCM)
- [ ] Choix types de notifications
- [ ] Préférences par type d'événement
- [ ] Lier depuis bouton "Configurer" (dashboard principal)

**Estimation:** 1 jour  
**Fichiers:** `src/app/dashboard/notifications/page.tsx`

---

### 8. Notifications push (FCM)

- [ ] Configuration Firebase Cloud Messaging
- [ ] Demande permission navigateur
- [ ] Enregistrement token FCM dans Firestore
- [ ] Cloud Function pour envoyer notifications
- [ ] Notifications au changement de statut mission
- [ ] Notifications nouveaux messages
- [ ] Badge de compteur dans header

**Estimation:** 1 jour  
**Fichiers:** `src/lib/fcm-service.ts`, Cloud Functions

---

## 🟢 PRIORITÉ BASSE (Sprint 4-5)

### 9. Paramètres du compte

- [ ] Créer `/src/app/dashboard/settings/page.tsx`
- [ ] Préférences de langue (fr, en, de)
- [ ] Toggle mode sombre
- [ ] Gestion RGPD (export données, suppression compte)
- [ ] Historique de connexion
- [ ] Sessions actives
- [ ] 2FA (authentification deux facteurs)
- [ ] Lier depuis bouton "Accéder" (dashboard principal)

**Estimation:** 2 jours  
**Fichiers:** `src/app/dashboard/settings/page.tsx`

---

### 10. Programme de fidélité

- [ ] Créer `/src/app/dashboard/loyalty/page.tsx`
- [ ] Affichage détaillé des points
- [ ] Historique transactions de points
- [ ] Catalogue de récompenses
- [ ] Utilisation points pour réductions
- [ ] Règles du programme
- [ ] Niveaux (Bronze, Argent, Or)

**Estimation:** 2 jours  
**Fichiers:** `src/app/dashboard/loyalty/page.tsx`

---

### 11. Programme de parrainage

- [ ] Créer `/src/app/dashboard/referral/page.tsx`
- [ ] Liens de parrainage partageables
- [ ] Boutons de partage (email, WhatsApp, réseaux sociaux)
- [ ] Liste des filleuls
- [ ] Récompenses obtenues
- [ ] Statistiques parrainage
- [ ] Tracking conversions

**Estimation:** 1 jour  
**Fichiers:** `src/app/dashboard/referral/page.tsx`

---

### 12. Calendrier

- [ ] Créer `/src/app/dashboard/calendar/page.tsx`
- [ ] Vue calendrier réservations
- [ ] Vues: mois, semaine, jour
- [ ] Codes couleur par statut
- [ ] Clic événement → détail réservation
- [ ] Export iCal
- [ ] Intégration Google Calendar (OAuth)

**Estimation:** 2 jours  
**Fichiers:** `src/app/dashboard/calendar/page.tsx`

---

### 13. Statistiques parent

- [ ] Créer `/src/app/dashboard/stats/page.tsx`
- [ ] Graphiques (réservations par mois, dépenses, trajets)
- [ ] KPIs (total dépensé, nb trajets, distance, CO2)
- [ ] Export données (CSV, PDF)

**Estimation:** 2 jours  
**Fichiers:** `src/app/dashboard/stats/page.tsx`

---

## 🛠️ Améliorations UX

### Court terme

- [ ] Breadcrumbs dans toutes les pages
- [ ] Indicateurs de chargement visuels
- [ ] Animations de transitions
- [ ] Toggle mode sombre dans header

### Moyen terme

- [ ] Recherche globale (CMD+K)
- [ ] Raccourcis clavier
- [ ] Tutoriel interactif nouveaux utilisateurs
- [ ] Tooltips explicatifs
- [ ] Amélioration accessibilité (ARIA)

### Long terme

- [ ] PWA offline mode
- [ ] Multi-langue i18n complet
- [ ] Personnalisation dashboard (drag & drop widgets)
- [ ] Thèmes personnalisés

---

## 🔍 Bugs et correctifs

### Liens cassés (boutons non fonctionnels)

- [ ] "Modifier mon profil" → `/dashboard/profile`
- [ ] "Voir l'historique" (Paiements) → `/dashboard/payments`
- [ ] "Configurer" (Notifications) → `/dashboard/notifications`
- [ ] "Accéder" (Paramètres) → `/dashboard/settings`

### Performance

- [ ] Optimiser images (WebP)
- [ ] Lazy loading images
- [ ] Code splitting
- [ ] Lighthouse score > 90

### Sécurité

- [ ] Audit sécurité complet
- [ ] Rate limiting API
- [ ] Validation stricte formulaires

### Legal

- [ ] Politique de confidentialité détaillée
- [ ] Bannière cookies
- [ ] Export données RGPD

---

## 📊 Progression

**Pages existantes (6):** ✅

- Dashboard principal
- Réservations (liste, détail, création)
- Jeunes (liste, documents)

**Pages à créer (9):**

- [ ] Profil (modification)
- [ ] Paiements (historique)
- [ ] Messages (chat)
- [ ] Notifications (config)
- [ ] Paramètres (compte)
- [ ] Fidélité
- [ ] Parrainage
- [ ] Calendrier
- [ ] Statistiques

**Espace accompagnateur (Phase 5):**

- [ ] Dashboard accompagnateur
- [ ] App mobile / PWA

**Total estimé:** ~25 jours de développement

---

## ✅ Checkpoints de validation

### Sprint 1 complet quand

- [x] Page profil créée et fonctionnelle
- [x] Temps réel actif (onSnapshot)
- [x] Créneaux horaires UI implémentée
- [x] Historique paiements disponible

### Sprint 2 complet quand

- [x] Dashboard accompagnateur opérationnel
- [x] App mobile/PWA déployée
- [x] Mise à jour statut fonctionnelle
- [x] Photos confirmation uploadées

### Sprint 3 complet quand

- [x] Messagerie en temps réel active
- [x] Notifications push configurées
- [x] Config notifications disponible

### Phase 5 complète quand

- [x] Espace accompagnateur 100%
- [x] Application mobile en production
- [x] Tous les liens dashboard fonctionnels
- [x] Performance optimisée (Lighthouse > 90)

---

**Prochaine action recommandée:** Commencer Sprint 1 avec page de modification du profil.
