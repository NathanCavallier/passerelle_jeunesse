# Sprint 1 - Task 3 : Interface de sélection de créneaux horaires

## 📅 Date d'implémentation

16 janvier 2025

## 🎯 Objectif

Remplacer les champs de saisie basiques de date et heure par une interface moderne avec :

- Un calendrier visuel pour sélectionner la date
- Une grille de créneaux horaires disponibles
- Vérification en temps réel de la disponibilité
- Indications visuelles claires (disponible/complet/sélectionné)

## ✅ Fonctionnalités implémentées

### 1. Calendrier interactif

- **Composant** : `shadcn/ui Calendar` avec `react-day-picker`
- **Localisation** : Français (import depuis `date-fns/locale`)
- **Contraintes** :
  - Désactive les dates passées
  - Désactive les dates dans moins de 24h (règle métier)
  - Affichage clair du mois et de l'année
  - Navigation fluide entre les mois

### 2. Grille de créneaux horaires

- **Affichage** : Grille responsive (3 colonnes mobile, 4 desktop)
- **États visuels** :
  - **Non sélectionné** : Bordure grise, hover bleu
  - **Sélectionné** : Fond bleu, texte blanc
  - **Chargement** : Spinner animé avec message
  - **Aucun créneau** : Alert avec suggestion de changer de date

### 3. API Integration

- **Endpoint** : `GET /api/availability/slots?date=YYYY-MM-DD&serviceType=accompagnement`
- **Chargement automatique** : Dès qu'une date est sélectionnée
- **Gestion d'erreurs** : Toast notification en cas d'échec

### 4. Expérience utilisateur améliorée

- **Compteur** : Affiche le nombre de créneaux disponibles
- **Format de date** : "25 janvier 2025" (format français lisible)
- **Icônes** : Clock pour chaque créneau horaire
- **Feedback visuel** : Animation de chargement pendant la récupération des créneaux

## 🔧 Modifications techniques

### Fichier modifié

`src/components/bookings/booking-form.tsx`

### Imports ajoutés

```tsx
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
```

### États ajoutés

```tsx
const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
const [availableSlots, setAvailableSlots] = useState<string[]>([]);
const [loadingSlots, setLoadingSlots] = useState(false);
const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
```

### Fonctions ajoutées

#### `loadAvailableSlots(date: Date)`

```tsx
const loadAvailableSlots = async (date: Date) => {
    try {
        setLoadingSlots(true);
        setAvailableSlots([]);
        setSelectedTimeSlot('');
        
        const dateStr = format(date, 'yyyy-MM-dd');
        const response = await fetch(
            `/api/availability/slots?date=${dateStr}&serviceType=accompagnement`
        );
        
        if (!response.ok) {
            throw new Error('Impossible de charger les créneaux disponibles');
        }
        
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
    } catch (error: any) {
        console.error('Erreur chargement créneaux:', error);
        toast({
            title: 'Erreur',
            description: error.message,
            variant: 'destructive',
        });
        setAvailableSlots([]);
    } finally {
        setLoadingSlots(false);
    }
};
```

#### `useEffect` pour charger les créneaux

```tsx
useEffect(() => {
    if (selectedDate) {
        loadAvailableSlots(selectedDate);
    }
}, [selectedDate]);
```

### Interface remplacée

**Avant (lignes 468-481)** :

```tsx
<Input type="date" {...register('departureDate')} />
<Input type="time" {...register('departureTime')} />
```

**Après (95 lignes)** :

- Calendrier full-featured avec désactivation intelligente
- Grille de boutons pour les créneaux avec états visuels
- Loader pendant le chargement
- Alert si aucun créneau disponible

## 📊 Structure des données

### Réponse API `/api/availability/slots`

```json
{
  "date": "2025-01-25",
  "serviceType": "accompagnement",
  "availableSlots": ["08:00", "10:00", "14:00", "16:00", "18:00"],
  "count": 5
}
```

### Créneaux par défaut (availability-service.ts)

```typescript
const possibleSlots = [
    '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'
];
```

## 🎨 Design et UI

### Calendrier

- **Padding** : p-4 autour du calendrier
- **Bordure** : Rond (rounded-lg)
- **Fond** : Blanc pour contraster avec le fond gris du Card
- **Largeur** : w-full (responsive)

### Grille de créneaux

- **Disposition** : `grid grid-cols-3 sm:grid-cols-4 gap-2`
- **Hauteur bouton** : h-12 (confortable au toucher)
- **Couleur sélection** : bg-blue-600 (cohérent avec le thème)
- **Hover** : border-blue-500 + bg-blue-50 (feedback subtil)

