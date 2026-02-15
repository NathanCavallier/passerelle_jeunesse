/**
 * API Route - Vérification de disponibilité
 * POST /api/availability/check
 * 
 * Vérifie si un créneau horaire est disponible pour une réservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAvailability, isValidBookingDate } from '@/lib/availability-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { scheduledFor, serviceType } = body;

        if (!scheduledFor || !serviceType) {
            return NextResponse.json(
                { error: 'scheduledFor et serviceType requis' },
                { status: 400 }
            );
        }

        // Convertir en Date
        const scheduledDate = new Date(scheduledFor);

        if (isNaN(scheduledDate.getTime())) {
            return NextResponse.json(
                { error: 'Format de date invalide' },
                { status: 400 }
            );
        }

        // Vérifier si la date est valide (minimum 24h à l'avance)
        const dateValidation = isValidBookingDate(scheduledDate);
        if (!dateValidation.valid) {
            return NextResponse.json({
                available: false,
                reason: dateValidation.reason,
            });
        }

        // Vérifier la disponibilité
        const result = await checkAvailability(scheduledDate, serviceType);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Erreur API check availability:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la vérification' },
            { status: 500 }
        );
    }
}
