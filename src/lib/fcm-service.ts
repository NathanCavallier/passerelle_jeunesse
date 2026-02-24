/**
 * Service Firebase Cloud Messaging (FCM)
 * Gestion des notifications push côté client
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getMessaging,
    getToken,
    onMessage,
    Messaging,
    MessagePayload,
    isSupported
} from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { NotificationPayload } from '@/types/firestore';

// Configuration FCM
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Clé VAPID pour notifications push (à générer dans Firebase Console)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let messaging: Messaging | null = null;

/**
 * Initialise Firebase Cloud Messaging
 */
export const initializeFCM = async (): Promise<Messaging | null> => {
    if (typeof window === 'undefined') {
        console.log('FCM: Environnement serveur détecté - FCM ignoré');
        return null;
    }

    try {
        // Vérifier si FCM est supporté
        const supported = await isSupported();
        if (!supported) {
            console.log('FCM: Non supporté dans ce navigateur');
            return null;
        }

        // Initialiser Firebase si pas déjà fait
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

        // Initialiser messaging
        messaging = getMessaging(app);
        console.log('✅ FCM initialisé avec succès');

        return messaging;
    } catch (error) {
        console.error('❌ Erreur initialisation FCM:', error);
        return null;
    }
};

/**
 * Demande permission pour les notifications push
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('FCM: Notifications non supportées');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('✅ Permission notifications accordée');
            return true;
        } else {
            console.log('❌ Permission notifications refusée:', permission);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur demande permission:', error);
        return false;
    }
};

/**
 * Obtient le token FCM pour cet appareil
 */
export const getFCMToken = async (userId?: string): Promise<string | null> => {
    try {
        if (!messaging) {
            messaging = await initializeFCM();
            if (!messaging) return null;
        }

        if (!VAPID_KEY) {
            console.error('❌ VAPID_KEY manquante');
            return null;
        }

        // Demander permission si pas encore accordée
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return null;

        // Obtenir le token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY
        });

        if (token) {
            console.log('✅ Token FCM obtenu:', token.substring(0, 20) + '...');

            // Enregistrer le token dans Firestore si userId fourni
            if (userId) {
                await saveFCMToken(userId, token);
            }

            return token;
        } else {
            console.log('❌ Impossible d\'obtenir le token FCM');
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur obtention token FCM:', error);
        return null;
    }
};

/**
 * Sauvegarde le token FCM dans Firestore
 */
export const saveFCMToken = async (userId: string, token: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const deviceInfo = {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            platform: navigator.platform || 'unknown'
        };

        await updateDoc(userRef, {
            'fcmTokens': {
                [token]: deviceInfo
            },
            'lastTokenUpdate': new Date()
        });

        console.log('✅ Token FCM sauvegardé pour:', userId);
    } catch (error) {
        console.error('❌ Erreur sauvegarde token FCM:', error);
        throw error;
    }
};

/**
 * Supprime un token FCM de Firestore
 */
export const removeFCMToken = async (userId: string, token: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            [`fcmTokens.${token}`]: null // Firestore supprime les champs null
        });

        console.log('✅ Token FCM supprimé pour:', userId);
    } catch (error) {
        console.error('❌ Erreur suppression token FCM:', error);
        throw error;
    }
};

/**
 * Configure l'écoute des messages FCM en foreground
 */
export const setupForegroundMessaging = (
    onNotificationReceived: (payload: NotificationPayload) => void
): (() => void) | null => {
    if (!messaging) {
        console.log('FCM: Messaging non initialisé');
        return null;
    }

    try {
        // Écouter les messages en foreground
        const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
            console.log('📱 Notification FCM reçue (foreground):', payload);

            const notificationPayload: NotificationPayload = {
                title: payload.notification?.title || 'Nouvelle notification',
                body: payload.notification?.body || '',
                icon: payload.notification?.icon || '/images/notification-icon.png',
                data: payload.data || {},
                timestamp: new Date().toISOString()
            };

            onNotificationReceived(notificationPayload);
        });

        console.log('✅ Écoute FCM foreground activée');
        return unsubscribe;
    } catch (error) {
        console.error('❌ Erreur setup foreground messaging:', error);
        return null;
    }
};

/**
 * Affiche une notification locale
 */
export const showLocalNotification = (payload: NotificationPayload): void => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        const notification = new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon,
            badge: '/images/badge-icon.png',
            tag: payload.data?.type || 'general',
            requireInteraction: false,
            silent: false
        });

        // Auto-fermer après 5 secondes
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Gérer les clics
        notification.onclick = (event) => {
            event.preventDefault();
            window.focus();

            // Navigation basée sur le type
            if (payload.data?.url) {
                window.location.href = payload.data.url;
            }

            notification.close();
        };

        console.log('✅ Notification locale affichée:', payload.title);
    }
};

/**
 * Vérifie si les notifications push sont activées
 */
export const isPushNotificationEnabled = (): boolean => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }

    return Notification.permission === 'granted';
};

/**
 * Obtient le statut des permissions de notification
 */
export const getNotificationPermissionStatus = (): NotificationPermission => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'denied';
    }

    return Notification.permission;
};

/**
 * Types d'événements pour les notifications
 */
export const FCM_NOTIFICATION_TYPES = {
    BOOKING_CONFIRMED: 'booking_confirmed',
    BOOKING_STARTED: 'booking_started',
    BOOKING_COMPLETED: 'booking_completed',
    BOOKING_CANCELLED: 'booking_cancelled',
    MESSAGE_RECEIVED: 'message_received',
    PAYMENT_PROCESSED: 'payment_processed',
    REMINDER: 'reminder',
    SYSTEM: 'system'
} as const;

export type FCMNotificationType = typeof FCM_NOTIFICATION_TYPES[keyof typeof FCM_NOTIFICATION_TYPES];