### États de chargement

- **Icône** : Loader2 avec animate-spin
- **Couleur** : text-blue-600
- **Padding** : p-8 pour créer de l'espace

### Alert "Aucun créneau"

- **Type** : Alert avec AlertCircle
- **Message** : Suggère de sélectionner une autre date
- **Lien contact** : Mention de contacter pour demande spécifique

## 🔒 Règles métier respectées

1. **Délai minimum** : 24h à l'avance (désactivé dans le calendrier)
2. **Délai maximum** : 6 mois à l'avance (géré par l'API)
3. **Capacité** : Maximum 5 accompagnements simultanés par créneau
4. **Fenêtre de temps** : ±2h autour de chaque créneau (gestion des conflits)

## 🧪 Test manuel recommandé

### Scénario 1 : Sélection normale

1. Ouvrir le formulaire de réservation
2. Sélectionner le type de prestation
3. Sélectionner un ou plusieurs jeunes
4. Cliquer sur une date (au moins 24h dans le futur)
5. **Résultat attendu** : Créneaux affichés en grille
6. Cliquer sur un créneau
7. **Résultat attendu** : Créneau surligné en bleu, heure enregistrée dans le formulaire

### Scénario 2 : Aucun créneau disponible

1. Répéter les étapes 1-4
2. Si tous les créneaux sont réservés
3. **Résultat attendu** : Alert "Aucun créneau disponible" avec suggestion

### Scénario 3 : Chargement

1. Répéter les étapes 1-4
2. Observer pendant le chargement
3. **Résultat attendu** : Spinner avec "Chargement des créneaux disponibles..."

### Scénario 4 : Changement de date

1. Sélectionner une date et un créneau
2. Changer de date
3. **Résultat attendu** :
   - Créneaux rechargés automatiquement
   - Sélection précédente réinitialisée
   - `departureTime` dans le formulaire mis à vide

### Scénario 5 : Validation du formulaire

1. Compléter tout le formulaire avec date + créneau
2. Soumettre
3. **Résultat attendu** :
   - `departureDate` = "YYYY-MM-DD"
   - `departureTime` = "HH:MM"
   - Réservation créée avec succès

## 🚀 Améliorations potentielles futures

### Phase 1.1 (optionnel)

- Afficher le nombre de places restantes par créneau ("3 places")
- Ajouter des badges "Bientôt complet" (< 2 places)
- Colorer les créneaux selon la disponibilité (vert/orange/rouge)

### Phase 1.2 (optionnel)

- Suggérer automatiquement des dates alternatives si aucun créneau
- Afficher un calendrier heatmap (jours verts = disponibles, rouge = complets)
- Notification si un créneau se libère (WebSocket/polling)

### Phase 2 (ultérieur)

- Permettre la demande de créneaux personnalisés (en dehors des standards)
- Afficher les créneaux "urgence" séparément (avec supplément)
- Intégration calendrier personnel (Google Calendar, iCal)

## 📝 Notes de développement

### Dépendances utilisées

- **react-day-picker** (via shadcn/ui Calendar) : Calendrier moderne
- **date-fns** v3.6.0 : Formatage et manipulation de dates
- **lucide-react** : Icônes (Calendar, Clock, Loader2, AlertCircle)

### Performance

- **Appel API** : Un seul appel par changement de date (pas de polling)
- **Debouncing** : Pas nécessaire (sélection de date = événement unique)
- **Cache** : Pas implémenté (créneaux peuvent changer rapidement)

### Accessibilité

- **Labels** : Tous les champs ont des labels explicites
- **Clavier** : Navigation au clavier dans le calendrier
- **Screen readers** : Composants shadcn/ui sont accessibles par défaut
- **Focus visible** : États de focus clairs sur les boutons de créneaux

## ✅ Critères d'acceptation

- [x] Calendrier visuel remplace l'input date
- [x] Créneaux horaires affichés en grille
- [x] Appel API automatique au changement de date
- [x] État de chargement visible
- [x] Gestion du cas "aucun créneau"
- [x] Validation du formulaire fonctionne
- [x] Aucune erreur TypeScript
- [x] Design cohérent avec le reste de l'app
- [x] Responsive mobile/desktop
- [x] Messages d'erreur clairs

## 🏁 Statut

**✅ TASK 3 TERMINÉE** - Prêt pour test utilisateur

---

**Prochaine étape** : Sprint 1 Task 4 - Payment history page
