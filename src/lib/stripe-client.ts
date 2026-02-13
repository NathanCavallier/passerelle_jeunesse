/**
 * Service Stripe - Côté client
 * Initialisation de Stripe.js pour le frontend
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Charge et retourne l'instance Stripe
 */
export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('Clé publique Stripe manquante');
            return Promise.resolve(null);
        }

        stripePromise = loadStripe(publishableKey);
    }

    return stripePromise;
};

/**
 * Vérifie si Stripe est configuré
 */
export const isStripeConfigured = (): boolean => {
    return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};
