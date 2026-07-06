/**
 * Service d'administration
 * Fonctions côté client pour le panneau admin (requêtes Firestore)
 */

import { getFirebaseDb } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  getCountFromServer,
  startAfter,
  DocumentSnapshot,
  addDoc,
} from 'firebase/firestore';
import type { User, Booking, BookingStatus, UserRole, UserStatus } from '@/types/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  totalParents: number;
  totalAccompanists: number;
  totalBookings: number;
  bookingsThisMonth: number;
  completedMissions: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  revenueThisMonth: number;
  averageRating: number;
  activeAccompanists: number;
}

export interface AdminBookingFilters {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  accompanistId?: string;
  parentId?: string;
}

export interface AdminUserFilters {
  role?: UserRole;
  status?: UserStatus;
  searchQuery?: string;
}

// ============================================================================
// STATISTIQUES
// ============================================================================

/**
 * Calcule les statistiques globales pour le dashboard admin
 */
export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthTs = Timestamp.fromDate(startOfMonth);

  // Requêtes parallèles
  const [usersSnap, bookingsSnap, monthBookingsSnap] = await Promise.all([
    getDocs(collection(getFirebaseDb(), 'users')),
    getDocs(collection(getFirebaseDb(), 'bookings')),
    getDocs(
      query(
        collection(getFirebaseDb(), 'bookings'),
        where('createdAt', '>=', startOfMonthTs)
      )
    ),
  ]);

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as (User & { id: string })[];
  const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as (Booking & { id: string })[];
  const monthBookings = monthBookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as (Booking & { id: string })[];

  const parents = users.filter((u) => u.role === 'parent');
  const accompanists = users.filter((u) => u.role === 'accompanist');
  const activeAccompanists = accompanists.filter((u) => u.status === 'active');

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
  const revenueThisMonth = monthBookings
    .filter((b) => b.status === 'completed' || b.status === 'paid')
    .reduce((sum, b) => sum + (b.pricing?.total || 0), 0);

  // Calcul note moyenne des accompagnateurs
  const ratings = accompanists
    .filter((a) => a.accompanistProfile?.rating && a.accompanistProfile.rating > 0)
    .map((a) => a.accompanistProfile!.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  return {
    totalUsers: users.length,
    totalParents: parents.length,
    totalAccompanists: accompanists.length,
    totalBookings: bookings.length,
    bookingsThisMonth: monthBookings.length,
    completedMissions: completedBookings.length,
    cancelledBookings: cancelledBookings.length,
    pendingBookings: pendingBookings.length,
    totalRevenue,
    revenueThisMonth,
    averageRating,
    activeAccompanists: activeAccompanists.length,
  };
}

// ============================================================================
// RÉSERVATIONS
// ============================================================================

/**
 * Récupère toutes les réservations avec filtres optionnels
 */
export async function getAllBookings(filters?: AdminBookingFilters): Promise<Booking[]> {
  let q = query(collection(getFirebaseDb(), 'bookings'), orderBy('createdAt', 'desc'));

  if (filters?.status) {
    q = query(collection(getFirebaseDb(), 'bookings'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  let bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));

  // Filtrage côté client pour les champs texte
  if (filters?.searchQuery) {
    const search = filters.searchQuery.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.id.toLowerCase().includes(search) ||
        b.trip?.departure?.address?.toLowerCase().includes(search) ||
        b.trip?.arrival?.address?.toLowerCase().includes(search) ||
        b.youngsters?.some((y) => y.firstName?.toLowerCase().includes(search))
    );
  }

  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom);
    bookings = bookings.filter((b) => {
      const date = b.scheduledFor?.toDate?.() || new Date(b.scheduledFor as any);
      return date >= from;
    });
  }

  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59);
    bookings = bookings.filter((b) => {
      const date = b.scheduledFor?.toDate?.() || new Date(b.scheduledFor as any);
      return date <= to;
    });
  }

  if (filters?.accompanistId) {
    bookings = bookings.filter((b) => b.accompanistId === filters.accompanistId);
  }

  if (filters?.parentId) {
    bookings = bookings.filter((b) => b.parentId === filters.parentId);
  }

  return bookings;
}

/**
 * Écoute les réservations en temps réel
 */
export function onBookingsSnapshot(
  callback: (bookings: Booking[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(getFirebaseDb(), 'bookings'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
      callback(bookings);
    },
    onError
  );
}

/**
 * Met à jour le statut d'une réservation (admin)
 */
export async function updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string): Promise<void> {
  const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (notes) {
    updateData.internalNotes = notes;
  }
  if (status === 'confirmed') {
    updateData.confirmedAt = serverTimestamp();
  }
  await updateDoc(bookingRef, updateData);
}

/**
 * Assigne un accompagnateur à une réservation
 */
