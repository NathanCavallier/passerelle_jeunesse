/**
 * API Route - Mise à jour statut de mission
 *POST /api/bookings/[id]/status
 * 
 * Met à jour le statut en temps réel d'une mission (accompagnateur)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import type { MissionStatus } from '@/types/firestore';

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
            status,
            notes,
            photoURL,
            location
        } = body;

        if (!userId || !status) {
            return NextResponse.json(
                { error: 'userId et status requis' },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur est authentifié
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

        // Récupérer le booking
        const bookingRef = adminDb.collection('bookings').doc(bookingId);
        const bookingDoc = await bookingRef.get();

        if (!bookingDoc.exists) {
            return NextResponse.json(
                { error: 'Réservation introuvable' },
                { status: 404 }
            );
        }

        const booking = bookingDoc.data();

        // Vérifier que l'utilisateur est l'accompagnateur assigné ou un admin
        if (booking?.accompanistId !== userId) {
            // TODO: Vérifier si admin
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        // Créer la mise à jour de statut
        const statusUpdate: any = {
            status,
            updatedAt: new Date(),
            updatedBy: userId,
        };

        if (notes) {
            statusUpdate.notes = notes;
        }

        if (photoURL) {
            statusUpdate.photoURL = photoURL;
        }

        if (location) {
            statusUpdate.location = {
                lat: location.lat,
                lng: location.lng,
                timestamp: new Date(),
            };
        }

        // Récupérer l'historique existant ou créer un nouveau
        const existingTracking = booking?.missionTracking || {
            currentStatus: 'scheduled',
            statusHistory: [],
        };

        // Ajouter la nouvelle mise à jour à l'historique
        const updatedHistory = [
            ...(existingTracking.statusHistory || []),
            statusUpdate,
        ];

        // Mise à jour spéciale pour les photos de départ/arrivée
        const missionTrackingUpdate: any = {
            currentStatus: status,
            statusHistory: updatedHistory,
            lastUpdateAt: new Date(),
        };

        if (status === 'picked_up' && photoURL) {
            missionTrackingUpdate.departurePhoto = photoURL;
        }

        if (status === 'delivered' && photoURL) {
            missionTrackingUpdate.arrivalPhoto = photoURL;
        }

        // Mettre à jour le booking dans Firestore
        await bookingRef.update({
            missionTracking: missionTrackingUpdate,
            updatedAt: new Date(),
        });

        // Si la mission est terminée, mettre à jour le statut du booking
        if (status === 'completed') {
            await bookingRef.update({
                status: 'completed',
            });
        }

        console.log(`Statut de la mission ${bookingId} mis à jour: ${status}`);

        return NextResponse.json({
            success: true,
            message: 'Statut mis à jour avec succès',
            missionTracking: missionTrackingUpdate,
        });
    } catch (error: any) {
        console.error('Erreur API update mission status:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la mise à jour du statut' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/bookings/[id]/status
 * 
 * Récupère le statut actuel de la mission
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = params.id;

        // Récupérer le booking
        const bookingRef = adminDb.collection('bookings').doc(bookingId);
        const bookingDoc = await bookingRef.get();

        if (!bookingDoc.exists) {
            return NextResponse.json(
                { error: 'Réservation introuvable' },
                { status: 404 }
            );
        }

        const booking = bookingDoc.data();
        const missionTracking = booking?.missionTracking || {
            currentStatus: 'scheduled',
            statusHistory: [],
        };

        return NextResponse.json({
            success: true,
            missionTracking,
        });
    } catch (error: any) {
        console.error('Erreur API get mission status:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération du statut' },
            { status: 500 }
        );
    }
}
