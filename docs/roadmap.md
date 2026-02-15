# 🗺️ ROADMAP – Passerelle Jeunesse v2.0

## Version Professionnelle – Plateforme de réservation et gestion

---

## 📋 Vue d'ensemble

Cette roadmap détaille le développement de la plateforme web professionnelle pour **Passerelle Jeunesse**, visant à transformer le service d'accompagnement en une solution complète, digitalisée et scalable.

**Objectif principal :** Créer une plateforme permettant aux familles de réserver, suivre et payer des prestations d'accompagnement en toute sécurité.

---

## 🎯 Phase 1 - Fondations (Mois 1-2)

### ✅ Infrastructure technique

- [x] Configuration Next.js + TypeScript
- [x] Intégration Tailwind CSS + Shadcn/UI
- [x] Configuration Firebase
- [x] Architecture des données Firestore
- [x] Types TypeScript pour Firestore
- [x] Règles de sécurité Firestore
- [x] Configuration Firebase Authentication
- [x] Déploiement initial (Firebase Hosting)
- [x] Configuration domaine personnalisé (jeunesse.imogo.org)

### 🎨 Interface utilisateur de base

- [ ] Design system complet (couleurs, typographie, composants)
- [ ] Page d'accueil optimisée
- [ ] Pages informatives :
  - [x] À propos
  - [x] Services
  - [x] Tarifs
  - [x] Sécurité
  - [x] FAQ
  - [x] Mentions légales
  - [x] CGV/CGU
  - [ ] Politique de confidentialité RGPD

### 📱 Responsive design

- [ ] Optimisation mobile-first
- [ ] Tests sur tous devices
- [ ] Performance web (Lighthouse > 90)

---

## ✅ Phase 2 - Authentification & Profils (COMPLÈTE)

### 👤 Système d'authentification

- [x] Inscription parent/tuteur
- [x] Connexion sécurisée
- [x] Réinitialisation mot de passe
- [x] Vérification email
- [x] Connexion via Google

### 📝 Gestion des profils

- [x] Profil parent :
  - Informations personnelles
  - Coordonnées d'urgence
  - Documents administratifs
