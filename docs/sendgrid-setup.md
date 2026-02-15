# Configuration SendGrid pour les emails transactionnels

Ce guide explique comment configurer SendGrid pour envoyer des emails automatiques (confirmation de réservation, paiement, rappels).

---

## 🎯 Pourquoi SendGrid ?

- ✅ **100 emails/jour gratuits** (largement suffisant pour démarrer)
- ✅ API simple et fiable
- ✅ Taux de délivrabilité élevé
- ✅ Gestion des bounces et spam
- ✅ Statistiques d'envoi en temps réel

---

## 📝 Étape 1 : Créer un compte SendGrid

1. Allez sur [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. Créez un compte gratuit
3. Vérifiez votre email

---

## 🔑 Étape 2 : Générer une clé API

1. Connectez-vous à SendGrid
2. Allez dans **Settings** > **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom : `Passerelle_Jeunesse_Production`
5. Sélectionnez **Full Access** (ou Restricted avec les permissions `Mail Send`)
6. Copiez la clé API générée (⚠️ vous ne pourrez la revoir qu'une seule fois)

---

## 📧 Étape 3 : Vérifier un email expéditeur

SendGrid nécessite de vérifier l'adresse email d'expédition.

### Option A : Single Sender Verification (plus simple)

1. Allez dans **Settings** > **Sender Authentication** > **Single Sender Verification**
2. Cliquez sur **Create New Sender**
3. Remplissez les informations :
   - **From Name** : `Passerelle Jeunesse`
   - **From Email Address** : `contact@passerelle-jeunesse.fr` (ou votre email personnel pour tester)
   - **Reply To** : Même email
   - **Company Address** : Votre adresse
4. Validez et vérifiez l'email

### Option B : Domain Authentication (pour la production)

Plus complexe mais meilleur taux de délivrabilité :

1. Allez dans **Settings** > **Sender Authentication** > **Authenticate Your Domain**
2. Suivez les instructions pour ajouter des enregistrements DNS à votre domaine

---

## ⚙️ Étape 4 : Configuration dans l'application

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=contact@passerelle-jeunesse.fr

# Application URL (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

**⚠️ IMPORTANT** : Ne JAMAIS commit ces clés dans Git !

---

## 🚀 Étape 5 : Tester l'envoi

Une fois configuré, les emails seront envoyés automatiquement lors de :

1. **Création d'une réservation** → Email de confirmation
2. **Paiement de l'acompte** → Email de confirmation de paiement
3. **Paiement du solde** → Email de paiement complet
4. **24h avant la prestation** → Email de rappel (via cron job)

### Test manuel

Vous pouvez tester l'envoi d'email en créant une réservation depuis l'interface :

1. Connectez-vous au dashboard
2. Créez une nouvelle réservation
3. Vérifiez votre boîte email (y compris les spams)

### Logs dans la console

Vous verrez ces logs dans votre terminal Next.js :

```
✅ Email de confirmation envoyé à: user@example.com
✅ Email de paiement envoyé à: user@example.com
```

---

## 📊 Étape 6 : Surveiller les envois

Dashboard SendGrid :

1. Allez dans **Activity** pour voir tous les emails envoyés
2. Vérifiez les statuts : `Delivered`, `Opened`, `Clicked`, `Bounced`, `Spam`
3. Consultez les statistiques dans **Stats**

---

## 🔄 Déploiement en production

### Sur Vercel/Firebase/autre hébergeur

1. Ajoutez les variables d'environnement dans les settings :
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (URL de production)

2. Redéployez l'application

3. Vérifiez que l'email expéditeur est bien vérifié dans SendGrid

---

## ⚠️ Limites et quotas

### Plan gratuit SendGrid

- ✅ 100 emails/jour
- ✅ 1 email expéditeur vérifié
- ✅ API complète

### Si vous dépassez 100 emails/jour

Passez au plan payant :

- **Essentials** : 15$/mois → 50 000 emails/mois
- **Pro** : 89.95$/mois → 1.5M emails/mois

---

## 🛠️ Dépannage

### Problème : "API key not configured"

**Solution** : Vérifiez que `SENDGRID_API_KEY` est bien dans `.env.local`

### Problème : "Sender email not verified"

**Solution** : Allez dans SendGrid > Sender Authentication et vérifiez l'email

### Problème : Les emails arrivent en spam

**Solutions** :

1. Utilisez un domaine vérifié (Domain Authentication)
2. Ajoutez un lien de désinscription (déjà fait dans les templates)
3. Évitez les mots comme "gratuit", "urgent" dans les objets

### Problème : Les emails ne partent pas du tout

**Checklist** :

- [ ] La clé API est valide
- [ ] L'email expéditeur est vérifié
- [ ] Le serveur Next.js a redémarré après l'ajout des variables
- [ ] Vérifiez les logs dans la console

---

## 📧 Types d'emails envoyés

### 1. Confirmation de réservation

**Quand** : Immédiatement après la création d'une réservation

**Contenu** :
- Récapitulatif de la réservation
- Détails du trajet
- Tarification
- Bouton pour payer l'acompte

### 2. Confirmation de paiement

**Quand** : Après chaque paiement (acompte ou solde)

**Contenu** :
- Montant payé
- Type de paiement
- Statut de la réservation
- Lien vers la facture

### 3. Rappel 24h avant

**Quand** : 24h avant la prestation (nécessite un cron job)

**Contenu** :
- Rappel de la date et heure
- Détails du trajet
- Contacts
- Alerte si le solde n'est pas payé

---

## 🔮 Prochaines améliorations possibles

- [ ] Emails de bienvenue
- [ ] Digest hebdomadaire pour les parents
- [ ] Notifications accompagnateur
- [ ] Newsletter mensuelle
- [ ] Templates personnalisables dans l'admin

---

## 📚 Ressources

- [Documentation SendGrid](https://docs.sendgrid.com/)
- [API Reference](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Best Practices](https://sendgrid.com/blog/10-tips-to-keep-email-out-of-the-spam-folder/)

---

**Dernière mise à jour** : 15 février 2026
