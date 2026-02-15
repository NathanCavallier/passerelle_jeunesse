/**
 * API Route - Créer une session Stripe Checkout
 * POST /api/payments/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/stripe-server';
import { getBookingAdmin } from '@/lib/firestore-admin-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, paymentType } = body;

        // Validation
        if (!bookingId || !paymentType) {
            return NextResponse.json(
                { error: 'bookingId et paymentType requis' },
                { status: 400 }
            );
        }

        if (paymentType !== 'deposit' && paymentType !== 'balance') {
            return NextResponse.json(
                { error: 'paymentType doit être "deposit" ou "balance"' },
                { status: 400 }
            );
        }

        // Récupérer la réservation depuis Firestore (avec Admin SDK)
        const booking = await getBookingAdmin(bookingId);

        if (!booking) {
            return NextResponse.json(
                { error: 'Réservation introuvable' },
                { status: 404 }
            );
        }

        // Vérifier que le paiement n'a pas déjà été effectué
        if (paymentType === 'deposit' && booking.pricing.depositPaid) {
            return NextResponse.json(
                { error: 'L\'acompte a déjà été payé' },
                { status: 400 }
            );
        }

        if (paymentType === 'balance' && booking.pricing.balancePaid) {
            return NextResponse.json(
                { error: 'Le solde a déjà été payé' },
                { status: 400 }
            );
        }

        // Vérifier que l'acompte est payé avant le solde
        if (paymentType === 'balance' && !booking.pricing.depositPaid) {
            return NextResponse.json(
                { error: 'L\'acompte doit être payé avant le solde' },
                { status: 400 }
            );
        }

        // Déterminer le montant
        const amount = paymentType === 'deposit'
            ? booking.pricing.deposit
            : booking.pricing.balance;

        // Créer la session Stripe
        const session = await createPaymentSession({
            bookingId: booking.id,
            amount,
            paymentType,
            customerEmail: body.customerEmail,
            customerName: body.customerName,
            metadata: {
                parentId: booking.parentId,
                serviceType: booking.serviceType,
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('Erreur création session checkout:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
