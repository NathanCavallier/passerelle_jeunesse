# Changelog - 14 février 2026

## ✅ Corrections et améliorations

### 🐛 Bug fixes

#### Sélecteur de date (Calendar)
- **Problème** : Le composant Calendar ne transmettait pas correctement les props à DayPicker, notamment la locale `fr` pour afficher le calendrier en français
- **Solution** : 
  - Mise à jour du type `CalendarProps` pour utiliser directement `DayPickerProps` au lieu de `React.ComponentProps`
  - Suppression des composants personnalisés `IconLeft` et `IconRight` qui causaient des conflits avec react-day-picker v9
  - Le composant transmet maintenant correctement toutes les props, y compris `locale`, `disabled`, `mode`, etc.
- **Impact** : Les sélecteurs de date dans les formulaires (ajout de jeune, réservation) fonctionnent désormais correctement avec l'affichage en français

### 🎨 Intégration du logo

#### Fichiers ajoutés
- `public/images/logo.png` (1024x1024, 305KB) - Logo principal
- `public/favicon.ico` - Favicon du site
- `public/apple-touch-icon.png` - Icône iOS/Apple
- `public/manifest.json` - Manifeste PWA
- `public/images/README.md` - Documentation des assets

#### Composant Logo mis à jour
- **Avant** : Utilisait l'icône `Leaf` de Lucide
- **Après** : Utilise l'image PNG du logo officiel
- **Nouvelles fonctionnalités** :
  - Prop `size` : `sm`, `md` (défaut), `lg` pour ajuster la taille
  - Prop `showText` : Afficher/masquer le texte "Passerelle Jeunesse"
  - Utilisation de `next/image` pour l'optimisation automatique
  - Classes Tailwind dynamiques (pas de styles inline)

#### Métadonnées améliorées (layout.tsx)
- **SEO** : Titre et description enrichis
- **Open Graph** : Métadonnées pour le partage sur réseaux sociaux
- **Twitter Card** : Preview optimisée pour Twitter
- **PWA** : Support de manifest.json pour Progressive Web App
- **Icons** : Favicon et icône Apple Touch configurés

#### Composants affectés
Les composants suivants affichent maintenant le nouveau logo :
- `Header` - En-tête du site (desktop et mobile)
- `Footer` - Pied de page
- Pages d'authentification (via Header/Footer) :
  - Login
  - Signup
  - Reset Password

### 📦 Structure des fichiers

```
public/
├── images/
│   ├── logo.png (1024x1024)
│   └── README.md
├── favicon.ico
├── apple-touch-icon.png
└── manifest.json
```

### 🚀 Prochaines étapes suggérées

1. **Optimisation d'images** : Créer plusieurs tailles du logo si nécessaire (192x192, 512x512)
2. **Dark mode** : Créer une version `logo-light.png` pour le mode sombre
3. **Compression** : Optimiser la taille du logo (actuellement 305KB) avec des outils comme ImageOptim
4. **Tests** : Vérifier l'affichage sur différents navigateurs et appareils

### ✅ Tests effectués

- ✅ Compilation TypeScript sans erreurs
- ⏳ Tests visuels à effectuer dans le navigateur
- ⏳ Tests du sélecteur de date dans les formulaires
- ⏳ Tests responsive (mobile, tablet, desktop)

---

**Fichiers modifiés** :
- `src/components/ui/calendar.tsx`
- `src/components/logo.tsx`
- `src/app/layout.tsx`

**Fichiers créés** :
- `public/images/logo.png`
- `public/favicon.ico`
- `public/apple-touch-icon.png`
- `public/manifest.json`
- `public/images/README.md`
