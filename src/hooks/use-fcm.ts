/**
 * Hook React pour gérer les notifications push FCM
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
    initializeFCM,
    getFCMToken,
    setupForegroundMessaging,
    showLocalNotification,
    isPushNotificationEnabled,
    getNotificationPermissionStatus,
    requestNotificationPermission,
    removeFCMToken
} from '@/lib/fcm-service';
import { getUserNotificationPreferences } from '@/lib/notifications-service';
import type { NotificationPayload } from '@/types/firestore';

export interface UseFCMResult {
    // État
    isSupported: boolean;
    isEnabled: boolean;
    isInitialized: boolean;
    permissionStatus: NotificationPermission;
    token: string | null;
    unreadCount: number;

    // Actions
    enableNotifications: () => Promise<boolean>;
    disableNotifications: () => Promise<void>;
    refreshToken: () => Promise<void>;
    clearBadge: () => void;

    // Événements
    onNotificationReceived: (callback: (payload: NotificationPayload) => void) => void;
}

/**
 * Hook pour gérer les notifications push FCM
 */
export const useFCM = (): UseFCMResult => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [isSupported] = useState(() => {
        return typeof window !== 'undefined' &&
            'Notification' in window &&
            'serviceWorker' in navigator;
    });

    const [isInitialized, setIsInitialized] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationCallback, setNotificationCallback] = useState<
        ((payload: NotificationPayload) => void) | null
    >(null);

    // État dérivé
    const isEnabled = permissionStatus === 'granted' && !!token;

    /**
     * Initialise FCM au montage du composant
     */
    useEffect(() => {
        const initFCM = async () => {
            if (!isSupported || !user) return;

            try {
                await initializeFCM();
                setPermissionStatus(getNotificationPermissionStatus());
                setIsInitialized(true);

                // Récupérer le token si permissions accordées
                if (isPushNotificationEnabled()) {
                    const currentToken = await getFCMToken(user.uid);
                    setToken(currentToken);
                }
            } catch (error) {
                console.error('Erreur initialisation FCM:', error);
            }
        };

        initFCM();
    }, [isSupported, user]);

    /**
     * Configure l'écoute des messages FCM
     */
    useEffect(() => {
        if (!isInitialized || !isEnabled) return;

        const handleNotification = (payload: NotificationPayload) => {
            console.log('📱 Notification reçue:', payload);

            // Incrémenter le compteur de notifications non lues
            setUnreadCount(prev => prev + 1);

            // Afficher notification locale si page pas en focus
            if (document.hidden) {
                showLocalNotification(payload);
            }

            // Appeler le callback personnalisé
            if (notificationCallback) {
                notificationCallback(payload);
            }

            // Toast notification si page visible
            if (!document.hidden) {
                toast({
                    title: payload.title,
                    description: payload.body,
                    variant: 'default',
                });
            }
        };

        const unsubscribe = setupForegroundMessaging(handleNotification);

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [isInitialized, isEnabled, notificationCallback, toast]);

    /**
     * Active les notifications push
     */
    const enableNotifications = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !user) return false;

        try {
            // Vérifier les préférences utilisateur
            const preferences = await getUserNotificationPreferences(user.uid);
            if (!preferences?.channels?.push?.enabled) {
                toast({
                    variant: 'destructive',
                    title: 'Notifications désactivées',
                    description: 'Veuillez activer les notifications push dans vos préférences.',
                });
                return false;
            }

            // Demander permission
            const hasPermission = await requestNotificationPermission();
            if (!hasPermission) {
                toast({
                    variant: 'destructive',
                    title: 'Permission refusée',
                    description: 'Les notifications push ont été refusées par le navigateur.',
                });
                return false;
            }

            // Obtenir et sauvegarder le token
            const newToken = await getFCMToken(user.uid);
            setToken(newToken);
            setPermissionStatus('granted');

            if (newToken) {
                toast({
                    title: 'Notifications activées',
                    description: 'Vous recevrez maintenant les notifications push.',
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur activation notifications:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible d\'activer les notifications push.',
            });
            return false;
        }
    }, [isSupported, user, toast]);

    /**
     * Désactive les notifications push
     */
    const disableNotifications = useCallback(async (): Promise<void> => {
        if (!user || !token) return;

        try {
            await removeFCMToken(user.uid, token);
            setToken(null);

            toast({
                title: 'Notifications désactivées',
                description: 'Vous ne recevrez plus de notifications push sur cet appareil.',
            });
        } catch (error) {
            console.error('Erreur désactivation notifications:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de désactiver les notifications.',
            });
        }
    }, [user, token, toast]);

    /**
     * Rafraîchit le token FCM
     */
    const refreshToken = useCallback(async (): Promise<void> => {
        if (!isSupported || !user) return;

        try {
            const newToken = await getFCMToken(user.uid);
            setToken(newToken);

            if (newToken) {
                console.log('✅ Token FCM rafraîchi');
            }
        } catch (error) {
            console.error('Erreur rafraîchissement token:', error);
        }
    }, [isSupported, user]);

    /**
     * Efface le badge de notifications
     */
    const clearBadge = useCallback((): void => {
        setUnreadCount(0);

        // Effacer le badge système si supporté
        if ('setAppBadge' in navigator) {
            (navigator as any).setAppBadge(0);
        }
    }, []);

    /**
     * Définit le callback pour les notifications reçues
     */
    const onNotificationReceived = useCallback(
        (callback: (payload: NotificationPayload) => void) => {
            setNotificationCallback(() => callback);
        },
        []
    );

    /**
     * Met à jour le badge système
     */
    useEffect(() => {
        if ('setAppBadge' in navigator && unreadCount > 0) {
            (navigator as any).setAppBadge(unreadCount);
        }
    }, [unreadCount]);

    return {
        // État
        isSupported,
        isEnabled,
        isInitialized,
        permissionStatus,
        token,
        unreadCount,

        // Actions
        enableNotifications,
        disableNotifications,
        refreshToken,
        clearBadge,

        // Événements
        onNotificationReceived,
    };
};