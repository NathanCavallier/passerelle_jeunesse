/**
 * API Route - Envoi des rappels 24h
 * GET /api/cron/send-reminders
 * 
 * Vérifie les réservations prévues dans 24h et envoie un email de rappel
 * Cette route est appelée par un cron job (Vercel Cron ou autre)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { sendReminderEmail } from '@/lib/email-service';

export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification du cron (optionnel mais recommandé)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        // Calculer la fenêtre de temps : 24h à partir de maintenant, avec une marge de 1h
        const now = new Date();
        const twentyThreeHoursFromNow = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        console.log('Recherche de réservations entre:', {
            start: twentyThreeHoursFromNow.toISOString(),
            end: twentyFiveHoursFromNow.toISOString(),
        });

        // Récupérer les réservations prévues dans ~24h (23-25h)
        const bookingsSnapshot = await adminDb
            .collection('bookings')
            .where('scheduledFor', '>=', twentyThreeHoursFromNow)
            .where('scheduledFor', '<=', twentyFiveHoursFromNow)
            .where('status', '!=', 'cancelled')
            .get();

        const results = {
            total: 0,
            sent: 0,
            skipped: 0,
            errors: 0,
            details: [] as any[],
        };

        // Pour chaque réservation, envoyer un email de rappel
        for (const bookingDoc of bookingsSnapshot.docs) {
            const booking: any = {
                id: bookingDoc.id,
                ...bookingDoc.data(),
            };

            results.total++;

            try {
                // Vérifier si un rappel a déjà été envoyé
                if (booking.reminderSent) {
                    console.log(`Rappel déjà envoyé pour booking ${booking.id}`);
                    results.skipped++;
                    results.details.push({
                        bookingId: booking.id,
                        status: 'skipped',
                        reason: 'Rappel déjà envoyé',
                    });
                    continue;
                }

                // Récupérer les informations du parent
                const parentUser = await adminAuth.getUser(booking.parentId);

                if (!parentUser.email) {
                    console.error(`Email manquant pour le parent ${booking.parentId}`);
                    results.errors++;
                    results.details.push({
                        bookingId: booking.id,
                        status: 'error',
                        reason: 'Email du parent manquant',
                    });
                    continue;
                }

                const parentName = parentUser.displayName || 'Cher parent';

                // Envoyer l'email de rappel
                await sendReminderEmail(
                    booking as any,
                    parentUser.email,
                    parentName
                );

                // Marquer le rappel comme envoyé
                await adminDb.collection('bookings').doc(booking.id).update({
                    reminderSent: true,
                    reminderSentAt: new Date(),
                });

                console.log(`Rappel envoyé avec succès pour booking ${booking.id}`);
                results.sent++;
                results.details.push({
                    bookingId: booking.id,
                    status: 'sent',
                    parentEmail: parentUser.email,
                });
            } catch (error: any) {
                console.error(`Erreur envoi rappel pour booking ${booking.id}:`, error);
                results.errors++;
                results.details.push({
                    bookingId: booking.id,
                    status: 'error',
                    error: error.message,
                });
                // Continuer avec les autres réservations
            }
        }

        console.log('Résultat envoi rappels:', results);

        return NextResponse.json({
            success: true,
            message: `Rappels traités: ${results.sent} envoyés, ${results.skipped} ignorés, ${results.errors} erreurs`,
            results,
        });
    } catch (error: any) {
        console.error('Erreur API send-reminders:', error);
        return NextResponse.json(
            {
                error: error.message || 'Erreur lors de l\'envoi des rappels',
                success: false,
            },
            { status: 500 }
        );
    }
}
