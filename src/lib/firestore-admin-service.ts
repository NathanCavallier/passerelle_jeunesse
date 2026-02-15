/**
 * Firestore Admin Service
 * Pour les opérations Firestore côté serveur (API routes)
 * Utilise Firebase Admin SDK qui bypass les règles de sécurité
 */

import { adminDb } from './firebase-admin';
import { createRefund } from './stripe-server';

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

/**
 * Annule une réservation et traite le remboursement via Stripe (Admin - server-side)
 */
export async function cancelBookingAdmin(
    bookingId: string,
    cancelledBy: 'parent' | 'accompanist' | 'admin',
    reason: string,
    refundAmount: number
): Promise<void> {
    try {
        // 1. Récupérer le booking
        const booking = await getBookingAdmin(bookingId);
        if (!booking) {
            throw new Error(`Booking ${bookingId} introuvable`);
        }

        // 2. Déterminer quel payment_intent_id utiliser pour le remboursement
        let paymentIntentId: string | null = null;

        // Si le solde a été payé, on rembourse sur le solde
        if (booking.payment?.balance?.paymentIntentId) {
            paymentIntentId = booking.payment.balance.paymentIntentId;
        }
        // Sinon si l'acompte a été payé, on rembourse sur l'acompte
        else if (booking.payment?.deposit?.paymentIntentId) {
            paymentIntentId = booking.payment.deposit.paymentIntentId;
        }

        // 3. Préparer les données d'annulation
        const cancellationData: any = {
            status: 'cancelled',
            cancellation: {
                cancelledBy,
                cancelledAt: new Date(),
                reason,
                refundAmount,
                refundStatus: 'pending',
            },
            updatedAt: new Date(),
        };

        // 4. Traiter le remboursement Stripe si un paiement existe et qu'un remboursement est dû
        if (paymentIntentId && refundAmount > 0) {
            try {
                console.log(`Traitement remboursement Stripe pour booking ${bookingId}:`, {
                    paymentIntentId,
                    refundAmount,
                });

                const refund = await createRefund(
                    paymentIntentId,
                    refundAmount,
                    'requested_by_customer'
                );

                console.log(`Remboursement Stripe créé:`, refund.id);

                // Mettre à jour le statut de remboursement
                cancellationData.cancellation.refundStatus = 'processed';
                cancellationData.cancellation.stripeRefundId = refund.id;
            } catch (refundError) {
                console.error('Erreur lors du remboursement Stripe:', refundError);
                // On laisse le refundStatus à 'pending' pour traitement manuel
                cancellationData.cancellation.refundError =
                    refundError instanceof Error ? refundError.message : 'Erreur inconnue';
            }
        } else if (refundAmount === 0) {
            // Aucun remboursement nécessaire
            cancellationData.cancellation.refundStatus = 'not_applicable';
        }

        // 5. Mettre à jour le booking dans Firestore
        const bookingRef = adminDb.collection('bookings').doc(bookingId);
        await bookingRef.update(cancellationData);

        console.log(`Booking ${bookingId} annulé avec succès`);
    } catch (error) {
        console.error('Erreur cancelBookingAdmin:', error);
        throw error;
    }
}

