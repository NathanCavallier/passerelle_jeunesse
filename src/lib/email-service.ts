/**
 * Service d'envoi d'emails transactionnels
 * Utilise SendGrid pour l'envoi d'emails automatiques
 */

import sgMail from '@sendgrid/mail';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '@/types/firestore';

// Configuration SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'contact@passerellejeunesse.fr';
const NO_REPLY_EMAIL = process.env.SENDGRID_NO_REPLY_EMAIL || 'noreply@passerellejeunesse.fr';
const FROM_NAME = 'Passerelle Jeunesse';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Convertit une date Firestore en objet Date
 */
function toDate(timestamp: any): Date {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000);
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return new Date();
}

/**
 * Formate un montant en euros
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

/**
 * Génère le contenu HTML d'un email de confirmation de réservation
 */
function generateBookingConfirmationHTML(
    booking: Booking,
    parentName: string
): string {
    const scheduledDate = format(toDate(booking.scheduledFor), 'EEEE d MMMM yyyy à HH:mm', {
        locale: fr,
    });

    const youngstersNames = booking.youngsters.map(y => y.firstName).join(', ');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de votre réservation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #6b7280;
        }
        .value {
            color: #111827;
        }
        .price {
            font-size: 24px;
            font-weight: bold;
            color: #3B82F6;
            text-align: center;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: #3B82F6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            background: #dbeafe;
            padding: 15px;
            border-left: 4px solid #3B82F6;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ Réservation confirmée</h1>
    </div>

    <div class="content">
        <p>Bonjour ${parentName},</p>

        <p>Nous avons bien reçu votre demande de réservation. Voici le récapitulatif :</p>

        <div class="card">
            <h2 style="margin-top: 0;">Détails de la prestation</h2>
            <div class="info-row">
                <span class="label">Date et heure</span>
                <span class="value">${scheduledDate}</span>
            </div>
            <div class="info-row">
                <span class="label">Type de service</span>
                <span class="value">${booking.serviceType === 'local' ? 'Accompagnement local' : 'Longue distance'}</span>
            </div>
            <div class="info-row">
                <span class="label">Jeunes concernés</span>
                <span class="value">${youngstersNames}</span>
            </div>
        </div>

        <div class="card">
            <h2 style="margin-top: 0;">Trajet</h2>
            <div class="info-row">
                <span class="label">📍 Départ</span>
                <span class="value">${booking.trip.departure.address}, ${booking.trip.departure.city}</span>
            </div>
            <div class="info-row">
                <span class="label">🎯 Arrivée</span>
                <span class="value">${booking.trip.arrival.address}, ${booking.trip.arrival.city}</span>
            </div>
        </div>

        <div class="card">
            <h2 style="margin-top: 0;">Tarification</h2>
            <div class="price">${formatCurrency(booking.pricing.total)}</div>
            <div class="info-row">
                <span class="label">Acompte (30%)</span>
                <span class="value">${formatCurrency(booking.pricing.deposit)}</span>
            </div>
            <div class="info-row">
                <span class="label">Solde</span>
                <span class="value">${formatCurrency(booking.pricing.balance)}</span>
            </div>
        </div>

        ${!booking.pricing.depositPaid ? `
        <div class="highlight">
            <p style="margin: 0;"><strong>⚠️ Action requise :</strong> Veuillez effectuer le paiement de l'acompte pour confirmer définitivement votre réservation.</p>
        </div>

        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard/bookings/${booking.id}" class="button">
                Payer l'acompte
            </a>
        </div>
        ` : ''}

        <p style="margin-top: 30px;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>

        <p>Cordialement,<br><strong>L'équipe Passerelle Jeunesse</strong></p>
    </div>

    <div class="footer">
        <p>Passerelle Jeunesse - Accompagnement de jeunes en toute sécurité</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}" style="color: #3B82F6;">jeunesse.imogo.org</a></p>
    </div>
