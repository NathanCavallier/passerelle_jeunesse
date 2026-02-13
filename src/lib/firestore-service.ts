/**
 * Service Firestore
 * Gère toutes les opérations CRUD avec Firestore
 */

import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp,
    serverTimestamp,
    DocumentSnapshot,
    QuerySnapshot,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, UserRole, Address, YoungsterDocument } from '@/types/firestore';

// ============================================================================
// USERS
// ============================================================================

export interface CreateUserData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    address: Address;
}

/**
 * Crée un nouveau document utilisateur dans Firestore
 */
export async function createUserDocument(
    uid: string,
    data: CreateUserData
): Promise<void> {
    const userRef = doc(db, 'users', uid);

    const userData: Partial<User> = {
        uid,
        email: data.email,
        emailVerified: false,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        preferences: {
            language: 'fr',
            notifications: {
                email: true,
                sms: true,
                push: true,
            },
            newsletter: false,
        },
        status: 'active',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    // Ajouter les profils spécifiques selon le rôle
    if (data.role === 'parent') {
        userData.parentProfile = {
            emergencyContact: {
                name: '',
                phoneNumber: '',
                relationship: '',
            },
            numberOfYoungsters: 0,
            totalBookings: 0,
            totalSpent: 0,
            loyaltyPoints: 0,
            referralCode: generateReferralCode(uid),
        };
    }

    await setDoc(userRef, userData);
}

/**
 * Récupère un document utilisateur
 */
export async function getUserDocument(uid: string): Promise<User | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return null;
    }

    return userSnap.data() as User;
}

/**
 * Met à jour un document utilisateur
 */
export async function updateUserDocument(
    uid: string,
    data: Partial<User>
): Promise<void> {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Met à jour le lastLoginAt
 */
export async function updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
    });
}

/**
 * Supprime un document utilisateur (soft delete)
 */
export async function deleteUserDocument(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
        status: 'deleted',
        updatedAt: serverTimestamp(),
    });
}

// ============================================================================
// YOUNGSTERS
// ============================================================================

/**
 * Crée un nouveau jeune pour un parent
 */
