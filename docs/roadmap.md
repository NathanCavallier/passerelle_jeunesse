# 🗺️ ROADMAP – Passerelle Jeunesse v3.0

## Vision: Centre Jeunesse Multifonction – Plateforme Complète

---

## 📋 Vue d'ensemble stratégique

**Passerelle Jeunesse** évolue d'une activité de mobilité vers un **Centre Jeunesse Multifonction** avec 6 pôles de développement.

Cette roadmap détaille :

1. **L'opérationnel actuel** (Phase 1 - Activité de mobilité) ✅ 90% complète
2. **L'expansion progressive** (Phase 2-3 - Ateliers, escape games, numérique)
3. **La modernisation technologique** (Internationalisation FR/EN, Design system v1.0)
4. **L'infrastructure long terme** (Multi-pôles, gestion globale, scale)

---

## 🌍 AXE TRANSVERSAL – Internationalisation (FR/EN)

### 📅 Timeline: Q3 2026 (Juillet-Août, parallèle Phase 2)

### Objectif

Déployer support complet français/anglais pour ouverture à audience anglophone (export, communautés expatriées, plateforme pan-européenne)

### Étapes

#### Phase 1: Setup i18n (Juin-Juillet 2026)

- [ ] Intégration `next-intl` (libraire moderne Next.js)
- [ ] Structure fichiers traduction:

  ```txt
  i18n/
  ├── locales/
  │   ├── fr.json
  │   ├── en.json
  ├── config.ts
  └── middleware.ts
  ```

- [ ] Détection automatique langue navigateur
- [ ] Sélecteur langue (header client)
- [ ] URLs multilingues (`/fr/...` / `/en/...`)
- [ ] SEO multilingues (hreflang tags)

#### Phase 2: Traduction contenu (Juillet-Août 2026)

- [ ] Pages publiques (à propos, services, tarifs)
- [ ] Descriptions pôles (6 services)
- [ ] FAQ multilingue
- [ ] Formulaires réservation
- [ ] Emails SendGrid (templates FR/EN)
- [ ] Dashboard parent et accompagnateur

#### Phase 3: Marketing & Contenu (Août-Septembre 2026)

- [ ] Blog articles (FR/EN)
- [ ] Vidéos sous-titrées
- [ ] Contenu réseaux sociaux LinkedIn/Instagram
- [ ] Documentation pour développeurs/partenaires

---

## 🎨 AXE TRANSVERSAL – Modernisation UI/UX & Design System

### 📅 Timeline: Q3-Q4 2026 (Juillet-Décembre, parallèle Phase 2)

### Phase 1: Design System v1.0 (Juillet 2026)

- [ ] **Audit composants actuels** : Inventaire Shadcn/UI + customisations
- [ ] **Identité visuelle Passerelle Jeunesse**:
  - Palette couleurs finalisée (primaire, secondaire, accents)
  - Typographie (headings: Inter Bold, body: Inter Regular)
  - Espacements & grid (8px baseline)
  - Border radius (md: 6px, lg: 12px)
  - Ombres & élévations

- [ ] **Composants fondamentaux**:
  - Boutons (size: xs/sm/md/lg, variant: primary/secondary/ghost, state: hover/active/disabled)
  - Cartes (service, témoignage, pôle avec overlay)
  - Timeline (missions, phases, pôles — 4 états)
  - Modales & drawers
  - Formulaires avancés (multi-step, validation inline)
  - Badges & tags (couleurs par statut)
  - Loader & skeleton

- [ ] **Storybook ou documentation Figma**

### Phase 2: Refonte Page d'accueil (Août 2026)

- [ ] **Section Hero** (existante, révisée)
  - Baseline CTA claire vers réservation mobilité

- [ ] **Section Vision NOUVELLE**
  - Accroche: "De la mobilité à un centre jeunesse complet"
  - Timeline 3 phases (opérationnel → vision 2027)
  - Composant: `HomepageVisionSection.tsx` (du dossier refonte)

- [ ] **Section Pôles de service NOUVELLE**
  - 6 pôles: Mobilité, Sciences, Escape games, Périscolaire, Numérique (coming soon), [À venir]
  - Cartes avec icône, nom, description, CTA "Découvrir"
  - Grid responsive (1 col mobile, 3 cols desktop)
  - Animations subtiles au scroll

- [ ] **Réorganisation**:
  - Hero → Vision → Pôles → Témoignages → CTA finale
  - Éclairage sur chaque pôle (non plus juste mobilité)

### Phase 3: Pages détail pôles (Août-Septembre 2026)

- [ ] **Structure page générique** (`app/poles/[pole]/page.tsx`):
  - Hero pôle (image, description)
  - Services/ateliers listés
  - Tarification
  - Avis clients
  - CTA réservation

