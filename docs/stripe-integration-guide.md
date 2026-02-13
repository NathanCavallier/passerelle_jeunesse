# Guide d'intégration Stripe

## ✅ Ce qui a été implémenté

### Infrastructure de paiement complète

1. **Services Stripe**
   - `src/lib/stripe-server.ts` : Service côté serveur (paiements, remboursements, webhooks)
   - `src/lib/stripe-client.ts` : Service côté client (chargement de Stripe.js)

2. **API Routes**
   - `src/app/api/payments/create-checkout-session/route.ts` : Création de sessions de paiement
   - `src/app/api/webhooks/stripe/route.ts` : Gestion des événements webhooks Stripe

3. **Composants UI**
   - `src/components/payments/payment-button.tsx` : Bouton de paiement réutilisable
   - Intégration dans `/dashboard/bookings/[id]` : Boutons pour acompte et solde

4. **Configuration**
   - `.env.local` : Variables d'environnement Stripe (avec valeurs placeholder)
   - `.env.example` : Template de configuration avec documentation

### Flux de paiement

```
1. Utilisateur clique sur "Payer l'acompte" ou "Payer le solde"
   ↓
2. Appel API → /api/payments/create-checkout-session
   ↓
3. Validation de la réservation et du type de paiement
   ↓
4. Création d'une session Stripe Checkout
   ↓
5. Redirection vers la page de paiement Stripe hébergée
   ↓
6. Utilisateur saisit ses informations de paiement
   ↓
7. Stripe traite le paiement
   ↓
8. Webhook Stripe → /api/webhooks/stripe
   ↓
9. Mise à jour automatique de Firestore
   ↓
10. Redirection vers la page de réservation (success/cancel)
```

### Sécurité implémentée

- ✅ Clé secrète Stripe uniquement côté serveur
- ✅ Vérification de signature des webhooks
- ✅ Validation des montants côté serveur
- ✅ Prévention des paiements en double
- ✅ Métadonnées de traçabilité (bookingId, paymentType)

---

## 📋 Prochaines étapes pour l'activation

### Étape 1 : Obtenir vos clés Stripe (10 minutes)

1. **Créer un compte Stripe** (si pas encore fait)
   - Aller sur <https://dashboard.stripe.com/register>
   - Utiliser votre email professionnel

2. **Obtenir les clés de test**
   - Se connecter à <https://dashboard.stripe.com/test/apikeys>
   - **Copier la clé publiable** : `pk_test_...`
   - **Afficher et copier la clé secrète** : `sk_test_...`

3. **Créer un webhook**
   - Aller sur <https://dashboard.stripe.com/test/webhooks>
   - Cliquer sur "Ajouter un endpoint"
   - **URL du webhook** : `http://localhost:3000/api/webhooks/stripe` (pour les tests locaux)
   - **Événements à écouter** :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - **Copier le secret de signature** : `whsec_...`

### Étape 2 : Configurer les variables d'environnement (2 minutes)

Éditer le fichier `.env.local` et remplacer les placeholders :

```bash
# Stripe (Paiements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI
```

⚠️ **Important** : Ne JAMAIS commiter le `.env.local` dans Git !

### Étape 3 : Tester le flux de paiement (30 minutes)

#### 1. Redémarrer le serveur de développement

```bash
npm run dev
```

#### 2. Créer une réservation de test

1. Se connecter à l'application : <http://localhost:3000/login>
2. Créer un profil jeune (si pas encore fait)
3. Créer une nouvelle réservation : <http://localhost:3000/dashboard/bookings/new>
   - Remplir tous les champs obligatoires
   - Sauvegarder la réservation

#### 3. Tester le paiement de l'acompte

1. Aller sur la page de détail de la réservation
2. Cliquer sur **"Payer l'acompte (30%)"**
3. Vous serez redirigé vers la page Stripe Checkout
4. Utiliser une **carte de test Stripe** :

**Paiement réussi** :

- Numéro : `4242 4242 4242 4242`
- Date : N'importe quelle date future
- CVC : N'importe quel code à 3 chiffres
- Code postal : N'importe lequel

