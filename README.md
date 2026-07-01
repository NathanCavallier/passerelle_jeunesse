# 🌟 Passerelle Jeunesse

**Plateforme d'accompagnement éducatif pour les jeunes de 7 à 20 ans**

Une solution complète de gestion et réservation de services d'accompagnement personnalisés : école, sports, loisirs, autonomie.

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner le projet
git clone https://github.com/nathanimogo/passerelle_jeunesse.git
cd passerelle_jeunesse

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:9002](http://localhost:9002)

### ⚠️ Configuration Firebase requise

**Si vous voyez l'erreur "Failed to get document because the client is offline"**, suivez le guide complet :

📘 **[Guide de configuration Firebase](./docs/firebase-setup.md)**

Étapes essentielles :

1. Activer Firestore Database dans Firebase Console
2. Se connecter à Firebase CLI : `firebase login`
3. Déployer les règles : `firebase deploy --only firestore:rules`

## 🏗️ Stack technique

- **Framework** : Next.js 15 (React 19, App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + Shadcn/UI
- **Backend** : Firebase (Auth, Firestore, Storage, Functions)
- **Formulaires** : React Hook Form + Zod
- **Déploiement** : Firebase Hosting → [jeunesse.imogo.org](https://jeunesse.imogo.org)

## 📂 Structure du projet

```
passerelle_jeunesse/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   │   ├── login/        # Page de connexion
│   │   ├── signup/       # Page d'inscription
│   │   ├── dashboard/    # Tableau de bord utilisateur
│   │   └── ...
│   ├── components/       # Composants React
│   │   ├── auth/         # Composants d'authentification
│   │   ├── ui/           # Composants UI Shadcn
│   │   └── ...
│   ├── lib/              # Services et utilitaires
│   │   ├── firebase.ts   # Configuration Firebase
│   │   ├── auth-service.ts      # Service d'authentification
│   │   └── firestore-service.ts # Service Firestore
│   ├── contexts/         # Contextes React
│   │   └── auth-context.tsx     # Contexte d'authentification
│   ├── hooks/            # Hooks personnalisés
│   └── types/            # Types TypeScript
│       └── firestore.ts  # Types Firestore
├── docs/
│   ├── firebase-setup.md        # Guide Firebase
│   ├── firestore-architecture.md # Architecture BDD
│   ├── roadmap.md               # Roadmap du projet
│   └── blueprint.md             # Brief initial
├── firestore.rules       # Règles de sécurité Firestore
├── storage.rules         # Règles de sécurité Storage
└── firebase.json         # Configuration Firebase
```

## 🔐 Authentification

Le système d'authentification supporte :

- ✅ **Email + Mot de passe** : Inscription et connexion classiques
- ✅ **Google OAuth** : Connexion rapide avec compte Google
- ✅ **Réinitialisation de mot de passe** : Email de récupération
- ✅ **Vérification d'email** : Envoi automatique après inscription
- ✅ **Gestion des rôles** : Parent, Accompagnateur, Administrateur

## 📊 Base de données Firestore

Architecture complète avec 9 collections :

- **users** : Profils utilisateurs (parents, accompagnateurs, admins)
- **youngsters** : Profils des jeunes accompagnés
- **bookings** : Réservations de prestations
- **missions** : Missions affectées aux accompagnateurs
- **payments** : Historique des paiements
- **reviews** : Avis et évaluations
- **notifications** : Notifications utilisateurs
- **messages** : Messagerie interne
- **stats** : Statistiques et analyses

📘 **[Documentation complète](./docs/firestore-architecture.md)**

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev          # Serveur de développement (port 9002)

# Build
npm run build        # Build de production Next.js
npm run start        # Serveur de production

# Firebase
firebase login       # Se connecter à Firebase
firebase deploy      # Déployer tout
firebase deploy --only firestore:rules  # Règles Firestore uniquement
firebase deploy --only hosting          # Hosting uniquement

# Outils
npm run lint         # Vérifier le code
```

## 📖 Documentation

- 📘 [Guide de configuration Firebase](./docs/firebase-setup.md)
- 📊 [Architecture Firestore](./docs/firestore-architecture.md)
- 🗺️ [Roadmap du projet](./docs/roadmap.md)
- 📋 [Brief initial](./docs/blueprint.md)

## 🎯 Roadmap

Le projet suit un développement en 9 phases sur 12+ mois :

### ✅ Phase 1 - Fondations (COMPLÈTE)

- Configuration Firebase
- Système d'authentification
- Architecture base de données
- Pages légales (FAQ, CGV, Mentions légales)

### ✅ Phase 2 - Profils utilisateurs (COMPLÈTE)

- Gestion des profils jeunes
- Upload de photos avec compression
- Upload et gestion des documents
- Informations médicales et contacts d'urgence

### 🚧 Phase 3 - Système de réservation (EN COURS)

- Formulaire de réservation avec calcul automatique des tarifs
- Liste et détail des réservations
- Service de tarification avec réductions
- Système d'annulation avec remboursement

### Phases suivantes

- Phase 4 : Paiements Stripe
- Phase 5 : Dashboard accompagnateurs
- Phase 6 : Messagerie interne
- Phase 7 : Notifications
- Phase 8 : Avis et évaluations
- Phase 9 : Analytics et optimisation

📘 **[Roadmap complète](./docs/roadmap.md)**

## 🧪 Tests

```bash
# Parcours de test complet
1. Inscription : http://localhost:9002/signup
2. Vérifier Firebase Console → Authentication
3. Vérifier Firestore → Collection users
4. Connexion : http://localhost:9002/login
5. Dashboard : http://localhost:9002/dashboard
6. Déconnexion
```

## 📞 Contact

**Passerelle Jeunesse**

- **Email** : <contact@jeunesse.imogo.org>
- **Site** : [jeunesse.imogo.org](https://jeunesse.imogo.org)
- **Zones d'intervention** : Metz et Saint-Avold

**Développeur**

- Nathan Imogo
- GitHub : [@nathanimogo](https://github.com/nathanimogo)

## 📄 License

Tous droits réservés © 2026 Passerelle Jeunesse

## 🙏 Remerciements

- Firebase pour l'infrastructure backend
- Shadcn/UI pour les composants
- Next.js pour le framework
- Vercel pour l'hébergement

---

**Version actuelle :** 2.0 (Phase 1 complète)
**Dernière mise à jour :** 12 février 2026
