/**
 * Service de tarification
 * Calcule les prix des réservations selon les règles métier
 */

import type { ServiceType, Pricing, Discount, DiscountType } from '@/types/firestore';

// ============================================================================
// CONSTANTS - Tarifs de base
// ============================================================================

export const PRICING_RULES = {
    // Tarifs de base par type de service
    BASE_PRICE: {
        local: 35, // Accompagnement local (dans la même ville)
        long_distance: 80, // Longue distance (transport entre villes)
    },

    // Supplément par jeune supplémentaire (à partir du 2ème)
    ADDITIONAL_YOUNGSTER: 15,

    // Supplément urgence (réservation < 48h)
    URGENCY_FEE: 20,

    // Supplément distance (par tranche de 50km au-delà de 100km)
    DISTANCE_FEE_PER_50KM: 25,
    DISTANCE_THRESHOLD: 100, // km gratuits inclus

    // Taux de TVA
    TAX_RATE: 0.20, // 20%

    // Acompte obligatoire
    DEPOSIT_RATE: 0.30, // 30% du total

    // Réductions
    DISCOUNTS: {
        fratrie: 0.10, // 10% si plusieurs jeunes de la même famille
        loyalty: 0.05, // 5% si fidélité (5+ trajets)
        first_booking: 0.15, // 15% première réservation
    },
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

export interface PricingInput {
    serviceType: ServiceType;
    numberOfYoungsters: number;
    distanceKm?: number; // Pour longue distance
    isUrgent?: boolean; // Réservation < 48h
    hasMultipleSiblings?: boolean; // Plusieurs jeunes de la même famille
    isFirstBooking?: boolean; // Première réservation du parent
    totalPreviousBookings?: number; // Nombre de trajets précédents
    promoCode?: string; // Code promo (non implémenté pour l'instant)
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Calcule le prix de base selon le type de service
 */
function calculateBasePrice(serviceType: ServiceType): number {
    return PRICING_RULES.BASE_PRICE[serviceType];
}

/**
 * Calcule le supplément pour les jeunes supplémentaires
 */
function calculateYoungstersSuplement(numberOfYoungsters: number): number {
    if (numberOfYoungsters <= 1) return 0;
    return (numberOfYoungsters - 1) * PRICING_RULES.ADDITIONAL_YOUNGSTER;
}

/**
 * Calcule le supplément pour la distance (longue distance uniquement)
 */
function calculateDistanceSupplement(
    serviceType: ServiceType,
    distanceKm: number = 0
): number {
    if (serviceType !== 'long_distance') return 0;
    if (distanceKm <= PRICING_RULES.DISTANCE_THRESHOLD) return 0;

    const extraKm = distanceKm - PRICING_RULES.DISTANCE_THRESHOLD;
    const tranches = Math.ceil(extraKm / 50);
    return tranches * PRICING_RULES.DISTANCE_FEE_PER_50KM;
}

/**
 * Calcule le supplément urgence si réservation < 48h
 */
function calculateUrgencySupplement(isUrgent: boolean = false): number {
    return isUrgent ? PRICING_RULES.URGENCY_FEE : 0;
}

/**
 * Calcule les réductions applicables
 */
function calculateDiscounts(input: PricingInput, subtotal: number): Discount[] {
    const discounts: Discount[] = [];

    // Réduction fratrie (plusieurs jeunes)
    if (input.hasMultipleSiblings && input.numberOfYoungsters > 1) {
        discounts.push({
            type: 'fratrie',
            amount: Math.round(subtotal * PRICING_RULES.DISCOUNTS.fratrie * 100) / 100,
        });
    }

    // Réduction fidélité (5+ trajets)
    if (
        input.totalPreviousBookings !== undefined &&
        input.totalPreviousBookings >= 5
    ) {
        discounts.push({
            type: 'loyalty',
            amount: Math.round(subtotal * PRICING_RULES.DISCOUNTS.loyalty * 100) / 100,
        });
    }

    // Réduction première réservation
    if (input.isFirstBooking) {
        discounts.push({
            type: 'first_booking',
            amount: Math.round(subtotal * PRICING_RULES.DISCOUNTS.first_booking * 100) / 100,
        });
    }

    // TODO: Ajouter gestion des codes promo

    return discounts;
}

/**
 * Calcule le prix total d'une réservation
 */
export function calculateBookingPrice(input: PricingInput): Pricing {
    // 1. Prix de base
    const basePrice = calculateBasePrice(input.serviceType);

    // 2. Supplément jeunes
    const youngstersSuplement = calculateYoungstersSuplement(input.numberOfYoungsters);

    // 3. Supplément distance
    const distanceSupplement = calculateDistanceSupplement(
        input.serviceType,
        input.distanceKm
    );

    // 4. Supplément urgence
    const urgencySupplement = calculateUrgencySupplement(input.isUrgent);

    // 5. Sous-total avant réductions
    const subtotalBeforeDiscounts =
        basePrice +
        youngstersSuplement +
        distanceSupplement +
        urgencySupplement;

    // 6. Calcul des réductions
    const discounts = calculateDiscounts(input, subtotalBeforeDiscounts);
    const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);

    // 7. Sous-total après réductions
    const subtotal = Math.max(0, subtotalBeforeDiscounts - totalDiscounts);

    // 8. Taxes (TVA)
    const taxes = Math.round(subtotal * PRICING_RULES.TAX_RATE * 100) / 100;

    // 9. Total TTC
    const total = Math.round((subtotal + taxes) * 100) / 100;

    // 10. Acompte (30%)
    const deposit = Math.round(total * PRICING_RULES.DEPOSIT_RATE * 100) / 100;

    // 11. Solde
    const balance = Math.round((total - deposit) * 100) / 100;

    return {
        basePrice,
        youngstersSuplement,
        distanceSupplement,
        urgencySupplement,
        discounts,
        subtotal,
        taxes,
        total,
        deposit,
        depositPaid: false,
        balance,
        balancePaid: false,
        currency: 'EUR',
    };
}

/**
 * Formate un montant en euros
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

/**
 * Calcule si une réservation est urgente (< 48h)
 */
export function isUrgentBooking(scheduledDate: Date): boolean {
    const now = new Date();
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff < 48;
}

/**
 * Calcule la distance entre deux adresses
 * Utilise l'API Google Maps si disponible, sinon approximation par code postal
 */
export async function calculateDistance(
    departureAddress: string,
    departurePostalCode: string,
    arrivalAddress: string,
    arrivalPostalCode: string
): Promise<number> {
    // Tenter d'utiliser l'API Google Maps si disponible
    if (typeof window !== 'undefined') {
        try {
            const { calculateRealDistance, isGoogleMapsAvailable } = await import('./google-maps-service');

            if (isGoogleMapsAvailable()) {
                const fullDeparture = `${departureAddress}, ${departurePostalCode}`;
                const fullArrival = `${arrivalAddress}, ${arrivalPostalCode}`;

                const result = await calculateRealDistance(fullDeparture, fullArrival);
                return result.distanceKm;
            }
        } catch (error) {
            console.warn('Google Maps non disponible, utilisation de l\'approximation', error);
        }
    }

    // Fallback : approximation par code postal
    return estimateDistanceByPostalCode(departurePostalCode, arrivalPostalCode);
}

/**
 * Calcule la distance approximative entre deux codes postaux
 * Méthode de secours si Google Maps n'est pas disponible
 */
export function estimateDistanceByPostalCode(
    postalCode1: string,
    postalCode2: string
): number {
    // Approximation très simple basée sur les deux premiers chiffres
    const dept1 = parseInt(postalCode1.substring(0, 2));
    const dept2 = parseInt(postalCode2.substring(0, 2));

    if (dept1 === dept2) {
        // Même département : distance locale
        return 20;
    }

    // Approximation : 50km par département de différence
    return Math.abs(dept1 - dept2) * 50;
}

/**
 * @deprecated Utiliser calculateDistance() à la place
 * Calcule la distance entre deux codes postaux (approximation)
 * TODO: Intégrer une vraie API de calcul de distance (Google Maps, etc.)
 */
export function estimateDistance(
    postalCode1: string,
    postalCode2: string
): number {
    return estimateDistanceByPostalCode(postalCode1, postalCode2);
}

/**
 * Obtient le label d'un type de réduction
 */
export function getDiscountLabel(type: DiscountType): string {
    const labels: Record<DiscountType, string> = {
        fratrie: 'Réduction fratrie',
        loyalty: 'Réduction fidélité',
        promo_code: 'Code promo',
        first_booking: 'Première réservation',
    };
    return labels[type];
}