export async function createYoungster(
    parentId: string,
    youngsterData: any
): Promise<string> {
    const youngstersRef = collection(db, 'users', parentId, 'youngsters');
    const youngsterRef = doc(youngstersRef);

    await setDoc(youngsterRef, {
        ...youngsterData,
        id: youngsterRef.id,
        parentId,
        documents: youngsterData.documents || [],
        totalTrips: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Incrémenter le compteur de jeunes du parent
    const parentRef = doc(db, 'users', parentId);
    await updateDoc(parentRef, {
        'parentProfile.numberOfYoungsters': (await getDoc(parentRef)).data()
            ?.parentProfile?.numberOfYoungsters
            ? (await getDoc(parentRef)).data()!.parentProfile!.numberOfYoungsters + 1
            : 1,
    });

    return youngsterRef.id;
}

/**
 * Récupère tous les jeunes d'un parent
 */
export async function getYoungsters(parentId: string): Promise<any[]> {
    const youngstersRef = collection(db, 'users', parentId, 'youngsters');
    const q = query(youngstersRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data());
}

/**
 * Récupère un jeune spécifique
 */
export async function getYoungster(parentId: string, youngsterId: string): Promise<any | null> {
    const youngsterRef = doc(db, 'users', parentId, 'youngsters', youngsterId);
    const youngsterSnap = await getDoc(youngsterRef);

    if (!youngsterSnap.exists()) {
        return null;
    }

    return youngsterSnap.data();
}

/**
 * Met à jour un jeune
 */
export async function updateYoungster(
    parentId: string,
    youngsterId: string,
    data: any
): Promise<void> {
    const youngsterRef = doc(db, 'users', parentId, 'youngsters', youngsterId);

    await updateDoc(youngsterRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Supprime un jeune (soft delete)
 */
export async function deleteYoungster(
    parentId: string,
    youngsterId: string
): Promise<void> {
    const youngsterRef = doc(db, 'users', parentId, 'youngsters', youngsterId);

    await updateDoc(youngsterRef, {
        status: 'deleted',
        updatedAt: serverTimestamp(),
    });

    // Décrémenter le compteur de jeunes du parent
    const parentRef = doc(db, 'users', parentId);
    const parentSnap = await getDoc(parentRef);
    const currentCount = parentSnap.data()?.parentProfile?.numberOfYoungsters || 0;

    if (currentCount > 0) {
        await updateDoc(parentRef, {
            'parentProfile.numberOfYoungsters': currentCount - 1,
        });
    }
}

/**
 * Ajoute un document à un jeune
 */
export async function addYoungsterDocument(
    parentId: string,
    youngsterId: string,
    document: Omit<YoungsterDocument, 'id'>
): Promise<string> {
    const youngsterRef = doc(db, 'users', parentId, 'youngsters', youngsterId);

    // Générer un ID unique pour le document
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fullDocument: YoungsterDocument = {
        id: docId,
        ...document,
    };

    await updateDoc(youngsterRef, {
        documents: arrayUnion(fullDocument),
        updatedAt: serverTimestamp(),
    });

    return docId;
}

/**
 * Supprime un document d'un jeune
 */
export async function deleteYoungsterDocument(
    parentId: string,
    youngsterId: string,
    document: YoungsterDocument
): Promise<void> {
    const youngsterRef = doc(db, 'users', parentId, 'youngsters', youngsterId);

    await updateDoc(youngsterRef, {
        documents: arrayRemove(document),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Met à jour un document d'un jeune
 */
export async function updateYoungsterDocument(
    parentId: string,
    youngsterId: string,
    oldDocument: YoungsterDocument,
    newDocument: YoungsterDocument
): Promise<void> {
    const youngsterRef = doc(db, 'users', parentId, 'youngsters', youngsterId);

    // Supprimer l'ancien document et ajouter le nouveau
    await updateDoc(youngsterRef, {
        documents: arrayRemove(oldDocument),
    });

    await updateDoc(youngsterRef, {
        documents: arrayUnion(newDocument),
        updatedAt: serverTimestamp(),
    });
}

// ============================================================================
// BOOKINGS
// ============================================================================

/**
 * Crée une nouvelle réservation
 */
export async function createBooking(bookingData: any): Promise<string> {
    const bookingsRef = collection(db, 'bookings');
    const bookingRef = doc(bookingsRef);

    await setDoc(bookingRef, {
        ...bookingData,
        id: bookingRef.id,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return bookingRef.id;
}

/**
 * Récupère les réservations d'un parent
 */
export async function getParentBookings(parentId: string): Promise<any[]> {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
        bookingsRef,
        where('parentId', '==', parentId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data());
}

/**
 * Récupère une réservation spécifique
 */
export async function getBooking(bookingId: string): Promise<any | null> {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
        return null;
    }

    return bookingSnap.data();
}

/**
 * Met à jour une réservation
 */
export async function updateBooking(
    bookingId: string,
    data: any
): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Annule une réservation
 */
export async function cancelBooking(
    bookingId: string,
    cancelledBy: 'parent' | 'accompanist' | 'admin',
    reason: string,
    refundAmount: number
): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        status: 'cancelled',
        cancellation: {
            cancelledBy,
            cancelledAt: serverTimestamp(),
            reason,
            refundAmount,
            refundStatus: 'pending',
        },
        updatedAt: serverTimestamp(),
    });
}

/**
 * Confirme le paiement de l'acompte
 */
export async function confirmDepositPayment(bookingId: string): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        'pricing.depositPaid': true,
        status: 'paid',
        updatedAt: serverTimestamp(),
    });
}

/**
 * Confirme le paiement du solde
 */
export async function confirmBalancePayment(bookingId: string): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        'pricing.balancePaid': true,
        status: 'paid',
        updatedAt: serverTimestamp(),
    });
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Récupère les paramètres généraux
 */
export async function getSettings(): Promise<any> {
    const settingsRef = doc(db, 'settings', 'general');
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        return null;
    }

    return settingsSnap.data();
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Génère un code de parrainage unique
 */
function generateReferralCode(uid: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const uidHash = uid.substring(0, 4).toUpperCase();
    let random = '';

    for (let i = 0; i < 4; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `PJ${uidHash}${random}`;
}

/**
 * Convertit un Timestamp Firestore en Date
 */
export function timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
}

/**
 * Convertit une Date en Timestamp Firestore
 */
export function dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
}

export { db };
