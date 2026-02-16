/**
 * Hook PWA pour l'application accompagnateur
 * Gestion de l'installation, mise à jour et fonctionnalités offline
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface PWAInstallEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAHookReturn {
    isInstallable: boolean;
    isInstalled: boolean;
    isOnline: boolean;
    isUpdateAvailable: boolean;
    installPWA: () => Promise<void>;
    updatePWA: () => void;
    showInstallPrompt: boolean;
    dismissInstallPrompt: () => void;
}

export function usePWA(): PWAHookReturn {
    const { isAccompanist } = useAuth();
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<PWAInstallEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est accompagnateur
        if (!isAccompanist) return;

        // État initial de la connexion
        setIsOnline(navigator.onLine);

        // Listeners pour l'état de connexion
        const handleOnline = () => {
            setIsOnline(true);
            console.log('📶 PWA: Connexion rétablie');
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('📵 PWA: Mode hors ligne activé');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Enregistrement du Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw-accompanist.js', { scope: '/dashboard/accompanist' })
                .then((registration) => {
                    console.log('✅ PWA: Service Worker enregistré');
                    setSwRegistration(registration);

                    // Vérifier les mises à jour
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setIsUpdateAvailable(true);
                                    console.log('🔄 PWA: Mise à jour disponible');
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('❌ PWA: Erreur enregistrement SW:', error);
                });
        }

        // Listener pour l'installation PWA
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const installEvent = e as PWAInstallEvent;
            setInstallPrompt(installEvent);
            setIsInstallable(true);

            // Afficher le prompt automatiquement apr ès quelques interactions
            setTimeout(() => {
                if (!isInstalled) {
                    setShowInstallPrompt(true);
                }
            }, 30000); // 30 secondes
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Détecter si l'app est déjà installée
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setShowInstallPrompt(false);
            console.log('📱 PWA: Application installée');
        });

        // Vérifier si on est en mode PWA
        const checkIfInstalled = () => {
            const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
            const isInWebAppMode = (window.navigator as any).standalone === true;
            setIsInstalled(isInStandaloneMode || isInWebAppMode);
        };

        checkIfInstalled();

        // Notifications push (si supportées)
        if ('Notification' in window && isAccompanist) {
            if (Notification.permission === 'default') {
                setTimeout(() => {
                    Notification.requestPermission().then((permission) => {
                        if (permission === 'granted') {
                            console.log('✅ PWA: Notifications autorisées');
                            // S'abonner aux notifications push
                            subscribeToNotifications();
                        }
                    });
                }, 5000); // Demander après 5 secondes
            } else if (Notification.permission === 'granted') {
                subscribeToNotifications();
            }
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isAccompanist]);

    const installPWA = async (): Promise<void> => {
        if (!installPrompt) return;

        try {
            await installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ PWA: Installation acceptée');
                setShowInstallPrompt(false);
            } else {
                console.log('❌ PWA: Installation refusée');
            }

            setInstallPrompt(null);
            setIsInstallable(false);
        } catch (error) {
            console.error('❌ PWA: Erreur installation:', error);
        }
    };

    const updatePWA = (): void => {
        if (swRegistration && swRegistration.waiting) {
            swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    };

    const dismissInstallPrompt = (): void => {
        setShowInstallPrompt(false);
        // Mémoriser le refus pour ne pas redemander avant 1 semaine
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    const subscribeToNotifications = async (): Promise<void> => {
        if (!swRegistration) return;

        try {
            const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });

            // Envoyer la subscription au serveur
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            console.log('✅ PWA: Abonné aux notifications push');
        } catch (error) {
            console.error('❌ PWA: Erreur abonnement notifications:', error);
        }
    };

    return {
        isInstallable,
        isInstalled,
        isOnline,
        isUpdateAvailable,
        installPWA,
        updatePWA,
        showInstallPrompt,
        dismissInstallPrompt
    };
}