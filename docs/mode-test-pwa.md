# 🧪 Mode Test PWA - Guide Rapide

## ✅ **Mode Test Activé**

J'ai configuré un **mode test automatique** pour que vous puissiez tester toutes les fonctionnalités PWA accompagnateur sans avoir besoin de créer un compte.

---

## 🎯 **Accès Direct aux Fonctionnalités**

### **Dashboard Accompagnateur**

```
http://localhost:3000/dashboard/accompanist
```

- ✅ **Auto-connecté** comme "Accompagnateur Test"
- ✅ **Rôle accompagnateur** automatiquement attribué
- ✅ **Bannière orange** indique le mode test actif

### **Tests PWA Mobile**

```
http://localhost:3000/dashboard/accompanist/test
```

- 🧪 **Tests automatiques** : PWA Core, GPS, Notifications, Performance
- 📱 **Tests manuels** : Guide étape par étape
- 📊 **Résumé PWA** : Statut temps réel des fonctionnalités

### **Navigation GPS**

```
http://localhost:3000/dashboard/accompanist/missions/[id]
```

- 🧭 **Multi-providers** : Google Maps, Apple Maps, Waze, HERE
- 🎯 **Navigation intégrée** directement dans les missions
- 📍 **Géolocalisation** temps réel

---

## 🔧 **Configuration du Mode Test**

Le mode test est contrôlé dans `/src/lib/test-config.ts` :

```typescript
// Mode test PWA - À DÉSACTIVER EN PRODUCTION
export const PWA_TEST_MODE = true;

// Utilisateur test
export const TEST_USER_CONFIG = {
  role: 'accompanist',
  email: 'test.accompanist@passerelle-jeunesse.fr',
  name: 'Accompagnateur Test'
};
```

---

## 📱 **Tests Recommandés**

### **1. Installation PWA**

- Aller sur `/dashboard/accompanist/test`
- Cliquer "Installer PWA" (si supporté)
- Tester l'app depuis l'écran d'accueil

### **2. Navigation GPS**

- Aller dans une mission (créer des données de test si nécessaire)
- Tester la navigation avec différents providers
- Vérifier l'intégration native avec les apps maps

### **3. Tests automatiques PWA**

- Exécuter la suite complète de tests
- Observer les scores de performance
- Valider le fonctionnement offline

### **4. Fonctionnalités mobiles**

- Tests sur iPhone/Android
- Mode avion (offline)
- Notifications push
- Capture de photos avec GPS

---

## ⚠️ **Important**

### **Désactivation en Production**

```typescript
// Dans /src/lib/test-config.ts
export const PWA_TEST_MODE = false; // ← Changer à false
```

### **Sécurité**

- Le mode test bypass **complètement** l'authentification
- À utiliser **uniquement** en développement
- **Supprimer** avant déploiement production

---

## 🚀 **Prêt à Tester !**

Vous pouvez maintenant :

- ✅ **Naviger librement** dans l'interface accompagnateur
- ✅ **Tester toutes les fonctionnalités PWA** sans authentification
- ✅ **Valider sur mobile** (iPhone/Android)
- ✅ **Déboguer** avec les outils de développement

La **bannière orange** vous rappelle que le mode test est actif. Toutes les fonctionnalités PWA Phase 5 sont maintenant accessibles pour validation ! 🎉