**Paiement refusé** :

- Numéro : `4000 0000 0000 0002`

**3D Secure (authentification forte)** :

- Numéro : `4000 0027 6000 3184`

1. Compléter le paiement
2. Vous devriez être redirigé vers la page de réservation
3. **Vérifier** :
   - L'acompte est marqué comme payé ✅
   - Le statut de la réservation est "payé"
   - Les détails de paiement sont enregistrés dans Firestore

#### 4. Tester le paiement du solde

1. Après avoir payé l'acompte
2. Cliquer sur **"Payer le solde (70%)"**
3. Répéter le processus de paiement
4. Vérifier que le solde est marqué comme payé ✅

#### 5. Tester l'annulation

1. Sur la page Stripe Checkout, cliquer sur "← Retour"
2. Vérifier que vous êtes redirigé vers la page de réservation
3. La réservation doit rester en statut "en attente"

### Étape 4 : Tester les webhooks en local (15 minutes)

Pour tester les webhooks en développement local, utiliser **Stripe CLI** :

#### Installation Stripe CLI

**macOS** :

```bash
brew install stripe/stripe-cli/stripe
```

**Linux** :

```bash
curl -L https://github.com/stripe/stripe-cli/releases/download/v1.x.x/stripe_linux_x86_64.tar.gz | tar -xz
sudo mv stripe /usr/local/bin/
```

**Windows** :
Télécharger depuis <https://github.com/stripe/stripe-cli/releases>

#### Utilisation

1. **Se connecter à Stripe** :

```bash
stripe login
```

1. **Écouter les webhooks et les transférer à votre localhost** :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

1. **Copier le secret de signature affiché** et le mettre dans `.env.local` :

```bash
Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

1. **Dans un autre terminal, déclencher un événement de test** :

```bash
stripe trigger checkout.session.completed
```

1. **Vérifier les logs** :
   - Dans le terminal Stripe CLI
   - Dans les logs du serveur Next.js
   - Dans Firestore (la réservation doit être mise à jour)

---

## 🧪 Cartes de test Stripe

| Carte | Numéro | Résultat |
|-------|--------|----------|
| Visa réussie | `4242 4242 4242 4242` | Paiement accepté |
| Visa refusée | `4000 0000 0000 0002` | Carte refusée |
| Mastercard réussie | `5555 5555 5555 4444` | Paiement accepté |
| 3D Secure requis | `4000 0027 6000 3184` | Authentification requise |
| Fonds insuffisants | `4000 0000 0000 9995` | Fonds insuffisants |

**Toutes les cartes de test** : <https://stripe.com/docs/testing>

---

## 🚀 Déploiement en production

### 1. Obtenir les clés de production

1. **Activer votre compte Stripe**
   - Compléter les informations d'entreprise
   - Fournir les documents requis
   - Attendre la validation de Stripe

2. **Obtenir les clés de production**
   - Aller sur <https://dashboard.stripe.com/apikeys>
   - **Clé publiable** : `pk_live_...`
   - **Clé secrète** : `sk_live_...`

3. **Configurer le webhook de production**
   - Aller sur <https://dashboard.stripe.com/webhooks>
   - Ajouter un endpoint : `https://votre-domaine.com/api/webhooks/stripe`
   - Sélectionner les mêmes événements que pour les tests
   - Copier le secret : `whsec_...`

### 2. Configurer les variables d'environnement

