/**
 * Firestore Admin Service
 * Pour les opérations Firestore côté serveur (API routes)
 * Utilise Firebase Admin SDK qui bypass les règles de sécurité
 */

import { adminDb } from './firebase-admin';

/**
 * Récupère une réservation spécifique (Admin - server-side)
 */
export async function getBookingAdmin(bookingId: string): Promise<any | null> {
    try {
        const bookingRef = adminDb.collection('bookings').doc(bookingId);
        const bookingSnap = await bookingRef.get();

        if (!bookingSnap.exists) {
            return null;
        }

        return {
            id: bookingSnap.id,
            ...bookingSnap.data(),
        };
    } catch (error) {
        console.error('Erreur getBookingAdmin:', error);
        throw error;
    }
}

/**
 * Met à jour une réservation (Admin - server-side)
 */
export async function updateBookingAdmin(
    bookingId: string,
    data: any
): Promise<void> {
    try {
        const bookingRef = adminDb.collection('bookings').doc(bookingId);

        await bookingRef.update({
            ...data,
            updatedAt: new Date(),
        });
    } catch (error) {
        console.error('Erreur updateBookingAdmin:', error);
        throw error;
    }
}

/**
 * Récupère les réservations d'un parent (Admin - server-side)
 */
export async function getParentBookingsAdmin(parentId: string): Promise<any[]> {
    try {
        const bookingsRef = adminDb.collection('bookings');
        const snapshot = await bookingsRef
            .where('parentId', '==', parentId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Erreur getParentBookingsAdmin:', error);
        throw error;
    }
}

/**
 * Confirme le paiement de l'acompte (Admin - server-side)
 */
export async function confirmDepositPaymentAdmin(
    bookingId: string,
    paymentDetails?: {
        stripeSessionId?: string;
        paymentIntentId?: string;
        amountPaid?: number;
        paidAt?: Date;
    }
): Promise<void> {
    try {
        const bookingRef = adminDb.collection('bookings').doc(bookingId);

        const updateData: any = {
            'pricing.depositPaid': true,
            status: 'paid',
            updatedAt: new Date(),
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

        await bookingRef.update(updateData);
    } catch (error) {
        console.error('Erreur confirmDepositPaymentAdmin:', error);
        throw error;
    }
}

/**
 * Confirme le paiement du solde (Admin - server-side)
 */
export async function confirmBalancePaymentAdmin(
    bookingId: string,
    paymentDetails?: {
        stripeSessionId?: string;
        paymentIntentId?: string;
        amountPaid?: number;
        paidAt?: Date;
    }
): Promise<void> {
    try {
        const bookingRef = adminDb.collection('bookings').doc(bookingId);

        const updateData: any = {
            'pricing.balancePaid': true,
            status: 'paid',
            updatedAt: new Date(),
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

        await bookingRef.update(updateData);
    } catch (error) {
        console.error('Erreur confirmBalancePaymentAdmin:', error);
        throw error;
    }
}