- [x] Profils jeunes :
  - Informations personnelles
  - Âge et besoins spécifiques
  - Autorisations parentales
  - Contacts d'urgence
  - Allergies/informations médicales
  - Photo de profil avec compression
  - Gestion des documents (certificats, autorisations, pièces d'identité)
- [x] Tableau de bord personnel
- [x] Liste et gestion des jeunes
- [x] Upload et stockage sécurisé des documents

---

## 🚧 Phase 3 - Système de réservation (EN COURS)

### 📅 Moteur de réservation

- [x] Formulaire de demande de prestation :
  - Type de service (local / longue distance)
  - Date et heure
  - Lieu de départ / arrivée
  - Nombre de jeunes
  - Informations complémentaires
- [x] Calcul automatique du tarif
- [x] Service de tarification avec règles métier
- [x] Page de liste des réservations
- [x] Page de détail d'une réservation
- [x] Système d'annulation avec remboursement
- [ ] Vérification de disponibilité
- [ ] Système de créneaux horaires
- [ ] Gestion des trajets récurrents

### 💳 Paiement en ligne

- [x] Intégration Stripe
- [x] Paiement sécurisé par carte
- [x] Génération de devis PDF
- [x] Génération de factures
- [x] Gestion des acomptes
- [x] Remboursements Stripe automatiques

### 📧 Notifications automatiques

- [x] Email de confirmation de réservation
- [x] Email de confirmation de paiement
- [x] Service email avec SendGrid
- [x] Email de rappel automatique (24h avant) avec cron job
- [ ] SMS de rappel (24h avant)
- [ ] Notifications en temps réel
- [ ] Historique des communications

### 🔍 Gestion de disponibilité

- [x] Service de vérification de disponibilité
- [x] API route pour vérifier créneaux disponibles
- [x] Calcul de capacité par type de service
- [x] Validation de date (minimum 24h à l'avance)
- [ ] Interface utilisateur avec sélecteur de créneaux
- [ ] Système de créneaux horaires avancé
- [ ] Gestion des trajets récurrents

---

## 🎯 Phase 4 - Suivi en temps réel (Mois 6)

### 📍 Tracking de mission

- [ ] Statut de la mission en direct :
  - En attente
  - En route vers le point de départ
  - Prise en charge effectuée
  - En transport
  - Arrivée imminente
  - Mission terminée
- [ ] Géolocalisation (optionnelle, avec accord)
- [ ] Photos de confirmation (départ/arrivée)
- [ ] Chat sécurisé accompagnateur ↔ parent

### 📊 Tableau de bord parent

- [ ] Missions à venir
- [ ] Missions en cours
- [ ] Historique complet
- [ ] Documents téléchargeables
- [ ] Factures et paiements

---

## 🎯 Phase 5 - Espace accompagnateur (Mois 7)

### 👔 Interface professionnelle

- [ ] Connexion accompagnateur
- [ ] Planning personnel
- [ ] Missions assignées
- [ ] Fiche mission détaillée :
  - Infos jeune(s)
  - Itinéraire
  - Contacts d'urgence
  - Instructions spéciales
- [ ] Système de rapport de mission
- [ ] Gestion des indisponibilités

### 🔔 Outils de suivi

- [ ] Checklist de mission
- [ ] Scan QR code de prise en charge
- [ ] Upload photos sécurisées
- [ ] Gestion des incidents
- [ ] Historique des missions

---

## 🎯 Phase 6 - Administration (Mois 8)

### 🛠️ Panneau d'administration

- [ ] Dashboard statistiques :
  - Missions du mois
  - Chiffre d'affaires
  - Taux de satisfaction
  - Taux de réservation
- [ ] Gestion des réservations :
  - Validation manuelle
  - Attribution accompagnateur
  - Modifications
  - Annulations
- [ ] Gestion des utilisateurs :
  - Parents
  - Jeunes
  - Accompagnateurs
- [ ] Gestion du contenu du site
- [ ] Export de données (comptabilité)

### 📈 Analytics

- [ ] Google Analytics 4
- [ ] Suivi des conversions
- [ ] Heatmaps (Hotjar)
- [ ] Rapports mensuels automatisés

---

## 🎯 Phase 7 - Fonctionnalités avancées (Mois 9-10)

### ⭐ Système d'avis

- [ ] Évaluation post-mission
- [ ] Témoignages parents
- [ ] Page d'avis publics
- [ ] Modération des avis

### 🎁 Programmes de fidélité

- [ ] Carte de fidélité digitale
- [ ] Codes promo
- [ ] Parrainage (réduction pour parrainages)
- [ ] Abonnements mensuels

### 🤝 Partenariats

- [ ] Espace partenaires (écoles, associations)
- [ ] API publique (pour intégrations)
- [ ] Réservations groupées
- [ ] Tarification entreprises

### 🌍 Multilingue

- [ ] Version française (par défaut)
- [ ] Version allemande (Luxembourg)
- [ ] Version anglaise

---

## 🎯 Phase 8 - Mobile App (Mois 11-12)

### 📱 Application native (React Native / Flutter)

- [ ] App parent iOS/Android
- [ ] App accompagnateur iOS/Android
- [ ] Notifications push natives
- [ ] Mode hors-ligne
- [ ] Géolocalisation optimisée

---

## 🎯 Phase 9 - Expansion & Scale (Année 2)

### 🚀 Croissance

- [ ] Recrutement accompagnateurs
- [ ] Extension à d'autres villes :
  - Nancy
  - Strasbourg
  - Luxembourg
- [ ] Marketplace d'accompagnateurs
- [ ] Système de matching automatique

### 🤖 Intelligence artificielle

- [ ] Optimisation des trajets
- [ ] Prédiction de demande
- [ ] Chatbot support client
- [ ] Détection de fraude

### 🔒 Conformité & Sécurité

- [ ] Certification Qualiopi (si formation)
- [ ] Audit de sécurité
- [ ] Conformité RGPD approfondie
- [ ] Assurance cyber-risques

---

## 📊 KPIs & Objectifs

### Année 1

- 100 familles inscrites
- 500 missions réalisées
- Taux de satisfaction > 95%
- CA : 40 000€

### Année 2

- 500 familles inscrites
- 3 000 missions réalisées
- 5 accompagnateurs actifs
- CA : 150 000€

### Année 3

- 2 000 familles inscrites
- Présence dans 5 villes
- 15 accompagnateurs
- CA : 400 000€

---

## 🛠️ Stack technique

### Frontend

- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS + Shadcn/UI
- React Hook Form
- Zustand (state management)

### Backend

- Firebase Auth
- Firestore Database
- Firebase Storage
- Firebase Functions (serverless)
- Firebase Cloud Messaging

### Paiement & Communication

- Stripe
- SendGrid / Brevo (emails)
- Twilio (SMS)

### DevOps

- Firebase Hosting
- GitHub Actions (CI/CD)
- Sentry (monitoring erreurs)
- Vercel (alternative déploiement)

---

## ⚠️ Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Conformité légale (mineurs) | Élevé | Moyen | Consultation avocat, assurances spécifiques |
| Sécurité des données | Élevé | Faible | Chiffrement, audit, RGPD strict |
| Adoption lente | Moyen | Moyen | Marketing ciblé, partenariats locaux |
| Concurrence | Faible | Moyen | Différenciation qualité, proximité |
| Coûts tech | Moyen | Faible | Architecture scalable, Firebase gratuit au départ |

---

## 💰 Budget prévisionnel

### Développement

- Développeur (toi) : gratuit / sweat equity
- Design/UX : 2 000€
- Stack technique : ~100€/mois (Firebase, domaine, outils)
- Total Année 1 : ~3 500€

### Marketing

- Site web : inclus
- Google Ads : 2 000€/an
- Flyers/cartes : 500€
- Total : ~2 500€

### Légal & Assurances

- Assurance RC Pro : 600€/an
- Avocat / conseils : 1 500€
- Total : ~2 100€

**Total investissement Année 1 : ~8 000€**

---

## 🎉 Quick Wins (Priorités immédiates)

1. ✅ **Finir les pages informatives** (FAQ, mentions légales)
2. **Mettre en ligne une v1 statique** pour tester le marché
3. **Créer un formulaire de contact** simple (Google Forms temporaire)
4. **Lancer une campagne locale Facebook** pour tester l'intérêt
5. **Réaliser 10 missions pilotes manuelles** avant d'automatiser

---

## 📅 Timeline visuelle

```
Mois 1-2  : ████████░░░░░░░░░░░░░░░░   Fondations
Mois 3    : ░░░░░░░░████░░░░░░░░░░░░   Auth & Profils
Mois 4-5  : ░░░░░░░░░░░░████████░░░░   Réservation
Mois 6    : ░░░░░░░░░░░░░░░░░░░░████   Suivi temps réel
Mois 7    : ░░░░░░░░░░░░░░░░░░░░░░░░   Espace pro
Mois 8    : ████░░░░░░░░░░░░░░░░░░░░   Admin
Mois 9-10 : ░░░░████████░░░░░░░░░░░░   Avancé
Mois 11-12: ░░░░░░░░░░░░████████░░░░   Mobile
```

---

## ✅ Next Steps (Cette semaine)

1. [x] Finaliser les pages légales (mentions, CGV, RGPD)
2. [x] Créer la page FAQ
3. [x] Définir l'architecture Firestore
4. [x] Créer les premiers schémas de la base de données
5. [x] Mettre en place Firebase Authentication
6. [x] Créer les pages de connexion et d'inscription
7. [x] Tester l'authentification complète
8. [x] Déployer en production (jeunesse.imogo.org)
9. [ ] Créer la gestion des profils jeunes
10. [ ] Implémenter l'upload de photos

---

**Dernière mise à jour :** 15 février 2026  
**Version :** 1.2  
**Auteur :** Nathan Imogo – Passerelle Jeunesse

---

## 🔄 Dernières modifications (15/02/2026)

### ✅ Phase 3 - Paiements et Documents PDF (TERMINÉE)

#### 📄 Génération de documents PDF

- [x] **Service PDF complet** (`src/lib/pdf-service.ts`) :
  - Génération de devis professionnels avec logo et détails
  - Génération de factures avec statut de paiement
  - Templates responsifs et conformes
  - Numérotation automatique des documents
  - Fonction de téléchargement et conversion en Blob

- [x] **Composant DocumentDownloads** :
  - Boutons de téléchargement dans la page de détail de réservation
  - Gestion des états de chargement
  - Toast notifications de succès/erreur
  - Désactivation conditionnelle (facture disponible après paiement)

- [x] **Intégration UI** :
  - Card "Documents" dans la sidebar droite
  - Design cohérent avec le reste de l'interface
  - Messages d'aide contextuels

#### 📧 Notifications emails automatiques

- [x] **Service email SendGrid** (`src/lib/email-service.ts`) :
  - Configuration SendGrid avec clé API
  - 3 types d'emails HTML responsifs :
    - Confirmation de réservation (avec récapitulatif et lien de paiement)
    - Confirmation de paiement (acompte ou solde)
    - Rappel 24h avant la prestation
  - Templates HTML professionnels avec design moderne
  - Gestion des erreurs sans bloquer les actions principales

- [x] **Intégration dans les API routes** :
  - Email envoyé après paiement (webhook Stripe)
  - API route `/api/bookings/create` pour créer réservation + email
  - Récupération des informations utilisateur via Firebase Admin

- [x] **Documentation complète** (`docs/sendgrid-setup.md`) :
  - Guide pas-à-pas de configuration SendGrid
  - Instructions de vérification d'email expéditeur
  - Configuration des variables d'environnement
  - Dépannage et bonnes pratiques
  - Informations sur les quotas et limites

#### 🔧 Configuration

- [x] Installation des dépendances :
  - `jspdf` et `jspdf-autotable` pour les PDFs
  - `@sendgrid/mail` pour les emails

- [x] Variables d'environnement ajoutées :
  - `SENDGRID_API_KEY` : Clé API SendGrid
  - `SENDGRID_FROM_EMAIL` : Email expéditeur vérifié
  - Mise à jour de `.env.example` avec exemples

#### 🎯 Résultat

**Phase 3 complétée à 95% !**

Fonctionnalités manquantes :
- [ ] Interface utilisateur pour sélection de créneaux horaires
- [ ] SMS de rappel (24h avant) - alternative aux emails
- [ ] Trajets récurrents (réservations répétées)
- [ ] Notifications en temps réel (WebSocket/Firebase)

**Prochaine priorité suggérée** : Phase 4 - Suivi en temps réel ou finaliser l'interface de sélection de créneaux.

### 📦 Fichiers créés/modifiés

**Nouveaux fichiers** :
- `src/lib/pdf-service.ts` (450 lignes) - Service génération PDF
- `src/components/documents/document-downloads.tsx` (110 lignes) - Composant téléchargement
- `src/lib/email-service.ts` (600 lignes) - Service emails SendGrid
- `src/app/api/bookings/create/route.ts` (80 lignes) - API création réservation + email
- `docs/sendgrid-setup.md` (350 lignes) - Guide configuration SendGrid

**Fichiers modifiés** :
- `src/app/dashboard/bookings/[id]/page.tsx` - Ajout composant DocumentDownloads
- `src/app/api/webhooks/stripe/route.ts` - Envoi email après paiement
- `.env.example` - Ajout variables SendGrid
- `docs/roadmap.md` - Mise à jour progression Phase 3

---

## 🔄 Dernières modifications (15/02/2026)

### ✅ Finalisation Phase 3 - Option 1

#### 💰 Remboursements Stripe automatiques

- [x] **Service de remboursement** (`src/lib/firestore-admin-service.ts`) :
  - `cancelBookingAdmin()` : Annule réservation et traite remboursement Stripe
  - Détection automatique du payment_intent_id (deposit ou balance)
  - Appel API Stripe `createRefund()` avec montant calculé
  - Gestion des erreurs avec statut 'pending' pour traitement manuel
  - Statuts de remboursement : 'pending', 'processed', 'completed', 'not_applicable'

- [x] **API route d'annulation** (`src/app/api/bookings/[id]/cancel/route.ts`) :
  - Authentification utilisateur via Firebase Auth
  - Calcul automatique du remboursement selon délai (>48h → remboursement acompte)
  - Appel de `cancelBookingAdmin()` pour traiter annulation + remboursement
  - Gestion des erreurs avec messages clairs

- [x] **Webhook Stripe** (`src/app/api/webhooks/stripe/route.ts`) :
  - Handler pour événement `charge.refunded`
  - Recherche du booking par payment_intent_id
  - Mise à jour du statut : 'processed' → 'completed'
  - Enregistrement de `stripeRefundId` et `refundedAt`

- [x] **Interface utilisateur** (`src/app/dashboard/bookings/[id]/page.tsx`) :
  - Modification de `handleCancel()` pour appeler l'API route
  - Affichage du montant du remboursement dans la confirmation
  - Messages d'erreur clairs en cas d'échec

#### 🔔 Rappels automatiques 24h

- [x] **API route cron** (`src/app/api/cron/send-reminders/route.ts`) :
  - Recherche des bookings prévus dans 23-25h (fenêtre de 2h)
  - Filtre les bookings annulés et déjà notifiés (`reminderSent`)
  - Envoi email de rappel via `sendReminderEmail()`
  - Marquage `reminderSent: true` après envoi
  - Authentification par secret (`CRON_SECRET`)
  - Statistiques détaillées : envoyés, ignorés, erreurs

- [x] **Configuration Vercel Cron** (`vercel.json`) :
  - Cron job configuré : toutes les heures (`0 */1 * * *`)
  - Endpoint : `/api/cron/send-reminders`
  - Activé automatiquement au déploiement

- [x] **Variables d'environnement** (`.env.example`) :
  - `CRON_SECRET` : Secret pour sécuriser l'endpoint cron
  - Documentation sur la génération de secret sécurisé

#### 🔍 Système de disponibilité

- [x] **Service de disponibilité** (`src/lib/availability-service.ts`) :
  - `checkAvailability()` : Vérifie si créneau disponible (fenêtre ±2h)
  - `getAvailableTimeSlots()` : Liste des créneaux disponibles par jour
  - `isValidBookingDate()` : Validation date (24h min, 6 mois max)
  - Gestion de capacité par type (accompagnement: 5, urgence: 2)
  - Utilise Firebase Admin pour requêtes privilégiées

- [x] **API routes disponibilité** :
  - `POST /api/availability/check` : Vérifie un créneau spécifique
  - `GET /api/availability/slots` : Liste créneaux disponibles d'une date
  - Validation des paramètres et gestion d'erreurs

#### 📚 Documentation complète

- [x] **Guide remboursements et rappels** (`docs/refunds-and-reminders.md`) :
  - Documentation complète (4000+ lignes)
  - Architecture détaillée avec diagrammes de flux
  - Politique d'annulation et remboursement
  - Configuration cron job (Vercel et alternatives)
  - Sécurité avec `CRON_SECRET`
  - Tests et dépannage
  - Monitoring et KPIs
  - Améliorations futures

### 📦 Fichiers créés

**Remboursements** :
- `src/app/api/bookings/[id]/cancel/route.ts` (70 lignes) - API annulation avec remboursement
- Modifications dans `src/lib/firestore-admin-service.ts` (+80 lignes) - `cancelBookingAdmin()`
- Modifications dans `src/app/api/webhooks/stripe/route.ts` (+60 lignes) - Handler `charge.refunded`

**Rappels automatiques** :
- `src/app/api/cron/send-reminders/route.ts` (150 lignes) - Cron job rappels 24h
- `vercel.json` (10 lignes) - Configuration cron Vercel

**Disponibilité** :
- `src/lib/availability-service.ts` (150 lignes) - Service de vérification
- `src/app/api/availability/check/route.ts` (50 lignes) - API vérification
- `src/app/api/availability/slots/route.ts` (40 lignes) - API créneaux

**Documentation** :
- `docs/refunds-and-reminders.md` (400+ lignes) - Guide complet

### 🔧 Configuration

- [x] Variable `CRON_SECRET` ajoutée à `.env.example`
- [x] Import `updateBookingAdmin` dans webhook Stripe
- [x] Suppression import `cancelBooking` client-side (remplacé par API)

#### 🎯 Résultat

**Phase 3 complétée à 95% !** 🎉

**Fonctionnalités terminées aujourd'hui** :
✅ Remboursements Stripe automatiques avec webhooks  
✅ Rappels email 24h automatiques (cron job)  
✅ Service de vérification de disponibilité  
✅ API routes pour disponibilité  
✅ Documentation complète des nouvelles fonctionnalités

**Fonctionnalités restantes Phase 3** :
- [ ] Interface utilisateur pour sélection de créneaux horaires
- [ ] SMS de rappel (alternative/complément aux emails)
- [ ] Trajets récurrents (réservations répétées automatiques)

**Infrastructure prête pour Phase 4** : Suivi en temps réel ! 🚀

---

## 🔄 Dernières modifications (14/02/2026)

### ✅ Corrections de bugs

- [x] **Sélecteur de date corrigé** : Les calendriers dans les formulaires (ajout de jeune, réservation) fonctionnent maintenant correctement avec la locale française
- [x] **Logo officiel intégré** : Remplacement de l'icône temporaire par le logo officiel dans tout le site
- [x] **Métadonnées SEO et PWA** : Amélioration des métadonnées Open Graph, Twitter Card, et ajout du manifeste PWA

### 📦 Fichiers ajoutés

- Logo officiel (1024x1024) dans `public/images/`
- Favicon et icône iOS
- Manifeste PWA pour installation sur mobile

---
