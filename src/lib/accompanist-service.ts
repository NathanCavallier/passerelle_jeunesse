/**
 * Service Firestore pour l'espace accompagnateur
 * Gère toutes les opérations spécifiques aux accompagnateurs
 */

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  AccompanistProfile,
  WeeklyAvailability,
  DayAvailability,
  Booking,
  MissionReport,
  BehaviourRating,
  Incident,
  IncidentType,
  IncidentSeverity,
} from '@/types/firestore';

// ============================================================================
// PROFIL ACCOMPAGNATEUR
// ============================================================================

/**
 * Crée le profil initial d'un accompagnateur
 */
export function createDefaultAccompanistProfile(): AccompanistProfile {
  return {
    biography: '',
    experience: '',
    certifications: [],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    zones: [],
    longDistanceAvailable: false,
    maxYoungsters: 1,
    rating: 0,
    totalMissions: 0,
    totalEarnings: 0,
    documents: {
      criminalRecord: { verified: false },
      insurance: { verified: false },
      idCard: { verified: false },
    },
  };
}

/**
 * Met à jour le profil accompagnateur dans Firestore
 */
export async function updateAccompanistProfile(
  uid: string,
  profileData: Partial<AccompanistProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  // Construire les champs à mettre à jour avec la notation dot
  const updateData: Record<string, any> = {};
  for (const [key, value] of Object.entries(profileData)) {
    updateData[`accompanistProfile.${key}`] = value;
  }
  updateData.updatedAt = serverTimestamp();

  await updateDoc(userRef, updateData);
}

/**
 * Met à jour les informations personnelles de l'accompagnateur
 */
export async function updateAccompanistPersonalInfo(
  uid: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    biography?: string;
    experience?: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const updateData: Record<string, any> = { updatedAt: serverTimestamp() };

  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
  if (data.biography !== undefined) updateData['accompanistProfile.biography'] = data.biography;
  if (data.experience !== undefined) updateData['accompanistProfile.experience'] = data.experience;

  await updateDoc(userRef, updateData);
}

// ============================================================================
// DISPONIBILITÉS
// ============================================================================

/**
 * Met à jour les disponibilités hebdomadaires
 */
