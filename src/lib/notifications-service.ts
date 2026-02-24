/**
 * Service de gestion des préférences de notifications
 */

import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
    NotificationPreferences,
    NotificationEventType,
    NotificationChannel,
    NotificationChannelSettings,
    NotificationEventSettings
} from '@/types/firestore';

// ============================================================================
// PRÉFÉRENCES PAR DÉFAUT
// ============================================================================

const defaultChannelSettings: NotificationChannelSettings = {
    enabled: true,
    quietHours: {
        start: '22:00',
        end: '08:00'
    }
};

const defaultEventSettings: NotificationEventSettings = {
    email: { ...defaultChannelSettings },
    sms: { enabled: false },
    push: { enabled: true }
};

export const getDefaultNotificationPreferences = (): Omit<NotificationPreferences, 'updatedAt'> => ({
    globalSettings: {
        email: { ...defaultChannelSettings },
        sms: { enabled: false },
        push: { enabled: true }
    },
    events: {
        booking_confirmed: { ...defaultEventSettings },
        booking_cancelled: { ...defaultEventSettings },
        mission_status_update: {
            email: { enabled: true },
            sms: { enabled: false },
            push: { enabled: true }
        },
        new_message: {
            email: { enabled: false },
            sms: { enabled: false },
            push: { enabled: true }
        },
        payment_processed: { ...defaultEventSettings },
        payment_failed: {
            email: { enabled: true },
            sms: { enabled: true },
            push: { enabled: true }
        },
        reminder_mission: { ...defaultEventSettings },
        reminder_payment: {
            email: { enabled: true },
            sms: { enabled: true },
            push: { enabled: true }
        },
        review_request: {
            email: { enabled: true },
            sms: { enabled: false },
            push: { enabled: false }
        },
        account_update: {
            email: { enabled: true },
            sms: { enabled: false },
            push: { enabled: false }
        }
    },
    summary: {
        dailyEnabled: false,
        weeklyEnabled: true,
        preferredTime: '18:00'
    }
});

// ============================================================================
// GESTION DES PRÉFÉRENCES
// ============================================================================

/**
 * Récupérer les préférences de notifications d'un utilisateur
 */
export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            throw new Error('Utilisateur non trouvé');
        }

        const userData = userDoc.data();
        const preferences = userData.preferences?.notifications;

        if (!preferences) {
            // Retourner les préférences par défaut avec timestamp
            return {
                ...getDefaultNotificationPreferences(),
                updatedAt: new Date() as any
            };
        }

        return preferences as NotificationPreferences;
    } catch (error) {
        console.error('Erreur récupération préférences notifications:', error);
        return {
            ...getDefaultNotificationPreferences(),
            updatedAt: new Date() as any
        };
    }
}

/**
 * Mettre à jour les préférences de notifications
 */
export async function updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            'preferences.notifications': {
                ...preferences,
                updatedAt: serverTimestamp()
            },
            updatedAt: serverTimestamp()
        });

        console.log('Préférences notifications mises à jour');
    } catch (error) {
        console.error('Erreur mise à jour préférences notifications:', error);
        throw new Error('Impossible de sauvegarder les préférences');
    }
}

/**
 * Activer/désactiver un canal global
 */
export async function toggleGlobalChannel(
    userId: string,
    channel: NotificationChannel,
    enabled: boolean
): Promise<void> {
    try {
        const currentPrefs = await getUserNotificationPreferences(userId);

        const updatedPrefs = {
            ...currentPrefs,
            globalSettings: {
                ...currentPrefs.globalSettings,
                [channel]: {
                    ...currentPrefs.globalSettings[channel],
                    enabled
                }
            }
        };

        await updateNotificationPreferences(userId, updatedPrefs);
    } catch (error) {
        console.error('Erreur toggle canal global:', error);
        throw error;
    }
}

/**
 * Mettre à jour les préférences pour un type d'événement
 */