</body>
</html>
    `;
}

/**
 * Génère le contenu HTML d'un email de confirmation de paiement
 */
function generatePaymentConfirmationHTML(
    booking: Booking,
    parentName: string,
    paymentType: 'deposit' | 'balance',
    amount: number
): string {
    const paymentLabel = paymentType === 'deposit' ? 'l\'acompte' : 'le solde';
    const scheduledDate = format(toDate(booking.scheduledFor), 'EEEE d MMMM yyyy à HH:mm', {
        locale: fr,
    });

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paiement confirmé</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .success-badge {
            background: #D1FAE5;
            color: #065F46;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 600;
            margin: 10px 0;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #10B981;
            text-align: center;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .button {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ Paiement confirmé</h1>
        <div class="success-badge">Transaction réussie</div>
    </div>

    <div class="content">
        <p>Bonjour ${parentName},</p>

        <p>Nous avons bien reçu votre paiement de ${paymentLabel}.</p>

        <div class="card">
            <div class="amount">${formatCurrency(amount)}</div>
            <div class="info-row">
                <span style="font-weight: 600; color: #6b7280;">Type de paiement</span>
                <span>${paymentType === 'deposit' ? 'Acompte (30%)' : 'Solde'}</span>
            </div>
            <div class="info-row">
                <span style="font-weight: 600; color: #6b7280;">Date de paiement</span>
                <span>${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
            </div>
            <div class="info-row">
                <span style="font-weight: 600; color: #6b7280;">Réservation</span>
                <span>#${booking.id.substring(0, 8).toUpperCase()}</span>
            </div>
        </div>

        ${paymentType === 'balance' ? `
        <div style="background: #D1FAE5; padding: 15px; border-left: 4px solid #10B981; margin: 15px 0;">
            <p style="margin: 0;"><strong>✓ Réservation entièrement payée !</strong></p>
            <p style="margin: 5px 0 0 0;">Votre prestation est confirmée pour le ${scheduledDate}.</p>
        </div>
        ` : `
        <div style="background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 15px 0;">
            <p style="margin: 0;"><strong>💡 Prochaine étape :</strong></p>
            <p style="margin: 5px 0 0 0;">Le paiement du solde (${formatCurrency(booking.pricing.balance)}) devra être effectué avant la prestation du ${scheduledDate}.</p>
        </div>
        `}

        <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard/bookings/${booking.id}" class="button">
                Voir ma réservation
            </a>
        </div>

        <p>Vous pouvez télécharger votre facture depuis votre espace client.</p>

        <p>Merci pour votre confiance !</p>

        <p>Cordialement,<br><strong>L'équipe Passerelle Jeunesse</strong></p>
    </div>

    <div class="footer">
        <p>Passerelle Jeunesse - Accompagnement de jeunes en toute sécurité</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}" style="color: #10B981;">jeunesse.imogo.org</a></p>
    </div>
</body>
</html>
    `;
}

/**
 * Génère le contenu HTML d'un email de rappel 24h avant
 */