Dans votre plateforme de déploiement (Firebase Hosting, Vercel, etc.) :

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_ICI
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI
```

### 3. Tester en production

1. Créer une vraie réservation
2. Effectuer un paiement de test avec une vraie carte
3. Vérifier le webhook dans le dashboard Stripe
4. Vérifier la mise à jour dans Firestore
5. Faire un remboursement de test si nécessaire

---

## 🐛 Dépannage

### Le bouton de paiement n'apparaît pas

**Cause** : Stripe n'est pas configuré

**Solution** : Vérifier que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est défini dans `.env.local`

### Erreur "Stripe is not configured"

**Cause** : La clé publiable Stripe n'est pas accessible côté client

**Solution** :

1. Vérifier que la variable commence bien par `NEXT_PUBLIC_`
2. Redémarrer le serveur de développement après modification du `.env.local`

### Le webhook ne se déclenche pas

**Cause** : URL de webhook incorrecte ou events mal configurés

**Solution** :

1. Vérifier l'URL du webhook dans le dashboard Stripe
2. S'assurer que les événements suivants sont sélectionnés :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.refunded`
3. Utiliser Stripe CLI en local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Erreur "Invalid webhook signature"

**Cause** : Le secret de signature du webhook est incorrect

**Solution** :

1. Vérifier `STRIPE_WEBHOOK_SECRET` dans `.env.local`
2. Copier le bon secret depuis le dashboard Stripe
3. Redémarrer le serveur

### Le paiement réussit mais Firestore n'est pas mis à jour

**Cause** : Problème de webhook ou d'écriture Firestore

**Solution** :

1. Vérifier les logs du serveur Next.js
2. Vérifier les logs du webhook dans le dashboard Stripe
3. S'assurer que les règles Firestore autorisent l'écriture
4. Vérifier que bookingId dans les metadata correspond à un document existant

### Erreur "Amount must be at least €0.50"

**Cause** : Le montant du paiement est inférieur au minimum Stripe

**Solution** :

1. Vérifier le calcul du prix dans `src/lib/pricing-service.ts`
2. S'assurer que l'acompte (30%) est supérieur à 0,50 €
3. Le tarif de base minimum devrait être d'au moins 2€

---

## 📊 Monitoring

### Dashboard Stripe

- **Paiements** : <https://dashboard.stripe.com/payments>
- **Webhooks** : <https://dashboard.stripe.com/webhooks>
- **Clients** : <https://dashboard.stripe.com/customers>
- **Rapports** : <https://dashboard.stripe.com/reports/overview>

### Logs à surveiller

1. **Logs du serveur Next.js**
   - Création de sessions de paiement
   - Réception des webhooks
   - Erreurs Stripe

2. **Logs Stripe**
   - Événements webhook envoyés
   - Réponses HTTP de votre endpoint
   - Tentatives de réessai

3. **Firestore**
   - Mise à jour des documents `bookings`
   - Stockage des détails de paiement
   - Changements de statut

---

## 🎯 Fonctionnalités futures

### À court terme

- [ ] **Gestion des redirections success/cancel** avec paramètres de query
- [ ] **Notifications par email** après paiement réussi
- [ ] **Page de confirmation** avec récapitulatif du paiement
- [ ] **Historique des paiements** dans le profil utilisateur

### À moyen terme

- [ ] **Remboursements partiels** depuis le dashboard admin
- [ ] **Plans de paiement** en plusieurs fois
- [ ] **Facturation automatique** en PDF
- [ ] **Récupération des paiements échoués** avec retry automatique

### À long terme

- [ ] **Abonnements mensuels** pour les suivis réguliers
- [ ] **Coupons et codes promo** Stripe
- [ ] **Multi-devises** pour l'international
- [ ] **Paiement par virement bancaire** (SEPA)

---

## 📚 Ressources

- **Documentation Stripe** : <https://stripe.com/docs>
- **API Reference** : <https://stripe.com/docs/api>
- **Webhooks Guide** : <https://stripe.com/docs/webhooks>
- **Testing Guide** : <https://stripe.com/docs/testing>
- **Security Best Practices** : <https://stripe.com/docs/security>
- **Stripe CLI** : <https://stripe.com/docs/stripe-cli>

---

## 🆘 Support

En cas de problème :

1. **Consulter la documentation Stripe** : La plupart des erreurs courantes y sont documentées
2. **Vérifier les logs** : Serveur Next.js + Dashboard Stripe
3. **Tester avec Stripe CLI** : Pour déboguer les webhooks
4. **Support Stripe** : <https://support.stripe.com> (très réactif !)
