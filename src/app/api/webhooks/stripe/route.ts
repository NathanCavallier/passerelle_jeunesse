/**
 * API Route - Webhooks Stripe
 * POST /api/webhooks/stripe
 *
 * Reçoit les événements de Stripe (paiements réussis, remboursements, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { confirmDepositPaymentAdmin, confirmBalancePaymentAdmin, getBookingAdmin, updateBookingAdmin } from '@/lib/firestore-admin-service';
import { sendPaymentConfirmationEmail } from '@/lib/email-service';
import { adminAuth } from '@/lib/firebase-admin';
import admin from '@/lib/firebase-admin';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    try {
        // Récupérer le corps brut de la requête
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Signature manquante' },
                { status: 400 }
            );
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('STRIPE_WEBHOOK_SECRET non configuré');
            return NextResponse.json(
                { error: 'Configuration webhook manquante' },
                { status: 500 }
            );
        }

        // Vérifier la signature du webhook
        let event: Stripe.Event;
        try {
            event = verifyWebhookSignature(body, signature, webhookSecret);
        } catch (err) {
            console.error('Erreur vérification signature:', err);
            return NextResponse.json(
                { error: 'Signature invalide' },
                { status: 400 }
            );
        }

        // Traiter l'événement selon son type
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                console.log('Paiement réussi:', session.id);

                // Récupérer les métadonnées
                const bookingId = session.metadata?.bookingId;
                const paymentType = session.metadata?.paymentType as 'deposit' | 'balance';

                if (!bookingId || !paymentType) {
                    console.error('Métadonnées manquantes:', session.metadata);
                    break;
                }

                // Mettre à jour la réservation dans Firestore
                try {
                    if (paymentType === 'deposit') {
                        await confirmDepositPaymentAdmin(bookingId, {
                            stripeSessionId: session.id,
                            paymentIntentId: session.payment_intent as string,
                            amountPaid: (session.amount_total || 0) / 100, // Convertir centimes en euros
                            paidAt: new Date(),
                        });
                        console.log(`Acompte confirmé pour ${bookingId}`);
                    } else if (paymentType === 'balance') {
                        await confirmBalancePaymentAdmin(bookingId, {
                            stripeSessionId: session.id,
                            paymentIntentId: session.payment_intent as string,
                            amountPaid: (session.amount_total || 0) / 100,
                            paidAt: new Date(),
                        });
                        console.log(`Solde confirmé pour ${bookingId}`);
                    }

                    // Envoyer l'email de confirmation de paiement
                    try {
                        const booking = await getBookingAdmin(bookingId);
                        if (booking) {
                            // Récupérer les informations du parent
                            const parentUser = await adminAuth.getUser(booking.parentId);
                            if (parentUser.email) {
                                const parentName = parentUser.displayName || 'Cher parent';
                                const amount = (session.amount_total || 0) / 100;

                                await sendPaymentConfirmationEmail(
                                    booking as any,
                                    parentUser.email,
                                    parentName,
                                    paymentType,
                                    amount
                                );
                            }
                        }
                    } catch (emailError) {
                        console.error('Erreur envoi email:', emailError);
                        // Ne pas bloquer le webhook si l'email échoue
                    }
                } catch (firestoreError) {
                    console.error('Erreur mise à jour Firestore:', firestoreError);
                    // Ne pas renvoyer d'erreur à Stripe pour ne pas qu'il réessaie
                    // On log juste l'erreur pour investigation manuelle
                }

                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('PaymentIntent réussi:', paymentIntent.id);
                // Traitement supplémentaire si nécessaire
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error('Échec du paiement:', paymentIntent.id);
                // Notifier l'utilisateur par email
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                console.log('Remboursement effectué:', charge.id);

                // Récupérer le payment_intent_id
                const paymentIntentId = charge.payment_intent as string;

                if (paymentIntentId) {
                    try {
                        // Rechercher le booking correspondant à ce payment_intent
                        // On doit chercher dans payment.deposit.paymentIntentId ou payment.balance.paymentIntentId
                        const bookingsRef = await admin.firestore().collection('bookings')
                            .where('payment.deposit.paymentIntentId', '==', paymentIntentId)
                            .limit(1)
                            .get();

                        // Si pas trouvé dans deposit, chercher dans balance
                        let booking: any = null;
                        if (!bookingsRef.empty) {
                            booking = {
                                id: bookingsRef.docs[0].id,
                                ...bookingsRef.docs[0].data(),
                            };
                        } else {
                            const bookingsRefBalance = await admin.firestore().collection('bookings')
                                .where('payment.balance.paymentIntentId', '==', paymentIntentId)
                                .limit(1)
                                .get();

                            if (!bookingsRefBalance.empty) {
                                booking = {
                                    id: bookingsRefBalance.docs[0].id,
                                    ...bookingsRefBalance.docs[0].data(),
                                };
                            }
                        }

                        if (booking && booking.cancellation) {
                            // Mettre à jour le statut de remboursement
                            // extraire l'ID du remboursement depuis la liste refunds (Stripe Charge)
                            const refundId = (charge as any).refunds?.data?.[0]?.id as string | undefined;

                            await updateBookingAdmin(booking.id, {
                                'cancellation.refundStatus': 'completed',
                                'cancellation.stripeRefundId': refundId || null,
                                'cancellation.refundedAt': new Date(),
                            });

                            console.log(`Remboursement confirmé pour booking ${booking.id}`);

                            // TODO: Envoyer un email de confirmation de remboursement
                        } else {
                            console.warn(`Booking introuvable ou non annulé pour payment_intent ${paymentIntentId}`);
                        }
                    } catch (refundError) {
                        console.error('Erreur traitement remboursement:', refundError);
                        // Ne pas bloquer le webhook
                    }
                }

                break;
            }

            default:
                console.log(`Type d'événement non géré: ${event.type}`);
        }

        // Toujours renvoyer 200 OK à Stripe
        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Erreur webhook Stripe:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur interne' },
            { status: 500 }
        );
    }
}
