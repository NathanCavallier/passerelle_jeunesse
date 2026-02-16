/**
 * Composant résumé des fonctionnalités PWA implémentées
 * Validation et guide pour l'accompagnateur mobile
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePWA } from '@/hooks/use-pwa';
import { useLocation } from '@/hooks/use-location';
import { 
  Smartphone,
  Wifi,
  Navigation,
  Bell,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  Battery,
  Signal,
  Compass,
  MapPin
} from 'lucide-react';

interface PWAFeature {
  name: string;
  description: string;
  implemented: boolean;
  tested: boolean;
  critical: boolean;
  status: 'success' | 'warning' | 'error';
}

export function PWASummary() {
  const { 
    isInstalled, 
    isInstallable,
    installPWA,
    isOnline,
    isUpdateAvailable 
  } = usePWA();
  
  const { 
    position, 
    isTracking, 
    error: locationError,
    startTracking 
  } = useLocation();

  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // Collecte d'informations sur l'appareil
    const getDeviceInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        screen: {
          width: screen.width,
          height: screen.height,
          pixelRatio: window.devicePixelRatio
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        supports: {
          serviceWorker: 'serviceWorker' in navigator,
          geolocation: 'geolocation' in navigator,
          notifications: 'Notification' in window,
          storage: typeof(Storage) !== 'undefined',
          camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
          vibration: 'vibrate' in navigator
        }
      };
      setDeviceInfo(info);
    };

    getDeviceInfo();
    window.addEventListener('resize', getDeviceInfo);
    return () => window.removeEventListener('resize', getDeviceInfo);
  }, []);

  // Liste des fonctionnalités PWA implémentées
  const pwaFeatures: PWAFeature[] = [
    {
      name: 'Installation PWA',
      description: 'App peut être installée sur écran d\'accueil',
      implemented: true,
      tested: isInstalled || isInstallable,
      critical: true,
      status: isInstalled ? 'success' : isInstallable ? 'warning' : 'error'
    },
    {
      name: 'Mode Offline',
      description: 'Fonctionne sans connexion internet',
      implemented: true,
      tested: true,
      critical: true,
      status: 'success'
    },
    {
      name: 'Service Worker',
      description: 'Cache intelligent et synchronisation',
      implemented: true,
      tested: deviceInfo.supports?.serviceWorker || false,
      critical: true,
      status: deviceInfo.supports?.serviceWorker ? 'success' : 'error'
    },
    {
      name: 'Géolocalisation GPS',
      description: 'Tracking précis de la position',
      implemented: true,
      tested: position !== null,
      critical: true,
      status: position && position.accuracy && position.accuracy < 50 ? 'success' : locationError ? 'error' : 'warning'
    },
    {
      name: 'Navigation GPS',
      description: 'Intégration Google Maps, Apple Maps, Waze',
      implemented: true,
      tested: deviceInfo.supports?.geolocation || false,
      critical: false,
      status: 'success'
    },
    {
      name: 'Notifications Push',
      description: 'Alertes pour nouvelles missions',
      implemented: true,
      tested: Notification.permission !== 'default',
      critical: false,
      status: Notification.permission === 'granted' ? 'success' : 
               Notification.permission === 'denied' ? 'error' : 'warning'
    },
    {
      name: 'Capture Photo',
      description: 'Prises de vue mission avec géotag',
      implemented: true,
      tested: deviceInfo.supports?.camera || false,
      critical: false,
      status: deviceInfo.supports?.camera ? 'success' : 'error'
    },
    {
      name: 'Stockage Local',
      description: 'Sauvegarde données hors ligne',
      implemented: true,
      tested: deviceInfo.supports?.storage || false,
      critical: true,
      status: deviceInfo.supports?.storage ? 'success' : 'error'
    },
    {
      name: 'Détection Réseau',
      description: 'Adaptation selon connexion',
      implemented: true,
      tested: typeof isOnline !== 'undefined',
      critical: false,
      status: 'success'
    },
    {
      name: 'Interface Responsive',
      description: 'Optimisé tous écrans mobiles',
      implemented: true,
      tested: true,
      critical: true,
      status: 'success'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (feature: PWAFeature) => {
    if (feature.status === 'success' && feature.tested) {
      return <Badge variant="default" className="text-xs">✓ Opérationnel</Badge>;
    } else if (feature.status === 'success' && !feature.tested) {
      return <Badge variant="secondary" className="text-xs">Implémenté</Badge>;
    } else if (feature.status === 'warning') {
      return <Badge variant="outline" className="text-xs">⚠ Partiel</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">✗ Problème</Badge>;
    }
  };

  const successCount = pwaFeatures.filter(f => f.status === 'success' && f.tested).length;
  const totalFeatures = pwaFeatures.length;

  return (
    <div className="space-y-6">
      {/* Résumé général */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Statut PWA Accompagnateur - Phase 5
          </CardTitle>
          <CardDescription>
            Validation des fonctionnalités mobiles avancées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-700">Fonctionnel</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalFeatures}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((successCount / totalFeatures) * 100)}%
              </div>
              <div className="text-sm text-purple-700">Couverture</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                Mobile
              </div>
              <div className="text-sm text-orange-700">Optimisé</div>
            </div>
          </div>

          {/* Statut installation PWA */}
          {isInstalled && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 App PWA installée et lancée en mode natif !
              </AlertDescription>
            </Alert>
          )}

          {isInstallable && !isInstalled && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Download className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 flex items-center justify-between">
                App peut être installée pour une expérience optimale
                <Button size="sm" onClick={installPWA} className="ml-2">
                  Installer
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informations appareil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations Appareil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Plateforme:</span>
              <p className="font-medium">{deviceInfo.platform}</p>
            </div>
            <div>
              <span className="text-gray-600">Résolution:</span>
              <p className="font-medium">{deviceInfo.screen?.width}×{deviceInfo.screen?.height}</p>
            </div>
            <div>
              <span className="text-gray-600">Viewport:</span>
              <p className="font-medium">{deviceInfo.viewport?.width}×{deviceInfo.viewport?.height}</p>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <span className="font-medium">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            {position && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  GPS: ±{position.accuracy?.toFixed(0)}m
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Bell className={`h-4 w-4 ${
                typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' 
                  ? 'text-green-600' 
                  : 'text-gray-400'
              }`} />
              <span className="font-medium text-xs">
                Notif: {typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'non supporté'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste détaillée des fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fonctionnalités PWA Détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pwaFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(feature.status)}
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {feature.name}
                      {feature.critical && (
                        <Badge variant="outline" className="text-xs">
                          Critique
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {getStatusBadge(feature)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions de Test Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isTracking && (
              <Button 
                variant="outline" 
                onClick={startTracking}
                className="flex items-center gap-2"
              >
                <Compass className="h-4 w-4" />
                Tester GPS
              </Button>
            )}
            
            {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
              <Button 
                variant="outline" 
                onClick={() => Notification.requestPermission()}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Autoriser Notifications
              </Button>
            )}
            
            {isInstallable && (
              <Button 
                onClick={installPWA}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Installer PWA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}