- [ ] **Pages pôles créées**:
  - ✅ `/poles/mobilite` — improve UX
  - [ ] `/poles/sciences-decouverte` (Ateliers 360)
  - [ ] `/poles/escape-games`
  - [ ] `/poles/periscolaire`
  - [ ] `/poles/numerique` (coming soon — locked)

### Phase 4: Dashboard parent modernisé (Septembre 2026)

- [ ] Redesign layout: sidebar nav + main content
- [ ] Cartes de statistiques (missions complétées, crédit restant, activités jeunes)
- [ ] Vue "pôles disponibles" vs "coming soon"
- [ ] Notifications (system messages) prédominantes
- [ ] Accès rapide actions

### Phase 5: Optimisations techniques

- [ ] Lighthouse > 95 (all pages)
- [ ] Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Images: next/image + WebP + srcset
- [ ] Fonts: variable fonts chargement optimisé
- [ ] Animations: GPU-accelerated (transform/opacity)

---

## ✅ Phase 1 - Fondations & Activité Viable (Terminée à 90%)

### Infrastructure ✅ COMPLÈTE

- [x] Next.js 15 + TypeScript + Tailwind CSS
- [x] Firebase (Auth, Firestore, Storage, Messaging)
- [x] Déploiement Firebase Hosting
- [x] Domaine jeunesse.imogo.org

### Authentification & Profils ✅ COMPLÈTE

- [x] Inscription/connexion parents et jeunes
- [x] Réinitialisation mot de passe
- [x] Gestion documents (uploads sécurisés)
- [x] Dashboard personnel

### 🚗 Réservation Mobilité ✅ 85% EN COURS

- [x] Moteur demande de prestation
- [x] Calcul automatique tarif (local/longue distance)
- [x] Liste et détail réservations
- [x] Annulation + remboursement Stripe
- [x] Génération devis & factures PDF
- [x] Emails de confirmation & rappel 24h
- [ ] **Sélecteur créneaux UI** (en cours)
- [ ] **Gestion trajets récurrents** (planifié)

### 📍 Suivi Missions Temps Réel ✅ COMPLÈTE 100%

- [x] 10 statuts de mission (scheduled → completed)
- [x] API mise à jour statut (accompagnateur)
- [x] Timeline visuelle + photos confirmation
- [x] Dashboard missions actives (parent)
- [x] PWA (offline support, notifications push)

### Espace Accompagnateur ✅ COMPLÈTE 100%

- [x] Dashboard avec planning & missions assignées
- [x] Formulaire rapport de mission
- [x] Gestion indisponibilités
- [x] Photos + QR codes

### Admin & Avancé ✅ COMPLÈTE 100%

- [x] Dashboard admin (stats, gestion utilisateurs, export)
- [x] Système d'avis (évaluation post-mission, modération)
- [x] Programme fidélité (points, codes promo, parrainage)
- [x] Support 3 langues (FR, DE, EN à ajouter)

---

## 🌱 Phase 2 - Expansion Services & Modernisation (Juillet 2026 - Février 2027)

### 🎨 Modernisation UI/UX (voir axe transversal)

### 🌍 Internationalisation FR/EN (voir axe transversal)

### 🔬 Pôle Sciences & Découverte (Ateliers 360)

**Septembre 2026 - Lancement ateliers pilotes**

- [ ] **Page `/poles/sciences-decouverte`**
- [ ] **Catalogue ateliers** (6 types):
  - Chimie: volcan chimique, réactions colorées
  - Électricité: circuits simples, magnétisme
  - Physique: fusées à eau, expériences gravité
  - Électronique: LED, buzzers, capteurs
  - Robotique: LEGO Mindstorms, Arduino intro
  - Astronomie: observation, planétarium numérique

- [ ] **Formats**:
  - Ateliers ponctuels (1-2h, samedi)
  - Stages vacances (5 jours)
  - Clubs hebdomadaires (annuel)

- [ ] **Système réservation ateliers**:
  - Formulaire inscription atelier
  - Sélection jeunes (avec filtre âge)
  - Calcul tarif (forfait groupe)
  - Confirmation Stripe
  - Email confirmation + pièces à apporter

- [ ] **Dashboard accompagnateur ateliers**:
  - Liste ateliers programmés
  - Inscrits par atelier
  - Check-in arrivée
  - Évaluation participant

- [ ] **Contenu marketing**: Photos, vidéos (TikTok), blog

### 🎭 Pôle Escape Games & Enquêtes

**Septembre 2026 - Prototype**

