/**
 * API Route - Créer une réservation
 * POST /api/bookings/create
 * 
 * Crée une réservation dans Firestore et envoie un email de confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { sendBookingConfirmationEmail } from '@/lib/email-service';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingData, userId } = body;

        // Validation
        if (!bookingData || !userId) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            );
        }

        // Créer la réservation dans Firestore
        const bookingsRef = adminDb.collection('bookings');
        const bookingRef = bookingsRef.doc();

        // Filtrer les valeurs undefined
        const cleanData = Object.fromEntries(
            Object.entries(bookingData).filter(([_, value]) => value !== undefined)
        );

        const bookingWithMetadata = {
            ...cleanData,
            id: bookingRef.id,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        await bookingRef.set(bookingWithMetadata);

        // Envoyer l'email de confirmation
        try {
            const user = await adminAuth.getUser(userId);
            if (user.email) {
                const parentName = user.displayName || 'Cher parent';

                // Récupérer la réservation créée pour avoir toutes les données
                const createdBooking = await bookingRef.get();
                const bookingDataForEmail = {
                    ...bookingWithMetadata,
                    createdAt: new Date(), // Convertir serverTimestamp
                    scheduledFor: bookingData.scheduledFor,
                };

                await sendBookingConfirmationEmail(
                    bookingDataForEmail as any,
                    user.email,
                    parentName
                );

                console.log('✅ Email de confirmation envoyé');
            }
        } catch (emailError) {
            console.error('❌ Erreur envoi email:', emailError);
            // Ne pas bloquer la création de réservation si l'email échoue
        }

        return NextResponse.json({
            success: true,
            bookingId: bookingRef.id,
        });
    } catch (error: any) {
        console.error('Erreur création réservation:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