export async function assignAccompanist(bookingId: string, accompanistId: string): Promise<void> {
  const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);
  await updateDoc(bookingRef, {
    accompanistId,
    status: 'assigned',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Ajoute des notes internes à une réservation
 */
export async function addInternalNote(bookingId: string, note: string): Promise<void> {
  const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);
  await updateDoc(bookingRef, {
    internalNotes: note,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// UTILISATEURS
// ============================================================================

/**
 * Récupère tous les utilisateurs avec filtres optionnels
 */
export async function getAllUsers(filters?: AdminUserFilters): Promise<(User & { id: string })[]> {
  let q;

  if (filters?.role) {
    q = query(collection(getFirebaseDb(), 'users'), where('role', '==', filters.role), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(getFirebaseDb(), 'users'), orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  let users = snap.docs.map((d) => ({ id: d.id, ...d.data() } as User & { id: string }));

  if (filters?.status) {
    users = users.filter((u) => u.status === filters.status);
  }

  if (filters?.searchQuery) {
    const search = filters.searchQuery.toLowerCase();
    users = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(search) ||
        u.firstName?.toLowerCase().includes(search) ||
        u.lastName?.toLowerCase().includes(search) ||
        u.phoneNumber?.includes(search)
    );
  }

  return users;
}

/**
 * Écoute les utilisateurs en temps réel
 */
export function onUsersSnapshot(
  callback: (users: (User & { id: string })[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(getFirebaseDb(), 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User & { id: string }));
      callback(users);
    },
    onError
  );
}

/**
 * Met à jour le statut d'un utilisateur
 */
export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  const userRef = doc(getFirebaseDb(), 'users', userId);
  await updateDoc(userRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Valide les documents d'un accompagnateur
 */
export async function verifyAccompanistDocument(
  userId: string,
  documentType: 'criminalRecord' | 'insurance' | 'idCard',
  verified: boolean
): Promise<void> {
  const userRef = doc(getFirebaseDb(), 'users', userId);
  await updateDoc(userRef, {
    [`accompanistProfile.documents.${documentType}.verified`]: verified,
    [`accompanistProfile.documents.${documentType}.verifiedAt`]: verified ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Récupère les accompagnateurs disponibles pour une mission
 */
export async function getAvailableAccompanists(): Promise<(User & { id: string })[]> {
  const q = query(
    collection(getFirebaseDb(), 'users'),
    where('role', '==', 'accompanist'),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User & { id: string }));
}

// ============================================================================
// AUDIT LOG
// ============================================================================

/**
 * Enregistre une action dans l'audit log
 */
export async function logAuditAction(
  action: string,
  actorId: string,
  actorRole: string,
  actorEmail: string,
  targetType: string,
  targetId?: string,
  details?: any
): Promise<void> {
  await addDoc(collection(getFirebaseDb(), 'audit'), {
    action,
    actorId,
    actorRole,
    actorEmail,
    targetType,
    targetId: targetId || null,
    details: details || null,
    createdAt: serverTimestamp(),
  });
}

// ============================================================================
// EXPORT DE DONNÉES
// ============================================================================

/**
 * Génère un export CSV des réservations
 */
export function exportBookingsToCSV(bookings: Booking[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'ID',
    'Date création',
    'Date prévue',
    'Statut',
    'Type service',
    'Départ',
    'Arrivée',
    'Nb jeunes',
    'Montant total',
    'Acompte payé',
    'Solde payé',
    'Parent ID',
    'Accompagnateur ID',
  ];

  const rows = bookings.map((b) => {
    const createdAt = b.createdAt?.toDate?.()
      ? b.createdAt.toDate().toLocaleDateString('fr-FR')
      : '';
    const scheduledFor = b.scheduledFor?.toDate?.()
      ? b.scheduledFor.toDate().toLocaleDateString('fr-FR')
      : '';

    return [
      b.id,
      createdAt,
      scheduledFor,
      b.status,
      b.serviceType || '',
      b.trip?.departure?.address || '',
      b.trip?.arrival?.address || '',
      b.youngsters?.length || 0,
      b.pricing?.total?.toFixed(2) || '0.00',
      b.pricing?.depositPaid ? 'Oui' : 'Non',
      b.pricing?.balancePaid ? 'Oui' : 'Non',
      b.parentId || '',
      b.accompanistId || '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\n');
}

/**
 * Génère un export CSV des utilisateurs
 */
export function exportUsersToCSV(users: (User & { id: string })[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'ID',
    'Email',
    'Prénom',
    'Nom',
    'Rôle',
    'Statut',
    'Téléphone',
    'Email vérifié',
    'Date inscription',
    'Dernière connexion',
    'Missions (accomp.)',
    'Note (accomp.)',
  ];

  const rows = users.map((u) => {
    const createdAt = u.createdAt?.toDate?.()
      ? u.createdAt.toDate().toLocaleDateString('fr-FR')
      : '';
    const lastLogin = u.lastLoginAt?.toDate?.()
      ? u.lastLoginAt.toDate().toLocaleDateString('fr-FR')
      : '';

    return [
      u.id,
      u.email,
      u.firstName,
      u.lastName,
      u.role,
      u.status,
      u.phoneNumber || '',
      u.emailVerified ? 'Oui' : 'Non',
      createdAt,
      lastLogin,
      u.accompanistProfile?.totalMissions || '',
      u.accompanistProfile?.rating?.toFixed(1) || '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\n');
}

/**
 * Télécharger un fichier CSV
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
