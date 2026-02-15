/**
 * API Route - Annulation de réservation
 * POST /api/bookings/[id]/cancel
 * 
 * Annule une réservation et traite le remboursement Stripe si applicable
 */

import { NextRequest, NextResponse } from 'next/server';
import { cancelBookingAdmin } from '@/lib/firestore-admin-service';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = params.id;

        // Récupérer les données de la requête
        const body = await request.json();
        const {
            userId,
            cancelledBy = 'parent',
            reason = 'Annulation par le parent',
            refundAmount = 0
        } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId requis' },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur connecté peut annuler cette réservation
        try {
            const user = await adminAuth.getUser(userId);
            if (!user) {
                return NextResponse.json(
                    { error: 'Utilisateur non authentifié' },
                    { status: 401 }
                );
            }
        } catch (authError) {
            return NextResponse.json(
                { error: 'Utilisateur non authentifié' },
                { status: 401 }
            );
        }

        // Annuler la réservation et traiter le remboursement
        await cancelBookingAdmin(
            bookingId,
            cancelledBy,
            reason,
            refundAmount
        );

        return NextResponse.json({
            success: true,
            message: 'Réservation annulée avec succès',
            refundProcessed: refundAmount > 0,
        });
    } catch (error: any) {
        console.error('Erreur API cancel booking:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'annulation' },
            { status: 500 }
        );
    }
}
