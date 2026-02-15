# Sprint 1 - Task 4 : Page d'historique des paiements

## 📅 Date d'implémentation
16 février 2026

## 🎯 Objectif
Créer une page complète pour consulter l'historique des paiements avec :
- Liste de tous les paiements effectués
- Filtres avancés (statut, type, recherche)
- Statistiques financières
- Téléchargement de factures
- Export CSV

## ✅ Fonctionnalités implémentées

### 1. Page principale `/dashboard/payments`
- **Route** : `/src/app/dashboard/payments/page.tsx`
- **Layout** : Header + Footer avec navigation vers le dashboard
- **Responsive** : Optimisé mobile et desktop
- **Real-time** : Écoute temps réel des changements de réservations avec `onSnapshot`

### 2. Statistiques financières
Trois cartes affichant :
- **Total dépensé** : Somme de tous les paiements effectués
- **Montant moyen** : Moyenne par transaction
- **Nombre de réservations** : Total avec compteur des réservations en attente

### 3. Système de filtres
**Barre de recherche** :
- Recherche par ID de réservation
- Recherche en temps réel (au fur et à mesure de la saisie)
- Icône de recherche intégrée

**Filtres par statut** :
- Tous (par défaut)
- Payé (paiements effectués)
- En attente (paiements non effectués)

**Filtres par type** :
- Tous (par défaut)
- Acompte (30% du total)
- Solde (70% du total)

**Tri chronologique** :
- Plus récent (par défaut)
- Plus ancien

### 4. Table des paiements
**Colonnes affichées** :
- **Date** : Format français "25 jan. 2026"
- **ID Réservation** : Cliquable (8 premiers caractères + "...")
- **Type** : Badge "Acompte" ou "Solde"
- **Jeunes** : Prénoms des jeunes concernés
- **Montant** : Formaté avec devise (ex: 45,00 €)
- **Statut** : Badge vert "Payé" ou gris "En attente"
- **Actions** : Bouton télécharger facture

**Interactivité** :
- Clic sur ID → Redirection vers détail de réservation
- Clic sur télécharger → Ouvre facture PDF
- Hover sur lignes pour meilleur contraste

### 5. Export CSV
**Fonctionnalité** :
- Bouton "Exporter CSV" dans la zone filtres
- Export des paiements filtrés (respect des critères actifs)
- Encodage UTF-8 avec BOM (support Excel)
- Nom de fichier : `paiements_YYYY-MM-DD.csv`

**Colonnes CSV** :
```
Date;ID Réservation;Type;Montant;Statut;Jeunes
25/02/2026;abc123de;Acompte;45,00€;Payé;Lucas, Emma
```

### 6. Téléchargement de factures
- **Source** : `booking.documents.invoiceURL`
- **Comportement** : Ouvre dans nouvel onglet (`_blank`)
- **Gestion d'erreur** : Toast si facture non disponible
- **État désactivé** : Bouton grisé si `invoiceURL` vide

### 7. Liaison depuis le dashboard
- **Bouton modifié** : "Voir l'historique" dans carte Paiements
- **Avant** : Non fonctionnel
- **Après** : Lien vers `/dashboard/payments` avec `<Link>` Next.js
- **Cohérence** : Classe `h-full` ajoutée pour alignement visuel

## 🔧 Architecture technique

### Structure des données

#### PaymentRecord (interface locale)
```typescript
interface PaymentRecord {
    id: string;              // Format: {bookingId}-deposit ou {bookingId}-balance
    bookingId: string;       // ID de la réservation source
    date: Date;              // Date de paiement (confirmedAt ou scheduledFor)
    type: 'deposit' | 'balance';  // Type de paiement
    amount: number;          // Montant en centimes
    status: 'paid' | 'pending';   // Statut du paiement
    invoiceURL?: string;     // URL de la facture PDF
    youngsters: string[];    // Prénoms des jeunes
    serviceType: string;     // Type de service
}
```

#### Construction des paiements
Chaque réservation génère jusqu'à 2 enregistrements :
1. **Acompte** (30%) : 
   - Date = `confirmedAt` (date de confirmation)
   - Status = `pricing.depositPaid`
2. **Solde** (70%) :
   - Date = `scheduledFor` (date de la prestation)
   - Status = `pricing.balancePaid`

### Query Firestore
```typescript
const bookingsQuery = query(
    collection(db, 'bookings'),
    where('parentId', '==', user.uid),
    orderBy('createdAt', 'desc')
);

const unsubscribe: Unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
    // Traitement en temps réel
});
```

