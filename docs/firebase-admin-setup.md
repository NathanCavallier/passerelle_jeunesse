# Configuration Firebase Admin SDK

## Pourquoi Firebase Admin SDK ?

Les API routes Next.js s'exécutent côté serveur et ont besoin d'accéder à Firestore sans passer par les règles de sécurité client. Firebase Admin SDK permet cet accès privilégié.

## Option 1 : Service Account (Recommandé pour Production)

### 1. Générer une clé de service

1. Allez dans la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet : **studio-6855979452-20286**
3. Cliquez sur l'icône ⚙️ (Paramètres) → **Paramètres du projet**
4. Allez dans l'onglet **Comptes de service**
5. Cliquez sur **Générer une nouvelle clé privée**
6. Confirmez et téléchargez le fichier JSON

### 2. Ajouter les credentials

**Option A : Fichier JSON complet (pour développement local)**

```bash
# Copiez le contenu du fichier JSON et ajoutez-le à .env.local
FIREBASE_ADMIN_CREDENTIALS='{"type":"service_account","project_id":"studio-6855979452-20286",...}'
```

**Option B : Variables séparées (pour production/Vercel)**

Ouvrez le fichier JSON téléchargé et ajoutez ces variables à `.env.local` :

```bash
FIREBASE_ADMIN_PROJECT_ID=studio-6855979452-20286
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studio-6855979452-20286.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important** : La clé privée doit conserver les `\n` pour les sauts de ligne !

## Option 2 : Application Default Credentials (Développement)

Si vous avez Google Cloud SDK installé et authentifié :

```bash
gcloud auth application-default login
```

Le SDK utilisera automatiquement ces credentials en développement.

## Vérification

Après configuration, redémarrez le serveur :

```bash
npm run dev
```

Vous devriez voir dans la console :

```
✅ Firebase Admin SDK initialisé
```

## Déploiement (Vercel)

1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez les 3 variables :
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
4. Redéployez l'application

## Sécurité

⚠️ **IMPORTANT** :

- Ne commitez JAMAIS le fichier JSON ou la clé privée dans Git
- `.env.local` est déjà dans `.gitignore`
- Utilisez des variables d'environnement pour la production
- Renouvelez les clés régulièrement

## Troubleshooting

### Erreur : "Missing or insufficient permissions"

Si l'erreur persiste après configuration, vérifiez que :

1. Les credentials sont bien dans `.env.local`
2. Le serveur a été redémarré
3. Le fichier JSON n'est pas corrompu
4. Le compte de service a les permissions nécessaires

### Erreur : "Failed to parse private key"

Assurez-vous que les `\n` dans la clé privée sont bien présents :

```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"
```