function generateReminderHTML(booking: Booking, parentName: string): string {
    const scheduledDate = format(toDate(booking.scheduledFor), 'EEEE d MMMM yyyy à HH:mm', {
        locale: fr,
    });

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rappel de votre prestation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .highlight {
            background: #FEF3C7;
            padding: 15px;
            border-left: 4px solid #F59E0B;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            background: #F59E0B;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔔 Rappel de votre prestation</h1>
    </div>

    <div class="content">
        <p>Bonjour ${parentName},</p>

        <p>Ceci est un rappel concernant votre réservation de demain :</p>

        <div class="highlight">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${scheduledDate}</p>
        </div>

        <div class="card">
            <h3 style="margin-top: 0;">Détails du trajet</h3>
            <p><strong>📍 Départ :</strong> ${booking.trip.departure.address}, ${booking.trip.departure.city}</p>
            <p><strong>🎯 Arrivée :</strong> ${booking.trip.arrival.address}, ${booking.trip.arrival.city}</p>
            <p><strong>👤 Contact départ :</strong> ${booking.trip.departure.contactPerson} - ${booking.trip.departure.contactPhone}</p>
        </div>

        ${!booking.pricing.balancePaid ? `
        <div style="background: #FEE2E2; padding: 15px; border-left: 4px solid #EF4444; margin: 15px 0;">
            <p style="margin: 0;"><strong>⚠️ Paiement du solde requis</strong></p>
            <p style="margin: 5px 0 0 0;">Le solde de ${formatCurrency(booking.pricing.balance)} doit être réglé avant la prestation.</p>
        </div>

        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard/bookings/${booking.id}" class="button">
                Payer le solde
            </a>
        </div>
        ` : `
        <div style="background: #D1FAE5; padding: 15px; border-left: 4px solid #10B981; margin: 15px 0;">
            <p style="margin: 0;"><strong>✓ Paiement complet</strong></p>
            <p style="margin: 5px 0 0 0;">Votre réservation est entièrement payée. Tout est prêt !</p>
        </div>
        `}

        <p style="margin-top: 30px;">Si vous avez des questions ou besoin de modifier quoi que ce soit, n'hésitez pas à nous contacter.</p>

        <p>À très bientôt !</p>

        <p>Cordialement,<br><strong>L'équipe Passerelle Jeunesse</strong></p>
    </div>

    <div class="footer">
        <p>Passerelle Jeunesse - Accompagnement de jeunes en toute sécurité</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}" style="color: #F59E0B;">jeunesse.imogo.org</a></p>
    </div>
</body>
</html>
    `;
}

/**
 * Envoie un email de confirmation de réservation
 */
export async function sendBookingConfirmationEmail(
    booking: Booking,
    parentEmail: string,
    parentName: string
): Promise<void> {
    if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured - skipping email');
        return;
    }

    const html = generateBookingConfirmationHTML(booking, parentName);

    const msg = {
        to: parentEmail,
        from: {
            email: NO_REPLY_EMAIL,
            name: FROM_NAME,
        },
        replyTo: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        subject: '✓ Confirmation de votre réservation - Passerelle Jeunesse',
        html,
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Email de confirmation envoyé à:', parentEmail);
    } catch (error: any) {
        console.error('❌ Erreur envoi email de confirmation:', error.response?.body || error);
        throw error;
    }
}

/**
 * Envoie un email de confirmation de paiement
 */
export async function sendPaymentConfirmationEmail(
    booking: Booking,
    parentEmail: string,
    parentName: string,
    paymentType: 'deposit' | 'balance',
    amount: number
): Promise<void> {
    if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured - skipping email');
        return;
    }

    const html = generatePaymentConfirmationHTML(booking, parentName, paymentType, amount);

    const paymentLabel = paymentType === 'deposit' ? 'Acompte payé' : 'Paiement complet';

    const msg = {
        to: parentEmail,
        from: {
            email: NO_REPLY_EMAIL,
            name: FROM_NAME,
        },
        replyTo: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        subject: `✓ ${paymentLabel} - Réservation ${booking.id.substring(0, 8).toUpperCase()}`,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Email de paiement envoyé à:', parentEmail);
    } catch (error: any) {
        console.error('❌ Erreur envoi email de paiement:', error.response?.body || error);
        throw error;
    }
}

/**
 * Envoie un email de rappel 24h avant la prestation
 */
export async function sendReminderEmail(
    booking: Booking,
    parentEmail: string,
    parentName: string
): Promise<void> {
    if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured - skipping email');
        return;
    }

    const html = generateReminderHTML(booking, parentName);

    const msg = {
        to: parentEmail,
        from: {
            email: NO_REPLY_EMAIL,
            name: FROM_NAME,
        },
        replyTo: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        subject: '🔔 Rappel : Votre prestation de demain - Passerelle Jeunesse',
        html,
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Email de rappel envoyé à:', parentEmail);
    } catch (error: any) {
        console.error('❌ Erreur envoi email de rappel:', error.response?.body || error);
        throw error;
    }
}
