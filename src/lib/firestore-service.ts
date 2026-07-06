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
import { getFirebaseDb } from './firebase';
import { getDefaultNotificationPreferences } from './notifications-service';
import type { User, UserRole, Address, YoungsterDocument, NotificationPreferences } from '@/types/firestore';

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
    const userRef = doc(getFirebaseDb(), 'users', uid);

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
            // Utiliser les préférences par défaut complètes pour respecter le type
            notifications: ({
                ...(getDefaultNotificationPreferences() as any),
                // `updatedAt` sera peuplé lors de la première mise à jour côté serveur
                updatedAt: serverTimestamp() as unknown as Timestamp,
            } as unknown as NotificationPreferences),
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
    } else if (data.role === 'accompanist') {
        userData.accompanistProfile = {
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

    await setDoc(userRef, userData);
}

/**
 * Récupère un document utilisateur
 */
export async function getUserDocument(uid: string): Promise<User | null> {
    const userRef = doc(getFirebaseDb(), 'users', uid);
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
    const userRef = doc(getFirebaseDb(), 'users', uid);

    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Met à jour le lastLoginAt
 */
export async function updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(getFirebaseDb(), 'users', uid);

    await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
    });
}

/**
 * Supprime un document utilisateur (soft delete)
 */
export async function deleteUserDocument(uid: string): Promise<void> {
    const userRef = doc(getFirebaseDb(), 'users', uid);

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
    const youngstersRef = collection(getFirebaseDb(), 'users', parentId, 'youngsters');
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
    const parentRef = doc(getFirebaseDb(), 'users', parentId);
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
    const youngstersRef = collection(getFirebaseDb(), 'users', parentId, 'youngsters');
    const q = query(youngstersRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data());
}

/**
 * Récupère un jeune spécifique
 */
export async function getYoungster(parentId: string, youngsterId: string): Promise<any | null> {
    const youngsterRef = doc(getFirebaseDb(), 'users', parentId, 'youngsters', youngsterId);
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
    const youngsterRef = doc(getFirebaseDb(), 'users', parentId, 'youngsters', youngsterId);

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
    const youngsterRef = doc(getFirebaseDb(), 'users', parentId, 'youngsters', youngsterId);

    await updateDoc(youngsterRef, {
        status: 'deleted',
        updatedAt: serverTimestamp(),
    });

    // Décrémenter le compteur de jeunes du parent
    const parentRef = doc(getFirebaseDb(), 'users', parentId);
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
    const youngsterRef = doc(getFirebaseDb(), 'users', parentId, 'youngsters', youngsterId);

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
    const youngsterRef = doc(getFirebaseDb(), 'users', parentId, 'youngsters', youngsterId);

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
    const youngsterRef = doc(getFirebaseDb(), 'users', parentId, 'youngsters', youngsterId);

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
    const bookingsRef = collection(getFirebaseDb(), 'bookings');
    const bookingRef = doc(bookingsRef);

    // Filtrer les valeurs undefined pour éviter l'erreur Firestore
    const cleanData = Object.fromEntries(
        Object.entries(bookingData).filter(([_, value]) => value !== undefined)
    );

    await setDoc(bookingRef, {
        ...cleanData,
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
    try {
        const bookingsRef = collection(getFirebaseDb(), 'bookings');

        // Requête simple sans orderBy pour éviter les erreurs si createdAt manque
        const q = query(
            bookingsRef,
            where('parentId', '==', parentId)
        );

        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.docs.length} bookings for parent ${parentId}`);

        // Inclure l'ID du document explicitement et trier côté client
        const bookings = snapshot.docs.map((doc) => ({
            ...(doc.data() as any),
            id: doc.id,
        }));

        // Trier par createdAt côté client (si le champ existe)
        return bookings.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            const dateA = a.createdAt.seconds || 0;
            const dateB = b.createdAt.seconds || 0;
            return dateB - dateA; // Plus récent en premier
        });
    } catch (error) {
        console.error('Erreur dans getParentBookings:', error);
        throw error;
    }
}

/**
 * Récupère une réservation spécifique
 */
export async function getBooking(bookingId: string): Promise<any | null> {
    const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
        return null;
    }

    // Inclure l'ID du document explicitement
    return {
        ...bookingSnap.data(),
        id: bookingSnap.id,
    };
}

/**
 * Met à jour une réservation
 */
export async function updateBooking(
    bookingId: string,
    data: any
): Promise<void> {
    const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);

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
    const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);

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
export async function confirmDepositPayment(
    bookingId: string,
    paymentDetails?: {
        stripeSessionId?: string;
        paymentIntentId?: string;
        amountPaid?: number;
        paidAt?: Date;
    }
): Promise<void> {
    const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);

    const updateData: any = {
        'pricing.depositPaid': true,
        status: 'paid',
        updatedAt: serverTimestamp(),
    };

    if (paymentDetails) {
        updateData['payment.deposit'] = {
            stripeSessionId: paymentDetails.stripeSessionId,
            paymentIntentId: paymentDetails.paymentIntentId,
            amount: paymentDetails.amountPaid,
            paidAt: paymentDetails.paidAt || new Date(),
            status: 'succeeded',
        };
    }

    await updateDoc(bookingRef, updateData);
}

/**
 * Confirme le paiement du solde
 */
export async function confirmBalancePayment(
    bookingId: string,
    paymentDetails?: {
        stripeSessionId?: string;
        paymentIntentId?: string;
        amountPaid?: number;
        paidAt?: Date;
    }
): Promise<void> {
    const bookingRef = doc(getFirebaseDb(), 'bookings', bookingId);

    const updateData: any = {
        'pricing.balancePaid': true,
        status: 'paid',
        updatedAt: serverTimestamp(),
    };

    if (paymentDetails) {
        updateData['payment.balance'] = {
            stripeSessionId: paymentDetails.stripeSessionId,
            paymentIntentId: paymentDetails.paymentIntentId,
            amount: paymentDetails.amountPaid,
            paidAt: paymentDetails.paidAt || new Date(),
            status: 'succeeded',
        };
    }

    await updateDoc(bookingRef, updateData);
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Récupère les paramètres généraux
 */
export async function getSettings(): Promise<any> {
    const settingsRef = doc(getFirebaseDb(), 'settings', 'general');
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

export { getFirebaseDb as db };
