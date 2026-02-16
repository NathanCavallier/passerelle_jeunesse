/**
 * Navigation GPS intégrée pour accompagnateurs
 * Intégration avec Google Maps, Apple Maps et Waze
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/hooks/use-location';
import { useToast } from '@/hooks/use-toast';
import { 
  Navigation, 
  MapPin, 
  Route,
  Clock,
  Car,
  Smartphone,
  ExternalLink,
  AlertCircle,
  Zap,
  Compass
} from 'lucide-react';

interface NavigationDestination {
  address: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  type: 'pickup' | 'destination' | 'return';
}

interface NavigationProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportsWaypoints: boolean;
}

interface GPSNavigationProps {
  destinations: NavigationDestination[];
  onNavigationStart?: (provider: string, destination: NavigationDestination) => void;
  onNavigationEnd?: () => void;
}

const navigationProviders: NavigationProvider[] = [
  {
    id: 'google-maps',
    name: 'Google Maps',
    icon: '🗺️',
    description: 'Navigation précise avec trafic temps réel',
    supportsWaypoints: true
  },
  {
    id: 'apple-maps',
    name: 'Apple Maps',
    icon: '🍎',
    description: 'Intégration native iOS',
    supportsWaypoints: false
  },
  {
    id: 'waze',
    name: 'Waze',
    icon: '🚗',
    description: 'Évitement trafic communautaire',
    supportsWaypoints: false
  },
  {
    id: 'here-maps',
    name: 'HERE Maps',
    icon: '📍',
    description: 'Navigation offline disponible',
    supportsWaypoints: true
  }
];

export function GPSNavigation({ 
  destinations, 
  onNavigationStart,
  onNavigationEnd 
}: GPSNavigationProps) {
  const { position, getCurrentPosition, isSupported } = useLocation();
  const { toast } = useToast();
  
  const [selectedProvider, setSelectedProvider] = useState<string>('google-maps');
  const [activeNavigation, setActiveNavigation] = useState<NavigationDestination | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance?: string;
    duration?: string;
    traffic?: 'light' | 'moderate' | 'heavy';
  } | null>(null);

  // Détecter le navigateur/OS pour suggérer le meilleur provider
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS - Apple Maps par défaut
      setSelectedProvider('apple-maps');
    } else if (userAgent.includes('android')) {
      // Android - Google Maps par défaut
      setSelectedProvider('google-maps');
    }
  }, []);

  // Générer l'URL de navigation selon le provider
  const generateNavigationURL = (
    provider: string, 
    destination: NavigationDestination,
    waypoints?: NavigationDestination[]
  ): string => {
    const destCoords = destination.latitude && destination.longitude
      ? `${destination.latitude},${destination.longitude}`
      : encodeURIComponent(destination.address);

    const originCoords = position 
      ? `${position.latitude},${position.longitude}`
      : '';

    switch (provider) {
      case 'google-maps':
        let googleURL = 'https://www.google.com/maps/dir/';
        
        if (originCoords) {
          googleURL += `${originCoords}/`;
        }
        
        // Ajouter les waypoints si supportés
        if (waypoints && waypoints.length > 0) {
          waypoints.forEach(waypoint => {
            const wpCoords = waypoint.latitude && waypoint.longitude
              ? `${waypoint.latitude},${waypoint.longitude}`
              : encodeURIComponent(waypoint.address);
            googleURL += `${wpCoords}/`;
          });
        }
        
        googleURL += `${destCoords}`;
        googleURL += '?mode=driving&navigate=yes';
        
        return googleURL;

      case 'apple-maps':
        let appleURL = 'https://maps.apple.com/?';
        
        if (originCoords) {
          appleURL += `saddr=${originCoords}&`;
        }
        
        appleURL += `daddr=${destCoords}&dirflg=d&t=m`;
        
        return appleURL;

      case 'waze':
        return `https://waze.com/ul?q=${encodeURIComponent(destination.address)}&navigate=yes`;

      case 'here-maps':
        let hereURL = 'https://wego.here.com/directions/drive/';
        
        if (originCoords) {
          hereURL += `mylocation/${destCoords}`;
        } else {
          hereURL += `,,/${destCoords}`;
        }
        
        return hereURL;

      default:
        return `https://www.google.com/maps/search/${encodeURIComponent(destination.address)}`;
    }
  };

  // Estimer les informations de route (simulation)
  const estimateRoute = async (destination: NavigationDestination) => {
    if (!position) return;

    // Simulation d'appel API (remplacer par vraie API Google/HERE)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calcul basique de distance (approximation)
    if (destination.latitude && destination.longitude) {
      const distance = calculateDistance(
        position.latitude, 
        position.longitude,
        destination.latitude, 
        destination.longitude
      );

      const estimatedDuration = Math.round(distance / 40 * 60); // 40 km/h moyenne urbaine
      
      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedDuration} min`,
        traffic: distance > 10 ? 'moderate' : 'light'
      });
    }
  };

  // Calcul distance entre deux points GPS
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Lancer la navigation
  const startNavigation = async (destination: NavigationDestination) => {
    // Obtenir position actuelle si pas déjà disponible
    if (!position && isSupported) {
      try {
        await getCurrentPosition();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur GPS",
          description: "Impossible d'obtenir votre position actuelle"
        });
        return;
      }
    }

    const url = generateNavigationURL(selectedProvider, destination);
    
    setActiveNavigation(destination);
    onNavigationStart?.(selectedProvider, destination);

    // Estimer la route
    await estimateRoute(destination);

    // Ouvrir l'app de navigation
    window.open(url, '_blank');

    toast({
      title: "Navigation démarrée",
      description: `Direction: ${destination.name || destination.address}`
    });
  };

  // Navigation multi-étapes
  const startMultiStepNavigation = async () => {
    if (destinations.length < 2) return;

    const sortedDestinations = [...destinations].sort((a, b) => {
      const order = { pickup: 1, destination: 2, return: 3 };
      return order[a.type] - order[b.type];
    });

    const firstStop = sortedDestinations[0];
    const waypoints = sortedDestinations.slice(1, -1);
    const finalDestination = sortedDestinations[sortedDestinations.length - 1];

    const url = generateNavigationURL(
      selectedProvider, 
      finalDestination, 
      waypoints
    );

    setActiveNavigation(firstStop);
    window.open(url, '_blank');

    toast({
      title: "Navigation multi-étapes",
      description: `${sortedDestinations.length} arrêts planifiés`
    });
  };

  // Arrêter la navigation
  const stopNavigation = () => {
    setActiveNavigation(null);
    setRouteInfo(null);
    onNavigationEnd?.();
    
    toast({
      title: "Navigation terminée",
      description: "Retour au suivi de mission"
    });
  };

  const getDestinationIcon = (type: NavigationDestination['type']) => {
    switch (type) {
      case 'pickup': return <MapPin className="h-4 w-4 text-green-600" />;
      case 'destination': return <Navigation className="h-4 w-4 text-blue-600" />;
      case 'return': return <Route className="h-4 w-4 text-orange-600" />;
    }
  };

  const getDestinationLabel = (type: NavigationDestination['type']) => {
    switch (type) {
      case 'pickup': return 'Départ';
      case 'destination': return 'Arrivée';
      case 'return': return 'Retour';
    }
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'light': return 'text-green-600';
      case 'moderate': return 'text-orange-600';
      case 'heavy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Navigation GPS non disponible sur cet appareil</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sélection du provider de navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Navigation GPS
          </CardTitle>
          <CardDescription>
            Choisissez votre application de navigation préférée
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Application de navigation
            </label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {navigationProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <span>{provider.icon}</span>
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-xs text-gray-500">{provider.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informations de route */}
          {routeInfo && (
            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium">{routeInfo.distance}</div>
                <div className="text-xs text-gray-500">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{routeInfo.duration}</div>
                <div className="text-xs text-gray-500">Durée</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium ${getTrafficColor(routeInfo.traffic || '')}`}>
                  {routeInfo.traffic === 'light' && '🟢'}
                  {routeInfo.traffic === 'moderate' && '🟡'}
                  {routeInfo.traffic === 'heavy' && '🔴'}
                </div>
                <div className="text-xs text-gray-500">Trafic</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des destinations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Destinations</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                activeNavigation?.address === destination.address 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getDestinationIcon(destination.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getDestinationLabel(destination.type)}
                      </Badge>
                      {destination.name && (
                        <span className="font-medium text-sm">{destination.name}</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate">
                      {destination.address}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => startNavigation(destination)}
                  size="sm"
                  variant={
                    activeNavigation?.address === destination.address 
                      ? "default" 
                      : "outline"
                  }
                  className="ml-3"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  {activeNavigation?.address === destination.address ? 'Actif' : 'Y aller'}
                </Button>
              </div>
            </div>
          ))}

          {/* Navigation multi-étapes */}
          {destinations.length > 1 && (
            <div className="pt-3 border-t">
              <Button
                onClick={startMultiStepNavigation}
                className="w-full"
                variant="default"
              >
                <Route className="h-4 w-4 mr-2" />
                Navigation complète ({destinations.length} étapes)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contrôles de navigation active */}
      {activeNavigation && (
        <Card className="border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-blue-600">
                Navigation en cours
              </CardTitle>
              <Badge variant="default" className="bg-blue-600">
                <Zap className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              {getDestinationIcon(activeNavigation.type)}
              <div>
                <div className="font-medium">{activeNavigation.name || 'Destination'}</div>
                <div className="text-sm text-gray-600">{activeNavigation.address}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={stopNavigation}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Arrêter navigation
              </Button>
              
              <Button
                onClick={() => startNavigation(activeNavigation)}
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Rouvrir GPS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conseils de navigation */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Conseils</span>
            </div>
            
            <ul className="text-xs text-gray-600 space-y-1 ml-6">
              <li>• Vérifiez votre niveau de batterie avant le départ</li>
              <li>• Gardez un chargeur de téléphone dans le véhicule</li>
              <li>• Informez les parents en cas de changement d'itinéraire</li>
              <li>• Respectez le code de la route et les limitations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}