/**
 * Composant de géolocalisation pour les missions
 * Affiche et gère le tracking GPS en temps réel
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/hooks/use-location';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Crosshair,
  Settings
} from 'lucide-react';

interface LocationTrackerProps {
  bookingId: string;
  missionStatus?: string;
  onLocationUpdate?: (position: { lat: number; lng: number }) => void;
}

export function LocationTracker({ 
  bookingId, 
  missionStatus,
  onLocationUpdate 
}: LocationTrackerProps) {
  const { toast } = useToast();
  const {
    position,
    error,
    isLoading,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentPosition,
    isSupported,
    permissionStatus
  } = useLocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000,
    trackMovement: true,
    distanceFilter: 5 // 5 mètres minimum
  });

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Démarrer le tracking automatiquement si la mission est en cours
  useEffect(() => {
    const activeMissionStatuses = ['en_route_to_pickup', 'waiting_at_pickup', 'picked_up', 'in_transit'];
    
    if (activeMissionStatuses.includes(missionStatus || '') && !isTracking && isSupported) {
      if (permissionStatus === 'granted') {
        startTracking();
        setIsSharing(true);
      }
    } else if (!activeMissionStatuses.includes(missionStatus || '') && isTracking) {
      stopTracking();
      setIsSharing(false);
    }
  }, [missionStatus, permissionStatus, isSupported, isTracking, startTracking, stopTracking]);

  // Callback de notification des updates de position
  useEffect(() => {
    if (position && onLocationUpdate) {
      onLocationUpdate({
        lat: position.latitude,
        lng: position.longitude
      });
      setLastUpdate(new Date());
    }
  }, [position, onLocationUpdate]);

  // Gestion des erreurs de géolocalisation
  useEffect(() => {
    if (error) {
      let errorMessage = 'Erreur de géolocalisation';
      
      switch (error.code) {
        case 1:
          errorMessage = 'Accès à la géolocalisation refusé. Veuillez autoriser l\'accès dans les paramètres.';
          break;
        case 2:
          errorMessage = 'Position indisponible. Vérifiez votre connexion GPS.';
          break;
        case 3:
          errorMessage = 'Délai d\'attente dépassé. Réessayez.';
          break;
      }

      toast({
        variant: "destructive",
        title: "Erreur GPS",
        description: errorMessage
      });
    }
  }, [error, toast]);

  // Obtenir la position actuelle manuellement
  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentPosition();
      toast({
        title: "Position obtenue",
        description: "Votre position a été mise à jour."
      });
    } catch (error) {
      console.error('Erreur position:', error);
    }
  };

  // Toggle du suivi
  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
      setIsSharing(false);
      toast({
        title: "Suivi arrêté",
        description: "Le partage de votre position a été désactivé."
      });
    } else {
      startTracking();
      setIsSharing(true);
      toast({
        title: "Suivi activé",
        description: "Votre position est maintenant partagée."
      });
    }
  };

  // Affichage si géolocalisation non supportée
  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Géolocalisation non disponible sur cet appareil</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Affichage si permission refusée
  if (permissionStatus === 'denied') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Accès GPS refusé</span>
            </div>
            <p className="text-xs text-gray-600">
              Pour partager votre position, veuillez autoriser l'accès à la géolocalisation dans les paramètres de votre navigateur.
            </p>
            <Button 
              onClick={handleGetCurrentLocation}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Réessayer l'autorisation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Position GPS
          </CardTitle>
          
          {isTracking && (
            <Badge variant="default" className="bg-green-600">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              En direct
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations de position */}
        {position && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <p className="font-mono">{position.latitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <p className="font-mono">{position.longitude.toFixed(6)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Précision:</span>
                <p>{Math.round(position.accuracy)} m</p>
              </div>
              {position.speed && (
                <div>
                  <span className="text-gray-600">Vitesse:</span>
                  <p>{Math.round(position.speed * 3.6)} km/h</p>
                </div>
              )}
            </div>

            {lastUpdate && (
              <div className="text-xs text-gray-500">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Recherche de position...</span>
          </div>
        )}

        {/* Contrôles */}
        <div className="flex gap-2">
          <Button
            onClick={handleToggleTracking}
            variant={isTracking ? "destructive" : "default"}
            size="sm"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isTracking ? (
              <Navigation className="h-4 w-4 mr-2" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            {isTracking ? 'Arrêter le suivi' : 'Démarrer le suivi'}
          </Button>

          <Button
            onClick={handleGetCurrentLocation}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>

        {/* Message d'aide */}
        <div className="text-xs text-gray-500 space-y-1">
          {isSharing ? (
            <p className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Votre position est partagée avec les parents
            </p>
          ) : (
            <p>Le suivi GPS permet aux parents de suivre l'avancement de la mission</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}