- [ ] **Page `/poles/escape-games-enquetes`**
- [ ] **Concepts gamifiés**:
  - Escape Game Scientifique: résoudre panne labo
  - Escape Game Historique: voyage temporal
  - Escape Game Logique: cryptographie, déduction

- [ ] **Réservation**:
  - Choix scénario
  - Groupe 6-12 participants
  - Tarif groupe
  - Confirmation + instructions

- [ ] **Scoring** (futur): temps résolution, classement

### 🏡 Pôle Accueil & Périscolaire

**Août 2026 - Préparation**

- [ ] **Page `/poles/accueil-periscolaire`**
- [ ] **Services**:
  - Accueil après l'école (lun-ven 16h-18h30)
  - Mercredis éducatifs
  - Vacances scolaires (stages)
  - Aide aux devoirs
  - Activités éducatives

- [ ] **Système d'abonnement** (nouveau):
  - Forfaits mensuels (5/10/15 créneaux)
  - Tarification dégressive
  - Gestion absences
  - Facturation automatique

- [ ] **Réservation calendrier** (multi-mois)

### 🎓 Page "À Venir"

**Septembre 2026 - Teasing**

- [ ] **Page `/poles/numerique`** (locked):
  - Preview: Programmation, création jeux vidéo, IA, cybersécurité, impression 3D
  - CTA: "S'alerter du lancement"

- [ ] **Page `/poles/coming-soon`**: Autres pôles à explorer

---

## 🚀 Phase 3 - Vision Long Terme: Centre Jeunesse (Mars 2027 onwards)

### 💻 Pôle Numérique

**Avril 2027 - Lancement pilote**

- [ ] **Ateliers programmation**:
  - Scratch intro (7-10 ans)
  - Python beginner (11+)
  - Web basics (HTML/CSS/JS)

- [ ] **Création jeux vidéo**: Unity, Godot
- [ ] **IA & Cybersécurité**: Intro ML, ethical hacking, sécurité mots de passe
- [ ] **Impression 3D**: Modélisation, impression, projets

- [ ] **Système de progression** (certifications juvéniles)

### 🏛️ Infrastructure Centre Jeunesse

**2027-2028**

- [ ] **Dashboard administrateur**:
  - Vue consolidée 6 pôles
  - Statistiques par pôle (inscriptions, revenus, avis)
  - Gestion accompagnateurs, ressources
  - Rapports financiers

- [ ] **Système de crédit unifié**:
  - Parent recharge compte
  - Consommation multi-pôles
  - Historique crédits

- [ ] **CRM accompagnateurs**:
  - Gestion équipe, planning semaine
  - Communication intégrée
  - Feuilles de route générées

- [ ] **Portal partner** (associations, mairies):
  - Réservation groupe ateliers
  - Tarification volume
  - Statistiques participation

### 📱 Expansion nationale

**2027-2028**

- [ ] Support multi-régions
- [ ] Locaux partenaires
- [ ] Accompagnateurs indépendants (marketplace)
- [ ] Franchising model (exploration)

---

## 📊 État actuel par domaine

| Domaine | Phase | Statut | Priorité | Échéance |
|---------|-------|--------|----------|----------|
| **Mobilité** | 1 | ✅ 90% | ✅ Élevée | Juin 2026 |
| **Auth & Profils** | 1 | ✅ 100% | ✅ Élevée | ✅ Complète |
| **Réservation mobilité** | 1 | ✅ 85% | ✅ Élevée | Juin 2026 |
| **Suivi temps réel** | 1 | ✅ 100% | ✅ Élevée | ✅ Complète |
| **Espace accompagnateur** | 1 | ✅ 100% | ✅ Élevée | ✅ Complète |
| **Admin** | 1 | ✅ 100% | ✅ Élevée | ✅ Complète |
| **PWA** | 1 | ✅ 100% | ✅ Élevée | ✅ Complète |
| **i18n (FR/EN)** | Trans | 🔄 0% | 🟠 Moyenne | Août 2026 |
| **Design system** | Trans | 🔄 20% | 🟠 Moyenne | Juillet 2026 |
| **Ateliers sciences** | 2 | 📋 0% | 🟠 Moyenne | Sept 2026 |
| **Escape games** | 2 | 📋 0% | 🟠 Moyenne | Sept 2026 |
| **Périscolaire** | 2 | 📋 0% | 🟠 Moyenne | Août 2026 |
| **Pôle numérique** | 3 | 📋 0% | 🟡 Faible | Avril 2027 |
| **Admin multi-pôles** | 3 | 📋 0% | 🟡 Faible | 2027 |

---

## 🎯 Prochaines étapes (Juin 2026)

### Immédiat (Cette semaine)

- [ ] Finaliser Phase 1 mobilité (100%)
  - [ ] Sélecteur créneaux UI
  - [ ] Trajets récurrents
  - [ ] Tests utilisateur