export async function updateWeeklyAvailability(
  uid: string,
  availability: WeeklyAvailability
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'accompanistProfile.availability': availability,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Ajoute un créneau de disponibilité pour un jour
 */
export async function addTimeSlot(
  uid: string,
  day: keyof WeeklyAvailability,
  slot: DayAvailability
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    [`accompanistProfile.availability.${day}`]: arrayUnion(slot),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Supprime un créneau de disponibilité
 */
export async function removeTimeSlot(
  uid: string,
  day: keyof WeeklyAvailability,
  slot: DayAvailability
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    [`accompanistProfile.availability.${day}`]: arrayRemove(slot),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Met à jour les zones d'intervention
 */
export async function updateZones(uid: string, zones: string[]): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'accompanistProfile.zones': zones,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Met à jour les paramètres de service
 */
export async function updateServiceSettings(
  uid: string,
  settings: {
    maxYoungsters?: number;
    longDistanceAvailable?: boolean;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const updateData: Record<string, any> = { updatedAt: serverTimestamp() };

  if (settings.maxYoungsters !== undefined) {
    updateData['accompanistProfile.maxYoungsters'] = settings.maxYoungsters;
  }
  if (settings.longDistanceAvailable !== undefined) {
    updateData['accompanistProfile.longDistanceAvailable'] = settings.longDistanceAvailable;
  }

  await updateDoc(userRef, updateData);
}

// ============================================================================
// INDISPONIBILITÉS
// ============================================================================

export interface UnavailabilityPeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  createdAt: Timestamp;
}

/**
 * Ajoute une période d'indisponibilité
 */
export async function addUnavailability(
  uid: string,
  data: { startDate: string; endDate: string; reason: string }
): Promise<string> {
  const unavailabilitiesRef = collection(db, 'users', uid, 'unavailabilities');
  const docRef = await addDoc(unavailabilitiesRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Supprime une période d'indisponibilité
 */
export async function removeUnavailability(uid: string, unavailabilityId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'unavailabilities', unavailabilityId);
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(ref);
}

/**
 * Récupère toutes les périodes d'indisponibilité
 */
export async function getUnavailabilities(uid: string): Promise<UnavailabilityPeriod[]> {
  const ref = collection(db, 'users', uid, 'unavailabilities');
  const q = query(ref, orderBy('startDate', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UnavailabilityPeriod[];
}

/**
 * Écoute les indisponibilités en temps réel
 */
export function onUnavailabilitiesSnapshot(
  uid: string,
  callback: (unavailabilities: UnavailabilityPeriod[]) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'unavailabilities');
  const q = query(ref, orderBy('startDate', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UnavailabilityPeriod[];
    callback(items);
  });
}

// ============================================================================
// CERTIFICATIONS
// ============================================================================

/**
 * Ajoute une certification
 */
export async function addCertification(uid: string, certification: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'accompanistProfile.certifications': arrayUnion(certification),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Supprime une certification
 */
export async function removeCertification(uid: string, certification: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'accompanistProfile.certifications': arrayRemove(certification),
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// MISSIONS - RAPPORT
// ============================================================================

/**
 * Soumet un rapport de mission
 */
export async function submitMissionReport(
  bookingId: string,
  report: {
    behaviour: BehaviourRating;
    cooperation: BehaviourRating;
    generalNotes: string;
    recommendations?: string;
  }
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  const missionReport: MissionReport = {
    ...report,
    submittedAt: Timestamp.now(),
  };

  await updateDoc(bookingRef, {
    'missionTracking.report': missionReport,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Récupère le rapport d'une mission
 */
export async function getMissionReport(bookingId: string): Promise<MissionReport | null> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) return null;
  return snap.data()?.missionTracking?.report || null;
}

// ============================================================================
// MISSIONS - INCIDENTS
// ============================================================================

/**
 * Signale un incident pendant une mission
 */
export async function reportIncident(
  bookingId: string,
  incident: {
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
  }
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);

  const newIncident: Incident = {
    ...incident,
    reportedAt: Timestamp.now(),
  };

  await updateDoc(bookingRef, {
    'missionTracking.incidents': arrayUnion(newIncident),
    'missionTracking.currentStatus': 'incident',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Résout un incident
 */
export async function resolveIncident(
  bookingId: string,
  incidentIndex: number,
  resolution: string
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) throw new Error('Booking introuvable');

  const tracking = snap.data()?.missionTracking;
  const incidents = tracking?.incidents || [];

  if (incidentIndex >= 0 && incidentIndex < incidents.length) {
    incidents[incidentIndex] = {
      ...incidents[incidentIndex],
      resolvedAt: Timestamp.now(),
      resolution,
    };

    await updateDoc(bookingRef, {
      'missionTracking.incidents': incidents,
      updatedAt: serverTimestamp(),
    });
  }
}

// ============================================================================
// MISSIONS - CHECKLIST
// ============================================================================

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  checkedAt?: Timestamp;
  category: 'before' | 'during' | 'after';
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id' | 'checked'>[] = [
  // Avant la mission
  { label: 'Vérifier les informations de la mission', category: 'before' },
  { label: 'Vérifier l\'itinéraire et le trajet', category: 'before' },
  { label: 'Contacter le parent/tuteur', category: 'before' },
  { label: 'Vérifier les documents nécessaires', category: 'before' },
  { label: 'Préparer le matériel (téléphone chargé, etc.)', category: 'before' },
  // Pendant la mission
  { label: 'Prise en charge du jeune confirmée', category: 'during' },
  { label: 'Photo de départ prise', category: 'during' },
  { label: 'Parent informé du départ', category: 'during' },
  { label: 'Suivi GPS activé', category: 'during' },
  { label: 'Photo d\'arrivée prise', category: 'during' },
  { label: 'Jeune remis au destinataire', category: 'during' },
  // Après la mission
  { label: 'Rapport de mission rédigé', category: 'after' },
  { label: 'Parent informé de la fin de mission', category: 'after' },
  { label: 'Photos et documents téléchargés', category: 'after' },
];

/**
 * Initialise une checklist pour une mission
 */
export async function initMissionChecklist(bookingId: string): Promise<ChecklistItem[]> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(bookingRef);

  // Si checklist existe déjà, la retourner
  if (snap.exists() && snap.data()?.missionTracking?.checklist) {
    return snap.data()!.missionTracking.checklist;
  }

  const checklist: ChecklistItem[] = DEFAULT_CHECKLIST.map((item, index) => ({
    ...item,
    id: `check_${index}`,
    checked: false,
  }));

  await updateDoc(bookingRef, {
    'missionTracking.checklist': checklist,
    updatedAt: serverTimestamp(),
  });

  return checklist;
}

/**
 * Met à jour un élément de la checklist
 */
export async function updateChecklistItem(
  bookingId: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) throw new Error('Booking introuvable');

  const checklist: ChecklistItem[] = snap.data()?.missionTracking?.checklist || [];
  const itemIndex = checklist.findIndex((item) => item.id === itemId);

  if (itemIndex >= 0) {
    checklist[itemIndex] = {
      ...checklist[itemIndex],
      checked,
      checkedAt: checked ? Timestamp.now() : undefined,
    };

    await updateDoc(bookingRef, {
      'missionTracking.checklist': checklist,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Récupère la checklist d'une mission
 */
export async function getMissionChecklist(bookingId: string): Promise<ChecklistItem[]> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) return [];
  return snap.data()?.missionTracking?.checklist || [];
}

// ============================================================================
// QR CODE
// ============================================================================

/**
 * Génère les données pour un QR code de prise en charge
 */
export function generateHandoverQRData(bookingId: string, accompanistId: string): string {
  const payload = {
    type: 'passerelle_handover',
    bookingId,
    accompanistId,
    timestamp: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes de validité
  };
  return JSON.stringify(payload);
}

/**
 * Valide un QR code de prise en charge
 */
export async function validateHandoverQR(
  qrData: string,
  accompanistId: string
): Promise<{ valid: boolean; bookingId?: string; error?: string }> {
  try {
    const payload = JSON.parse(qrData);

    if (payload.type !== 'passerelle_handover') {
      return { valid: false, error: 'QR code invalide' };
    }

    if (payload.expiresAt < Date.now()) {
      return { valid: false, error: 'QR code expiré' };
    }

    if (payload.accompanistId !== accompanistId) {
      return { valid: false, error: 'QR code non destiné à cet accompagnateur' };
    }

    // Vérifier que le booking existe et est bien assigné
    const bookingRef = doc(db, 'bookings', payload.bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return { valid: false, error: 'Réservation introuvable' };
    }

    const booking = bookingSnap.data();
    if (booking.accompanistId !== accompanistId) {
      return { valid: false, error: 'Mission non assignée à cet accompagnateur' };
    }

    // Mettre à jour le statut si c'est valide
    await updateDoc(bookingRef, {
      'missionTracking.handoverValidated': true,
      'missionTracking.handoverValidatedAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { valid: true, bookingId: payload.bookingId };
  } catch {
    return { valid: false, error: 'QR code invalide ou corrompu' };
  }
}

// ============================================================================
// MISSIONS - HISTORIQUE
// ============================================================================

/**
 * Récupère toutes les missions terminées d'un accompagnateur
 */
export async function getCompletedMissions(uid: string): Promise<Booking[]> {
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('accompanistId', '==', uid),
    where('status', 'in', ['completed']),
    orderBy('scheduledDate', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

/**
 * Récupère les missions d'un accompagnateur par période
 */
export async function getMissionsByDateRange(
  uid: string,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('accompanistId', '==', uid),
    where('scheduledDate', '>=', Timestamp.fromDate(startDate)),
    where('scheduledDate', '<=', Timestamp.fromDate(endDate))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

// ============================================================================
// ACCOMPAGNATEUR - STATISTIQUES
// ============================================================================

/**
 * Recalcule les statistiques de l'accompagnateur
 */
export async function recalculateAccompanistStats(uid: string): Promise<{
  totalMissions: number;
  totalEarnings: number;
  rating: number;
}> {
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('accompanistId', '==', uid),
    where('status', '==', 'completed')
  );

  const snapshot = await getDocs(q);
  let totalEarnings = 0;
  let totalRatings = 0;
  let ratingCount = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalEarnings += data.pricing?.total || 0;
    if (data.review?.rating) {
      totalRatings += data.review.rating;
      ratingCount++;
    }
  });

  const stats = {
    totalMissions: snapshot.docs.length,
    totalEarnings,
    rating: ratingCount > 0 ? totalRatings / ratingCount : 0,
  };

  // Mettre à jour dans Firestore
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'accompanistProfile.totalMissions': stats.totalMissions,
    'accompanistProfile.totalEarnings': stats.totalEarnings,
    'accompanistProfile.rating': stats.rating,
    updatedAt: serverTimestamp(),
  });

  return stats;
}
