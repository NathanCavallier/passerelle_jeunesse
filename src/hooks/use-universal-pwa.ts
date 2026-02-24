/**
 * Hook PWA universel — Parents + Accompagnateurs
 * Installation, mise à jour, offline, sync, notifications
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  syncAllPending,
  getPendingActions,
  getStorageEstimate,
  cacheBookings,
  cacheProfile,
  type PendingAction,
} from '@/lib/offline-storage';

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  // Installation
  isInstallable: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
  installPWA: () => Promise<void>;
  dismissInstallPrompt: () => void;
  // Connectivité
  isOnline: boolean;
  connectionType: string | null;
  // Mise à jour
  isUpdateAvailable: boolean;
  updatePWA: () => void;
  // Sync offline
  pendingActionsCount: number;
  isSyncing: boolean;
  lastSyncResult: { synced: number; failed: number; remaining: number } | null;
  syncNow: () => Promise<void>;
  // Storage
  storageUsage: string;
  // Notifications
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<void>;
}

export function useUniversalPWA(): PWAState {
  const { user, isParent, isAccompanist } = useAuth();
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<PWAState['lastSyncResult']>(null);
  const [storageUsage, setStorageUsage] = useState('0 B');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');

  const installPromptRef = useRef<PWAInstallEvent | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Déterminer le bon service worker en fonction du rôle
  const swPath = isAccompanist ? '/sw-accompanist.js' : '/sw-parent.js';
  const swScope = isAccompanist ? '/dashboard/accompanist' : '/';

  // --- Enregistrement SW et détection état ---
  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;

    // État connexion
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync au retour en ligne
      syncNowInternal();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Type de connexion (Network Information API)
    const nav = navigator as any;
    if (nav.connection) {
      setConnectionType(nav.connection.effectiveType || null);
      nav.connection.addEventListener('change', () => {
        setConnectionType(nav.connection.effectiveType || null);
      });
    }

    // Enregistrement SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(swPath, { scope: swScope })
        .then((registration) => {
          swRegistrationRef.current = registration;

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ PWA: Erreur SW:', error);
        });
    }

    // Detection install
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e as PWAInstallEvent;
      setIsInstallable(true);

      // Auto-show après 45s si pas déjà dismissé
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return; // 7 jours
      }
      setTimeout(() => {
        if (!isInstalled) setShowInstallPrompt(true);
      }, 45000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check si déjà installé
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Notifications
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Storage
    getStorageEstimate().then((e) => setStorageUsage(e.usageFormatted));

    // Pending actions count
    getPendingActions().then((actions) => setPendingActionsCount(actions.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [user, isAccompanist]);

  // --- Installation ---
  const installPWA = useCallback(async () => {
    if (!installPromptRef.current) return;
    try {
      await installPromptRef.current.prompt();
      const { outcome } = await installPromptRef.current.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      installPromptRef.current = null;
      setIsInstallable(false);
    } catch (error) {
      console.error('❌ PWA install error:', error);
    }
  }, []);

  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // --- Mise à jour ---
  const updatePWA = useCallback(() => {
    const reg = swRegistrationRef.current;
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, []);

  // --- Sync ---
  const syncNowInternal = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const result = await syncAllPending();
      setLastSyncResult(result);
      setPendingActionsCount(result.remaining);
      // Mettre à jour le storage
      const estimate = await getStorageEstimate();
      setStorageUsage(estimate.usageFormatted);
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncNow = useCallback(syncNowInternal, []);

  // --- Notifications ---
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted' && swRegistrationRef.current) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (vapidKey) {
          const subscription = await swRegistrationRef.current.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey,
          });
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          });
        }
      }
    } catch (error) {
      console.error('❌ Notification permission error:', error);
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    installPWA,
    dismissInstallPrompt,
    isOnline,
    connectionType,
    isUpdateAvailable,
    updatePWA,
    pendingActionsCount,
    isSyncing,
    lastSyncResult,
    syncNow,
    storageUsage,
    notificationPermission,
    requestNotificationPermission,
  };
}