export async function updateEventPreferences(
    userId: string,
    eventType: NotificationEventType,
    settings: Partial<NotificationEventSettings>
): Promise<void> {
    try {
        const currentPrefs = await getUserNotificationPreferences(userId);

        const updatedPrefs = {
            ...currentPrefs,
            events: {
                ...currentPrefs.events,
                [eventType]: {
                    ...currentPrefs.events[eventType],
                    ...settings
                }
            }
        };

        await updateNotificationPreferences(userId, updatedPrefs);
    } catch (error) {
        console.error('Erreur mise à jour événement:', error);
        throw error;
    }
}

/**
 * Configurer les heures silencieuses
 */
export async function updateQuietHours(
    userId: string,
    channel: NotificationChannel,
    quietHours: { start: string; end: string } | undefined
): Promise<void> {
    try {
        const currentPrefs = await getUserNotificationPreferences(userId);

        const updatedPrefs = {
            ...currentPrefs,
            globalSettings: {
                ...currentPrefs.globalSettings,
                [channel]: {
                    ...currentPrefs.globalSettings[channel],
                    quietHours
                }
            }
        };

        await updateNotificationPreferences(userId, updatedPrefs);
    } catch (error) {
        console.error('Erreur mise à jour heures silencieuses:', error);
        throw error;
    }
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Vérifier si les notifications sont autorisées pour un événement et un canal
 */
export function isNotificationAllowed(
    preferences: NotificationPreferences,
    eventType: NotificationEventType,
    channel: NotificationChannel,
    currentTime?: Date
): boolean {
    // Vérification canal global
    if (!preferences.globalSettings[channel].enabled) {
        return false;
    }

    // Vérification événement spécifique
    if (!preferences.events[eventType][channel].enabled) {
        return false;
    }

    // Vérification heures silencieuses
    if (currentTime) {
        const channelSettings = preferences.globalSettings[channel];
        if (channelSettings.quietHours) {
            const current = currentTime.getHours() * 100 + currentTime.getMinutes();
            const start = parseInt(channelSettings.quietHours.start.replace(':', ''));
            const end = parseInt(channelSettings.quietHours.end.replace(':', ''));

            if (start > end) {
                // Heures silencieuses à cheval sur minuit (ex: 22:00 - 08:00)
                if (current >= start || current <= end) {
                    return false;
                }
            } else {
                // Heures silencieuses dans la même journée
                if (current >= start && current <= end) {
                    return false;
                }
            }
        }
    }

    return true;
}

/**
 * Obtenir les labels des événements en français
 */
export const getEventLabels = (): Record<NotificationEventType, { title: string; description: string }> => ({
    booking_confirmed: {
        title: 'Réservation confirmée',
        description: 'Quand votre réservation est confirmée par un accompagnateur'
    },
    booking_cancelled: {
        title: 'Réservation annulée',
        description: 'En cas d\'annulation de votre réservation'
    },
    mission_status_update: {
        title: 'Mise à jour de mission',
        description: 'Changements de statut pendant la mission (départ, arrivée, etc.)'
    },
    new_message: {
        title: 'Nouveaux messages',
        description: 'Messages reçus de votre accompagnateur'
    },
    payment_processed: {
        title: 'Paiement traité',
        description: 'Confirmation de vos paiements réussis'
    },
    payment_failed: {
        title: 'Échec de paiement',
        description: 'En cas de problème avec votre paiement'
    },
    reminder_mission: {
        title: 'Rappels de mission',
        description: 'Rappels avant le début de vos missions'
    },
    reminder_payment: {
        title: 'Rappels de paiement',
        description: 'Rappels pour les paiements en attente'
    },
    review_request: {
        title: 'Demande d\'avis',
        description: 'Invitation à évaluer votre mission terminée'
    },
    account_update: {
        title: 'Mise à jour du compte',
        description: 'Modifications importantes de votre compte'
    }
});

/**
 * Obtenir les labels des canaux
 */
export const getChannelLabels = (): Record<NotificationChannel, { title: string; icon: string; description: string }> => ({
    email: {
        title: 'Email',
        icon: '📧',
        description: 'Notifications par email'
    },
    sms: {
        title: 'SMS',
        icon: '💬',
        description: 'Notifications par SMS'
    },
    push: {
        title: 'Push',
        icon: '🔔',
        description: 'Notifications push dans l\'application'
    }
});