### Filtrage côté client
```typescript
// Application des filtres en cascade
let filtered = [...payments];

// 1. Recherche par ID
if (searchQuery) {
    filtered = filtered.filter(p => 
        p.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

// 2. Filtre statut
if (statusFilter !== 'all') {
    filtered = filtered.filter(p => p.status === statusFilter);
}

// 3. Filtre type
if (typeFilter !== 'all') {
    filtered = filtered.filter(p => p.type === typeFilter);
}

// 4. Tri chronologique
filtered.sort((a, b) => {
    const diff = b.date.getTime() - a.date.getTime();
    return sortOrder === 'desc' ? diff : -diff;
});
```

### Calcul des statistiques
```typescript
const paidPayments = payments.filter(p => p.status === 'paid');
const total = paidPayments.reduce((sum, p) => sum + p.amount, 0);
const count = paidPayments.length;
const average = count > 0 ? total / count : 0;
```

## 🎨 Design et UI

### Palette de couleurs
- **Statut "Payé"** : Badge vert (`bg-green-600`)
- **Statut "En attente"** : Badge gris (`variant="secondary"`)
- **Type** : Badge outline neutre
- **Liens** : Bleu (`text-blue-600`)

### Composition de la page
```
[Header]
├─ Bouton retour
├─ Titre + Description
├─ Grille statistiques (3 colonnes)
├─ Card Filtres
│  ├─ 4 sélecteurs (Recherche, Statut, Type, Tri)
│  ├─ Séparateur
│  └─ Compteur résultats + Bouton Export
└─ Card Table
   ├─ Titre + Description
   └─ Table responsive ou État vide
[Footer]
```

### États de la page

#### État de chargement
```tsx
<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
```

#### État vide (aucun résultat)
```tsx
<FileText className="h-12 w-12 text-neutral-400" />
<h3>Aucun paiement</h3>
<p>Aucun paiement ne correspond à vos critères</p>
```

#### État normal
Table complète avec scroll horizontal sur mobile

## 📊 Scénarios de test

### Test 1 : Affichage initial
1. Se connecter en tant que parent
2. Naviguer vers Dashboard
3. Cliquer sur "Voir l'historique" dans carte Paiements
4. **Résultat attendu** :
   - Page chargée avec layout Header/Footer
   - Statistiques affichées (peuvent être à 0)
   - Table visible avec tous les paiements

### Test 2 : Filtres
1. Dans la page paiements
2. Sélectionner "Payé" dans filtre Statut
3. **Résultat attendu** : Seuls les paiements payés sont affichés
4. Sélectionner "Acompte" dans filtre Type
5. **Résultat attendu** : Seuls les acomptes payés sont affichés
6. Taper un ID dans la recherche
7. **Résultat attendu** : Filtrage instantané

### Test 3 : Recherche
1. Taper les premiers caractères d'un ID de réservation
2. **Résultat attendu** : 
   - Filtrage instantané au fur et à mesure
   - Compteur "X résultat(s)" mis à jour
   - Message "Aucun paiement" si aucun résultat

### Test 4 : Tri chronologique
1. Sélectionner "Plus ancien" dans Tri
2. **Résultat attendu** : 
   - Table réorganisée (paiements les plus anciens en haut)
   - Ordre inversé par rapport à "Plus récent"

### Test 5 : Téléchargement facture
1. Cliquer sur bouton Download d'un paiement avec facture
2. **Résultat attendu** : 
   - Nouvel onglet ouvert avec PDF
3. Cliquer sur bouton Download d'un paiement sans facture
4. **Résultat attendu** : 
   - Toast "Facture non disponible"
   - Aucun nouvel onglet

### Test 6 : Export CSV
1. Appliquer des filtres (ex: "Payé" uniquement)
2. Cliquer sur "Exporter CSV"
3. **Résultat attendu** :
   - Fichier `paiements_2026-02-16.csv` téléchargé
   - Contenu = uniquement paiements filtrés
   - Séparateur = point-virgule
   - Ouverture correcte dans Excel (UTF-8 BOM)
   - Toast "Export réussi"

### Test 7 : Navigation vers réservation
1. Cliquer sur un ID de réservation (lien bleu)
2. **Résultat attendu** :
   - Navigation vers `/dashboard/bookings/{id}`
   - Page de détail de réservation affichée

