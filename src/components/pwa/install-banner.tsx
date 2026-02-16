/**
 * Composant PWA Install Banner pour l'espace accompagnateur
 * Affiche un banner d'installation de l'application mobile
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';
import { 
  Download, 
  X, 
  Smartphone, 
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';

export function PWAInstallBanner() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline,
    isUpdateAvailable,
    installPWA, 
    updatePWA,
    showInstallPrompt, 
    dismissInstallPrompt 
  } = usePWA();

  // État offline notification
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isOnline) {
      timer = setTimeout(() => {
        setShowOfflineNotification(true);
      }, 2000); // Afficher après 2 secondes hors ligne
    } else {
      setShowOfflineNotification(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline]);

  // Banner de mise à jour disponible
  if (isUpdateAvailable) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-blue-500 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm">Mise à jour disponible</h3>
                <p className="text-xs text-gray-600">
                  Une nouvelle version est disponible
                </p>
              </div>
            </div>
            <Button
              onClick={updatePWA}
              size="sm"
              className="ml-4"
            >
              Mettre à jour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner d'installation PWA
  if (showInstallPrompt && isInstallable && !isInstalled) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-green-500 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-sm">Installation mobile</h3>
                <p className="text-xs text-gray-600">
                  Installez l'app pour un accès rapide
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={installPWA}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Installer
              </Button>
              <Button
                onClick={dismissInstallPrompt}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Notification hors ligne
  if (showOfflineNotification && !isOnline) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 border-orange-500 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-sm">Mode hors ligne</h3>
                <p className="text-xs text-gray-600">
                  Vos données seront synchronisées à la reconnexion
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowOfflineNotification(false)}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Notification reconnexion
  if (isOnline && showOfflineNotification === false && !navigator.onLine) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 border-green-500 shadow-lg animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Wifi className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-sm">Connexion rétablie</h3>
              <p className="text-xs text-gray-600">
                Synchronisation en cours...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Composant pour afficher l'état PWA dans le header
export function PWAStatusIndicator() {
  const { isInstalled, isOnline } = usePWA();

  if (!isInstalled) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          <span className="hidden sm:inline">En ligne</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-orange-600">
          <WifiOff className="h-3 w-3" />
          <span className="hidden sm:inline">Hors ligne</span>
        </div>
      )}
      
      <div className="w-1 h-1 bg-gray-300 rounded-full" />
      
      <div className="flex items-center gap-1 text-blue-600">
        <Smartphone className="h-3 w-3" />
        <span className="hidden sm:inline">PWA</span>
      </div>
    </div>
  );
}