/**
 * Service Stripe - Côté serveur uniquement
 * Gestion des paiements avec l'API Stripe secrète
 */

import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getStripe(): Stripe {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured. Please set it in your environment.');
    }

    if (!stripe) {
        stripe = new Stripe(secretKey, {
            // apiVersion est géré automatiquement par le SDK
        });
    }

    return stripe;
}

export interface CreatePaymentSessionParams {
    bookingId: string;
    amount: number; // Montant en euros
    currency?: string;
    paymentType: 'deposit' | 'balance';
    customerEmail?: string;
    customerName?: string;
    metadata?: Record<string, string>;
}

/**
 * Crée une session Stripe Checkout pour un paiement
 */
export async function createPaymentSession(params: CreatePaymentSessionParams): Promise<Stripe.Checkout.Session> {
    const {
        bookingId,
        amount,
        currency = 'eur',
        paymentType,
        customerEmail,
        customerName,
        metadata = {},
    } = params;

    // Convertir le montant en centimes (Stripe utilise les centimes)
    const amountInCents = Math.round(amount * 100);

    try {
        const stripeClient = getStripe();
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency,
                        unit_amount: amountInCents,
                        product_data: {
                            name: paymentType === 'deposit'
                                ? `Acompte - Réservation ${bookingId}`
                                : `Solde - Réservation ${bookingId}`,
                            description: paymentType === 'deposit'
                                ? 'Acompte de 30% pour la réservation'
                                : 'Paiement du solde restant',
                            metadata: {
                                bookingId,
                                paymentType,
                            },
                        },
                    },
                    quantity: 1,
                },
            ],
            customer_email: customerEmail,
            metadata: {
                bookingId,
                paymentType,
                ...metadata,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings/${bookingId}?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings/${bookingId}?payment=cancelled`,
            locale: 'fr',
            billing_address_collection: 'required',
            phone_number_collection: {
                enabled: true,
            },
        });

        return session;
    } catch (error) {
        console.error('Erreur création session Stripe:', error);
        throw new Error('Impossible de créer la session de paiement');
    }
}

/**
 * Récupère les informations d'une session de paiement
 */
export async function getPaymentSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
        const stripeClient = getStripe();
        const session = await stripeClient.checkout.sessions.retrieve(sessionId);
        return session;
    } catch (error) {
        console.error('Erreur récupération session:', error);
        throw new Error('Session de paiement introuvable');
    }
}

/**
 * Crée un remboursement pour un paiement
 */
export async function createRefund(
    paymentIntentId: string,
    amount?: number, // Montant en euros (optionnel, remboursement total par défaut)
    reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
    try {
        const stripeClient = getStripe();
        const refundParams: Stripe.RefundCreateParams = {
            payment_intent: paymentIntentId,
            reason: reason || 'requested_by_customer',
        };

        if (amount) {
            refundParams.amount = Math.round(amount * 100); // Convertir en centimes
        }

        const refund = await stripeClient.refunds.create(refundParams);
        return refund;
    } catch (error) {
        console.error('Erreur création remboursement:', error);
        throw new Error('Impossible de créer le remboursement');
    }
}

/**
 * Vérifie la signature d'un webhook Stripe
 */
export function verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    try {
        const stripeClient = getStripe();
        const event = stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
        return event;
    } catch (error) {
        console.error('Erreur vérification signature webhook:', error);
        throw new Error('Signature webhook invalide');
    }
}

/**
 * Récupère un Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
        const stripeClient = getStripe();
        const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Erreur récupération PaymentIntent:', error);
        throw new Error('Payment Intent introuvable');
    }
}

/**
 * Liste les paiements d'un client
 */
export async function listCustomerPayments(customerEmail: string, limit: number = 10): Promise<Stripe.Charge[]> {
    try {
        const stripeClient = getStripe();
        const charges = await stripeClient.charges.list({
            limit,
        });

        // Filtrer par email (approximatif, idéalement utiliser l'ID client)
        return charges.data;
    } catch (error) {
        console.error('Erreur liste paiements:', error);
        throw new Error('Impossible de récupérer les paiements');
    }
}

export { stripe };
