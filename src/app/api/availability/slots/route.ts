/**
 * API Route - Créneaux horaires disponibles
 * GET /api/availability/slots?date=YYYY-MM-DD&serviceType=accompagnement
 * 
 * Récupère la liste des créneaux horaires disponibles pour une date donnée
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/availability-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const serviceType = searchParams.get('serviceType') as 'accompagnement' | 'urgence';

        if (!date || !serviceType) {
            return NextResponse.json(
                { error: 'date et serviceType requis' },
                { status: 400 }
            );
        }

        // Récupérer les créneaux disponibles
        const slots = await getAvailableTimeSlots(date, serviceType);

        return NextResponse.json({
            date,
            serviceType,
            availableSlots: slots,
            count: slots.length,
        });
    } catch (error: any) {
        console.error('Erreur API get time slots:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des créneaux' },
            { status: 500 }
        );
    }
}
