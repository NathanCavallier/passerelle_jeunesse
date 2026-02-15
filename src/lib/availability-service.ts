/**
 * Service de vérification de disponibilité
 * Vérifie si un créneau horaire est disponible pour une réservation
 */

import { adminDb } from './firebase-admin';

/**
 * Vérifie la disponibilité d'un créneau horaire
 * @param scheduledDate - Date et heure prévues pour la réservation
 * @param serviceType - Type de service (accompagnement ou urgence)
 * @returns true si disponible, false sinon
 */
export async function checkAvailability(
    scheduledDate: Date,
    serviceType: 'accompagnement' | 'urgence'
): Promise<{ available: boolean; reason?: string }> {
    try {
        // Définir une fenêtre de temps (±2h autour de la date demandée)
        const bufferHours = 2;
        const startWindow = new Date(scheduledDate.getTime() - bufferHours * 60 * 60 * 1000);
        const endWindow = new Date(scheduledDate.getTime() + bufferHours * 60 * 60 * 1000);

        // Rechercher les réservations existantes dans cette fenêtre
        const existingBookingsSnapshot = await adminDb
            .collection('bookings')
            .where('scheduledFor', '>=', startWindow)
            .where('scheduledFor', '<=', endWindow)
            .where('status', '!=', 'cancelled')
            .get();

        // Si aucune réservation trouvée, c'est disponible
        if (existingBookingsSnapshot.empty) {
            return { available: true };
        }

        // Compter les réservations par type de service
        const bookingsByType: Record<string, number> = {
            accompagnement: 0,
            urgence: 0,
        };

        existingBookingsSnapshot.forEach((doc) => {
            const booking = doc.data();
            const type = booking.serviceDetails?.type || 'accompagnement';
            bookingsByType[type] = (bookingsByType[type] || 0) + 1;
        });

        // Limites de capacité (ajustable selon vos besoins)
        const capacityLimits: Record<string, number> = {
            accompagnement: 5, // Maximum 5 accompagnements simultanés
            urgence: 2, // Maximum 2 urgences simultanées
        };

        const currentCount = bookingsByType[serviceType] || 0;
        const maxCapacity = capacityLimits[serviceType] || 1;

        if (currentCount >= maxCapacity) {
            return {
                available: false,
                reason: `Capacité maximale atteinte (${currentCount}/${maxCapacity}) pour ${serviceType} à cette date`,
            };
        }

        return { available: true };
    } catch (error) {
        console.error('Erreur vérification disponibilité:', error);
        throw new Error('Impossible de vérifier la disponibilité');
    }
}

/**
 * Récupère les créneaux disponibles pour une date donnée
 * @param date - Date à vérifier (format YYYY-MM-DD)
 * @param serviceType - Type de service
 * @returns Liste des créneaux horaires disponibles
 */
export async function getAvailableTimeSlots(
    date: string,
    serviceType: 'accompagnement' | 'urgence'
): Promise<string[]> {
    try {
        // Créneaux horaires possibles (de 8h à 20h, par tranches de 2h)
        const possibleSlots = [
            '08:00',
            '10:00',
            '12:00',
            '14:00',
            '16:00',
            '18:00',
            '20:00',
        ];

        const availableSlots: string[] = [];

        // Vérifier chaque créneau
        for (const time of possibleSlots) {
            const scheduledDate = new Date(`${date}T${time}:00`);

            // Vérifier la disponibilité
            const { available } = await checkAvailability(scheduledDate, serviceType);

            if (available) {
                availableSlots.push(time);
            }
        }

        return availableSlots;
    } catch (error) {
        console.error('Erreur récupération créneaux:', error);
        throw new Error('Impossible de récupérer les créneaux disponibles');
    }
}

/**
 * Vérifie si une date est dans le futur (minimum 24h à l'avance)
 * @param scheduledDate - Date à vérifier
 * @returns true si la date est valide, false sinon
 */
export function isValidBookingDate(scheduledDate: Date): { valid: boolean; reason?: string } {
    const now = new Date();
    const hoursDiff = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
        return {
            valid: false,
            reason: 'Les réservations doivent être effectuées au moins 24h à l\'avance',
        };
    }

    // Maximum 6 mois à l'avance
    const maxDays = 180;
    const daysDiff = hoursDiff / 24;

    if (daysDiff > maxDays) {
        return {
            valid: false,
            reason: `Les réservations ne peuvent pas être effectuées plus de ${maxDays} jours à l'avance`,
        };
    }

    return { valid: true };
}
