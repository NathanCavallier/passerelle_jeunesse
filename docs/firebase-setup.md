# 🚀 Guide de déploiement Firebase

Ce guide vous accompagne pour configurer et déployer votre projet sur Firebase.

## ✅ Prérequis

- Compte Firebase actif
- Firebase CLI installé ✅
- Projet Firebase créé (`studio-6855979452-20286`) ✅

---

## 📋 Étape 1 : Activer Firestore Database

**L'erreur "Failed to get document because the client is offline" signifie que Firestore n'est pas encore activé.**

### Actions à effectuer :

1. **Aller dans la console Firebase :**
   ```
   https://console.firebase.google.com/project/studio-6855979452-20286/firestore
   ```

2. **Créer la base de données :**
   - Cliquer sur **"Create database"** (ou "Créer une base de données")
   - Sélectionner **"Start in production mode"**
   - Choisir la région : **europe-west3 (Frankfurt)** (recommandé pour la France)
   - Confirmer

3. **Attendre la création :** 
   - Cela prend environ 1-2 minutes
   - Vous verrez un écran vide avec "Start collection"

✅ **Firestore est maintenant actif !**

---

## 📋 Étape 2 : Se connecter à Firebase CLI

```bash
firebase login
```

Cela ouvrira votre navigateur pour vous connecter avec votre compte Google.

---

## 📋 Étape 3 : Déployer les règles de sécurité

Une fois Firestore activé, déployez les règles de sécurité et les index :

```bash
# Déployer les règles Firestore
firebase deploy --only firestore:rules

# Déployer les index Firestore
firebase deploy --only firestore:indexes

# Déployer les règles Storage (optionnel pour l'instant)
firebase deploy --only storage
```

✅ **Les règles sont maintenant déployées !**

---

## 📋 Étape 4 : Activer Storage (optionnel)

Pour l'upload d'images et documents :

1. Aller dans **Storage** : https://console.firebase.google.com/project/studio-6855979452-20286/storage
2. Cliquer sur **"Get started"**
3. Accepter les règles par défaut
4. Choisir la région : **europe-west3**

---

## 🧪 Étape 5 : Tester l'application

Redémarrez le serveur de développement :

```bash
npm run dev
```

### Parcours de test :

1. **Page d'inscription** : http://localhost:9002/signup
   
2. **Créer un compte :**
   - Remplir le formulaire avec vos informations
   - Cliquer sur "S'inscrire"

3. **Vérifier Firebase Console :**
   - **Authentication** : Nouvel utilisateur visible
   - **Firestore → users** : Document utilisateur créé avec profil

4. **Tester la connexion :**
   - Page login : http://localhost:9002/login
   - Connexion avec email/password
   - Connexion avec Google

5. **Accéder au dashboard :**
   - Redirection automatique après login
   - URL : http://localhost:9002/dashboard

---

## 🐛 Dépannage

### Erreur "Failed to get document because the client is offline"

**Cause :** Firestore n'est pas activé
**Solution :** Suivre l'Étape 1

### Erreur "Missing or insufficient permissions"

**Cause :** Les règles Firestore ne sont pas déployées
**Solution :** `firebase deploy --only firestore:rules`

### Erreur "The current domain is not authorized for OAuth operations"

**Cause :** Le domaine n'est pas dans la liste des domaines autorisés pour Google OAuth
**Solution :** Ajouter votre domaine dans Firebase Console

**Étapes détaillées :**

1. **Aller dans Authentication → Settings :**
   ```
   https://console.firebase.google.com/project/studio-6855979452-20286/authentication/settings
   ```

2. **Onglet "Authorized domains" :**
   - Cliquer sur **"Add domain"**
   - Entrer : `jeunesse.imogo.org`
   - Cliquer sur **"Add"**

3. **Domaines à ajouter :**
   - `localhost` (pour le développement)
   - `jeunesse.imogo.org` (domaine personnalisé)
   - `studio-6855979452-20286.web.app` (domaine Firebase par défaut)
   - `studio-6855979452-20286.firebaseapp.com` (domaine Firebase secondaire)

✅ **L'authentification Google OAuth fonctionne maintenant sur tous les domaines !**

### Erreur "Firebase: Error (auth/popup-blocked)"

**Cause :** Le navigateur bloque les popups Google
**Solution :** Autoriser les popups pour le domaine

### Les variables d'environnement ne sont pas chargées

**Cause :** Le fichier .env.local n'est pas lu
**Solution :** 
```bash
# Redémarrer le serveur
npm run dev
```

---

## � Déploiement en production

### Build et déploiement

```bash
# Build de l'application
npm run build

# Déployer sur Firebase Hosting
firebase deploy --only hosting

# Déployer tout (rules + hosting)
npm run build && firebase deploy
```

### URLs de l'application

- **Production** : https://jeunesse.imogo.org
- **Firebase (par défaut)** : https://studio-6855979452-20286.web.app
- **Développement** : http://localhost:9002

### Configuration du domaine personnalisé

Si vous souhaitez utiliser un domaine personnalisé (déjà configuré pour jeunesse.imogo.org) :

1. **Aller dans Hosting → Domaines personnalisés**
2. **Ajouter un domaine** et suivre les instructions DNS
3. **Ajouter le domaine dans les domaines autorisés** (voir section OAuth ci-dessus)

---

## �📦 Structure des fichiers Firebase

```
passerelle_jeunesse/
├── firebase.json              # Configuration Firebase
├── .firebaserc                # Projet par défaut
├── firestore.rules            # Règles de sécurité Firestore
├── firestore.indexes.json     # Index Firestore
├── storage.rules              # Règles de sécurité Storage
└── .env.local                 # Variables d'environnement
```

---

## 🎯 Prochaines étapes

Une fois Firestore configuré et testé :

1. ✅ **Phase 1 - Fondations** : COMPLÈTE
   - Firebase configuré
   - Authentication fonctionnelle
   - Base de données structurée

2. 🚧 **Phase 2 - Profils utilisateurs**
   - Gestion des jeunes
   - Photo de profil
   - Documents

3. 🚧 **Phase 3 - Système de réservation**
   - Formulaire de demande
   - Calcul des tarifs
   - Paiements Stripe

---

## 📞 Support

Si vous rencontrez un problème :
1. Vérifier les logs dans la console navigateur (F12)
2. Vérifier les logs Firebase Console
3. Vérifier que toutes les étapes ci-dessus sont complétées

---

**Dernière mise à jour :** 13 février 2026