### Test 8 : Real-time updates
1. Ouvrir la page paiements
2. Dans un autre onglet, marquer un paiement comme payé (via admin/test)
3. **Résultat attendu** :
   - Badge passe de "En attente" à "Payé"
   - Statistiques mises à jour automatiquement
   - Pas besoin de rafraîchir la page

### Test 9 : Responsive mobile
1. Ouvrir la page sur mobile (< 768px)
2. **Résultat attendu** :
   - Grille statistiques en 1 colonne
   - Filtres en 1 colonne
   - Table avec scroll horizontal
   - Boutons et textes lisibles

## 🚀 Fichiers modifiés/créés

### Fichiers créés
- ✅ `/src/app/dashboard/payments/page.tsx` (510 lignes) - Page complète

### Fichiers modifiés
- ✅ `/src/app/dashboard/page.tsx` (ligne 224) - Ajout Link autour carte Paiements

### Composants utilisés
- `shadcn/ui` : Card, Table, Badge, Button, Input, Select, Separator
- `lucide-react` : 9 icônes (ArrowLeft, Search, Download, FileText, TrendingUp, Calendar, Euro, Filter, Loader2)
- `date-fns` : format + locale fr
- `next/navigation` : useRouter
- Firebase : onSnapshot, query, where, orderBy

## 📈 Statistiques du code

- **Lignes de code** : 510 lignes
- **Composants** : 1 page principale
- **Hooks** : 3 useEffect (chargement, statistiques, filtres)
- **États** : 11 useState
- **Fonctions** : 2 (handleDownloadInvoice, handleExportCSV)
- **Interfaces** : 1 (PaymentRecord)

## 🔒 Sécurité et permissions

- **Auth guard** : Redirection si non authentifié
- **Filtrage par parent** : Query `where('parentId', '==', user.uid)`
- **URLs factures** : Validées côté Firestore (Storage Rules)
- **Pas d'API externe** : Tout en Firestore + calculs côté client

## 🎓 Apprentissages et décisions

### Pourquoi deux paiements par réservation ?
Chaque réservation = 2 transactions :
- **Acompte 30%** versé à la confirmation
- **Solde 70%** versé avant la prestation

Cette approche permet :
- Suivi séparé des deux paiements
- Relances ciblées pour soldes impayés
- Facturation progressive

### Pourquoi onSnapshot au lieu de getDocs ?
- **Real-time** : Mises à jour automatiques
- **UX** : Pas besoin de bouton refresh
- **Cohérence** : Avec le reste du dashboard (Sprint 1 Task 2)

### Pourquoi filtrage côté client ?
- **Performance** : Nombre de paiements limité par parent
- **Simplicité** : Pas besoin d'index Firestore complexes
- **Réactivité** : Filtrage instantané

### Pourquoi CSV et pas PDF ?
- **Compatibilité** : CSV universel (Excel, Google Sheets, LibreOffice)
- **Simplicité** : Pas besoin de bibliothèque PDF lourde
- **Flexibilité** : Parent peut manipuler les données

## 🔮 Améliorations futures

### Phase 1.1 (optionnel)
- Date range picker pour filtrer par période
- Graphique d'évolution des dépenses (Chart.js)
- Badge "Nouveau" sur paiements récents (< 7 jours)
- Impression directe de la table (window.print())

### Phase 1.2 (optionnel)
- Export PDF avec logo et en-tête entreprise
- Envoi de factures par email depuis l'interface
- Regroupement par mois/année (accordéons)
- Comparaison année N vs année N-1

### Phase 2 (ultérieur)
- Notifications push avant échéance de solde
- Paiement en plusieurs fois (échelonnement)
- Programme de fidélité visible (points, récompenses)
- Aperçu rapide facture sans téléchargement (modal)

## ✅ Critères d'acceptation

- [x] Page `/dashboard/payments` accessible et sécurisée
- [x] Statistiques calculées correctement
- [x] Filtres fonctionnels (recherche, statut, type, tri)
- [x] Table responsive avec colonnes claires
- [x] Téléchargement factures opérationnel
- [x] Export CSV avec bon encodage
- [x] Bouton dashboard lié correctement
- [x] Real-time updates fonctionnels
- [x] Aucune erreur TypeScript
- [x] Design cohérent avec le reste de l'app
- [x] États vides et de chargement gérés
- [x] Navigation vers détails réservation
- [x] Compteur de résultats correct
- [x] Format monétaire français (45,00 €)

## 🏁 Statut
**✅ TASK 4 TERMINÉE** - Sprint 1 100% complet !

---

**Prochain sprint** : Sprint 2 - Phase 5 : Application mobile accompagnateur
