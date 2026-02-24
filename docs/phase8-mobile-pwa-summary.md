# Phase 8 — Application Mobile PWA Universelle

**Date :** 25 février 2026  
**Statut :** ✅ TERMINÉ  

## Approche choisie

Au lieu de créer des applications natives séparées (React Native / Flutter), nous avons choisi une approche **PWA (Progressive Web App) universelle** qui offre une expérience quasi-native tout en gardant une seule base de code Next.js. Les avantages :

- Pas de double maintenance (web + natif)
- Installation directe depuis le navigateur
- Fonctionne hors-ligne
- Notifications push
- Mise à jour automatique sans App Store

## Architecture créée

### Service Workers

- **`sw-parent.js`** (~370 lignes) — Service Worker pour les parents
  - 4 stratégies de cache : StaleWhileRevalidate, NetworkFirst, CacheFirstWithUpdate, ApiCache
  - Precache des pages dashboard + assets
  - Push notifications avec actions contextuelles (répondre, voir détails, noter, suivre)
  - Background Sync pour réservations, messages et avis offline
  - IndexedDB intégré pour les données en attente de synchronisation
- **`sw-accompanist.js`** (existant) — Service Worker accompagnateurs renforcé

### Stockage offline (IndexedDB)

- **`offline-storage.ts`** (~350 lignes)
  - 6 object stores : cached-bookings, cached-messages, cached-profile, pending-actions, cached-positions, sync-log
  - CRUD générique + méthodes spécialisées
  - Moteur de synchronisation automatique (`syncAllPending()`)
  - Estimation stockage via StorageManager API

### Hooks

- **`use-universal-pwa.ts`** — Hook PWA unifié parents + accompagnateurs
  - Enregistrement SW conditionnel par rôle
  - Installation, mise à jour, connectivité
  - Sync offline avec compteur d'actions en attente
  - Gestion permissions notifications
  - Détection type de connexion (Network Information API)

### Composants mobiles

- **`mobile-bottom-nav.tsx`** — Barre de navigation fixe en bas (5 onglets avec badges)
  - Navigation parent : Accueil, Réservations, Messages, Avis, Profil
  - Navigation accompagnateur : Accueil, Missions, Messages, Avis, Profil
  - Safe-area iOS supportée
  - Desktop masquée (md:hidden)

- **`mobile-shell.tsx`** — Shell englobant pour l'expérience mobile
  - Intègre : bottom nav + install banner + offline indicator + padding safe-area

- **`pull-to-refresh.tsx`** — Geste pull-to-refresh natif
  - Résistance progressive, indicateur visuel, callback async

- **`enhanced-install-banner.tsx`** — Bannière d'installation améliorée
  - Carte flottante avec icône app, CTA "Installer", "Plus tard"
  - Bannière mise à jour avec CTA "Mettre à jour"

- **`offline-indicator.tsx`** — Indicateur de statut réseau
  - Barre orange "Mode hors-ligne" avec compteur d'actions
  - Barre verte "Connexion rétablie" transitoire
  - Barre bleue "Actions en attente" avec bouton Sync

- **`live-tracking-map.tsx`** — Carte temps réel pour parents
  - Google Maps embarqué avec marqueur accompagnateur
  - Marqueurs pickup (vert) et destination (rouge)
  - Écoute Firestore en temps réel de la position
  - Statut mission + ETA
  - Bouton appel accompagnateur
  - Mode plein écran
  - Fallback texte sans Google Maps

### Page offline

- **`/offline`** — Page dédiée affichée quand l'utilisateur navigue hors-ligne
  - Liste des fonctionnalités disponibles/indisponibles offline
  - Boutons Réessayer, Retour, Accueil

### Manifest PWA

- **`manifest.json`** enrichi (~130 lignes)
  - 14 entrées d'icônes (16→1024 + maskable)
  - 3 raccourcis : Réservations, Nouvelle réservation, Messages
  - 2 screenshots mobile
  - `launch_handler: { client_mode: "focus-existing" }`
  - `categories`, `lang: "fr"`, `dir: "ltr"`

### Icônes

- 10 fichiers PNG générés à partir de `logo.png` (1024×1024)
- Tailles : 72, 96, 128, 144, 152, 192, 384, 512 + maskable-192, maskable-512

## Intégration

- `MobileShell` intégré dans le dashboard parent (`/dashboard`)
- `MobileShell` intégré dans le dashboard accompagnateur (`/dashboard/accompanist`)
- Hook `useUniversalPWA` enregistre le bon SW selon le rôle

## Fichiers créés / modifiés

### Nouveaux fichiers (12)

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `public/sw-parent.js` | ~370 | Service Worker parent |
| `src/app/offline/page.tsx` | ~80 | Page fallback offline |
| `src/lib/offline-storage.ts` | ~350 | IndexedDB service |
| `src/hooks/use-universal-pwa.ts` | ~175 | Hook PWA universel |
| `src/components/pwa/mobile-bottom-nav.tsx` | ~115 | Nav mobile inférieure |
| `src/components/pwa/mobile-shell.tsx` | ~50 | Shell mobile englobant |
| `src/components/pwa/pull-to-refresh.tsx` | ~130 | Pull-to-refresh |
| `src/components/pwa/enhanced-install-banner.tsx` | ~100 | Bannière installation |
| `src/components/pwa/offline-indicator.tsx` | ~100 | Indicateur offline |
| `src/components/mission/live-tracking-map.tsx` | ~430 | Carte suivi temps réel |
| `public/images/icons/*.png` | — | 10 icônes PWA |
| `docs/phase8-mobile-pwa-summary.md` | — | Ce document |

### Fichiers modifiés (3)

| Fichier | Changement |
|---------|------------|
| `public/manifest.json` | Enrichi (33 → ~130 lignes) |
| `src/app/dashboard/page.tsx` | Import + wrapping MobileShell |
| `src/app/dashboard/accompanist/page.tsx` | MobileShell remplace PWAInstallBanner |

## Stratégies de cache (sw-parent.js)

| Stratégie | Usage | Comportement |
|-----------|-------|-------------|
| **StaleWhileRevalidate** | Pages générales | Retourne le cache puis met à jour en arrière-plan |
| **NetworkFirst** | Pages HTML, navigation | Réseau d'abord, fallback cache, puis /offline |
| **CacheFirstWithUpdate** | JS, CSS, images, fonts | Cache d'abord puis mise à jour silencieuse |
| **ApiCache** | Routes API bookings, reviews, etc. | Cache 5min, fallback JSON hors-ligne |

## Object Stores IndexedDB

| Store | Index | Usage |
|-------|-------|-------|
| `cached-bookings` | status | Réservations pour consultation offline |
| `cached-messages` | — | Messages récents cachés |
| `cached-profile` | — | Profil utilisateur |
| `pending-actions` | type, timestamp | Actions en attente de sync (réservations, messages, avis) |
| `cached-positions` | timestamp | Positions GPS (max 200) |
| `sync-log` | timestamp, status | Journal de synchronisation |