- [ ] Lancer axe i18n (setup technique)
- [ ] Démarrer design system

### Court terme (2-4 semaines)

- [ ] Déployer Phase 1 complète (production)
- [ ] Refonte homepage + vision section
- [ ] **Intégrer composants refonte**:
  - `HomepageVisionSection.tsx` (timeline phases)
  - `ProjectVision.tsx` (page vision complète)
  - `PolesGrid.tsx` (6 pôles)

### Moyen terme (Juillet-Août)

- [ ] Traduction complète FR/EN
- [ ] Pages pôles (Sciences, Escape games, Périscolaire)
- [ ] Système réservation ateliers

---

## 💡 Notes de conception

### Composants du dossier `/docs/refonte` à intégrer

```
À créer dans: src/components/

✨ NEW:
- HomepageVisionSection.tsx (section timeline 3 phases)
- ProjectVision.tsx (page vision complète)
- PolesGrid.tsx (6 pôles avec cartes)
- PoleDetailTemplate.tsx (template pages pôles)
- UpcomingPoleTease.tsx (coming soon pages)
```

### Architecture pôles

```
app/
├── poles/
│   ├── page.tsx (overview tous pôles)
│   ├── [pole]/
│   │   ├── page.tsx (détail pôle)
│   │   ├── ateliers/page.tsx
│   │   └── reserver/page.tsx
│   ├── mobilite/
│   ├── sciences-decouverte/
│   ├── escape-games/
│   ├── periscolaire/
│   └── numerique/ (coming soon)
```

### Données Firestore (structure pôles)

```
/poles
├── {poleId}
│   ├── /info (name, description, icon, image)
│   ├── /ateliers (subcollection)
│   └── /pricing (forfaits)

/ateliers (global)
├── {atelierID}
│   ├── metadata (name, description, age, format)
│   ├── /sessions (dates, places)
│   └── /participants (inscrits)

/abonnements (périscolaire)
├── {subId}
│   ├── metadata (forfait, dates)
│   └── /consommation
```

---

## 📚 Documentation de référence

- [project_summary.md](./project_summary.md) — Vue d'ensemble projet
- [firestore-architecture.md](./firestore-architecture.md) — Structure données
- [mission-tracking.md](./mission-tracking.md) — Suivi temps réel (complète)
- [refunds-and-reminders.md](./refunds-and-reminders.md) — Remboursements & rappels
- Dossier `/docs/refonte/` — Composants et vision (à intégrer)

---

## 🎓 Jalons clés

| Jalon | Date cible | Statut |
|-------|-----------|--------|
| Phase 1 mobilité 100% | 30 juin 2026 | 🟠 En cours |
| i18n setup | 15 juillet 2026 | 📋 À démarrer |
| Design system v1.0 | 31 juillet 2026 | 📋 À démarrer |
| Homepage refonte + vision | 31 août 2026 | 📋 À démarrer |
| Ateliers sciences lancé | 30 septembre 2026 | 📋 À démarrer |
| Escape games beta | 31 octobre 2026 | 📋 À démarrer |
| i18n traduction complète | 30 novembre 2026 | 📋 À démarrer |
| Pôle numérique pilote | 30 avril 2027 | 📋 Planifié |
| Centre jeunesse v1 complète | 30 juin 2027 | 📋 Vision |

---

## 🛠️ Stack technique

- **Frontend**: Next.js 15 (React 19), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Firebase (Auth, Firestore, Storage, Functions, Messaging)
- **Paiement**: Stripe (paiements, remboursements, webhooks)
- **Communication**: SendGrid (emails HTML), Twilio (SMS optionnel)
- **DevOps**: Firebase Hosting, GitHub Actions (CI/CD), Vercel Cron

---

## 💰 Budget estimé Année 1

- **Développement**: 3 500€ (design, domaine, Firebase Spark/Blaze)
- **Marketing**: 2 500€ (Google Ads, supports imprimés)
- **Légal & Assurances**: 2 100€ (RC Pro, conseils avocat)
- **Total**: ~8 000€

---

## 📅 Timeline visuelle

```
Q2 2026 : Phase 1 finalisation (mobilité)
Q3 2026 : Modernisation UI + i18n + Ateliers sciences
Q4 2026 : Escape games + Périscolaire + Traduction complète
Q1 2027 : Pôle numérique préparation
Q2 2027 : Pôle numérique lancement + Centre jeunesse v1
```

---

**Mise à jour**: 5 juin 2026  
**Version**: 3.0  
**Responsable**: Nathan Imogo – Passerelle Jeunesse  
**Prochaine révision**: 20 juin 2026
