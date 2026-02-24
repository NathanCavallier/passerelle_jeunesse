/**
 * Carte de suivi en temps réel pour les parents
 * Affiche la position de l'accompagnateur pendant une mission active
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { isGoogleMapsAvailable } from '@/lib/google-maps-service';
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Phone,
} from 'lucide-react';

interface LiveTrackingMapProps {
  bookingId: string;
  accompanistId: string;
  pickupAddress?: string;
  destinationAddress?: string;
  accompanistName?: string;
  accompanistPhone?: string;
  onCallAccompanist?: () => void;
}

interface AccompanistPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

const MISSION_STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  en_route_to_pickup: {
    label: 'En route vers le point de rendez-vous',
    color: 'bg-blue-500',
    icon: <Car className="h-4 w-4" />,
  },
  waiting_at_pickup: {
    label: 'Arrivé au point de rendez-vous',
    color: 'bg-amber-500',
    icon: <Clock className="h-4 w-4" />,
  },
  picked_up: {
    label: 'Jeune récupéré',
    color: 'bg-green-500',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  in_transit: {
    label: 'Trajet en cours',
    color: 'bg-indigo-500',
    icon: <Navigation className="h-4 w-4" />,
  },
  arrived: {
    label: 'Arrivée à destination',
    color: 'bg-emerald-500',
    icon: <MapPin className="h-4 w-4" />,
  },
  completed: {
    label: 'Mission terminée',
    color: 'bg-gray-500',
    icon: <CheckCircle className="h-4 w-4" />,
  },
};

export function LiveTrackingMap({
  bookingId,
  accompanistId,
  pickupAddress,
  destinationAddress,
  accompanistName = 'Accompagnateur',
  accompanistPhone,
  onCallAccompanist,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeRendererRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);

  const [position, setPosition] = useState<AccompanistPosition | null>(null);
  const [missionStatus, setMissionStatus] = useState<string>('');
  const [eta, setEta] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Écouter la position de l'accompagnateur en temps réel via Firestore
  useEffect(() => {
    if (!bookingId) return;

    const missionRef = doc(db, 'missions', bookingId);
    const unsubscribe = onSnapshot(
      missionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.currentPosition) {
            setPosition({
              latitude: data.currentPosition.latitude,
              longitude: data.currentPosition.longitude,
              accuracy: data.currentPosition.accuracy || 10,
              heading: data.currentPosition.heading,
              speed: data.currentPosition.speed,
              timestamp: data.currentPosition.timestamp?.toMillis?.() || Date.now(),
            });
          }
          if (data.status) {
            setMissionStatus(data.status);
          }
          if (data.estimatedArrival) {
            const arrivalTime = data.estimatedArrival.toDate
              ? data.estimatedArrival.toDate()
              : new Date(data.estimatedArrival);
            const now = new Date();
            const diffMin = Math.max(0, Math.round((arrivalTime.getTime() - now.getTime()) / 60000));
            setEta(diffMin > 0 ? `${diffMin} min` : 'Imminent');
          }
        }
      },
      (err) => {
        console.error('Erreur suivi mission:', err);
        setError('Impossible de charger le suivi en temps réel');
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

  // Charger Google Maps
  useEffect(() => {
    if (!isGoogleMapsAvailable() || typeof window === 'undefined') {
      return;
    }

    const loadMap = async () => {
      try {
        // Charger le script si nécessaire
        if (!window.google?.maps) {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
          await new Promise<void>((resolve, reject) => {
            if (window.google?.maps) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Échec chargement Google Maps'));
            document.head.appendChild(script);
          });
        }

        if (!mapRef.current || googleMapRef.current) return;

        // Centre initial — France (Metz)
        const center = { lat: 49.1193, lng: 6.1757 };

        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        setMapLoaded(true);
      } catch (err) {
        console.error('Erreur chargement carte:', err);
        setError('La carte est indisponible');
      }
    };

    loadMap();
  }, []);

  // Mettre à jour la position du marqueur accompagnateur
  useEffect(() => {
    if (!position || !googleMapRef.current || !mapLoaded) return;

    const pos = { lat: position.latitude, lng: position.longitude };

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: pos,
        map: googleMapRef.current,
        title: accompanistName,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          rotation: position.heading || 0,
        },
        zIndex: 10,
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 4px; font-family: sans-serif;">
            <strong>${accompanistName}</strong>
            <p style="margin: 2px 0; font-size: 12px; color: #666;">
              ${MISSION_STATUS_LABELS[missionStatus]?.label || 'En mission'}
            </p>
            ${eta ? `<p style="margin: 2px 0; font-size: 12px; color: #3b82f6;">ETA: ${eta}</p>` : ''}
          </div>
        `,
      });

      markerRef.current.addListener('click', () => {
        infoWindow.open(googleMapRef.current, markerRef.current);
      });
    } else {
      // Animation smooth du marqueur
      markerRef.current.setPosition(pos);
      if (position.heading !== undefined) {
        const icon = markerRef.current.getIcon();
        icon.rotation = position.heading;
        markerRef.current.setIcon(icon);
      }
    }

    // Centrer la carte
    googleMapRef.current.panTo(pos);
  }, [position, mapLoaded, accompanistName, missionStatus, eta]);

  // Marqueurs pickup et destination
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const geocoder = new window.google.maps.Geocoder();

    // Marqueur pickup
    if (pickupAddress && !pickupMarkerRef.current) {
      geocoder.geocode({ address: pickupAddress }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          pickupMarkerRef.current = new window.google.maps.Marker({
            position: results[0].geometry.location,
            map: googleMapRef.current,
            title: 'Point de rendez-vous',
            icon: {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="white" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
        }
      });
    }

    // Marqueur destination
    if (destinationAddress && !destMarkerRef.current) {
      geocoder.geocode({ address: destinationAddress }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          destMarkerRef.current = new window.google.maps.Marker({
            position: results[0].geometry.location,
            map: googleMapRef.current,
            title: 'Destination',
            icon: {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
        }
      });
    }
  }, [pickupAddress, destinationAddress, mapLoaded]);

  const statusInfo = MISSION_STATUS_LABELS[missionStatus];
  const lastUpdateAgo = position
    ? Math.round((Date.now() - position.timestamp) / 1000)
    : null;

  return (
    <Card className={isExpanded ? 'fixed inset-4 z-50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-5 w-5 text-primary" />
              Suivi en temps réel
            </CardTitle>
            <CardDescription>{accompanistName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {accompanistPhone && (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => {
                  if (onCallAccompanist) onCallAccompanist();
                  else window.open(`tel:${accompanistPhone}`);
                }}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Statut mission */}
        {statusInfo && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
            {eta && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                ETA: {eta}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        ) : !isGoogleMapsAvailable() ? (
          /* Fallback sans Google Maps — affichage texte */
          <div className="space-y-3 rounded-lg border p-4">
            {position ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                    Position : {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
                  </span>
                </div>
                {position.speed != null && position.speed > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{Math.round(position.speed * 3.6)} km/h</span>
                  </div>
                )}
                {lastUpdateAgo != null && (
                  <p className="text-xs text-muted-foreground">
                    Dernière mise à jour : il y a {lastUpdateAgo < 60 ? `${lastUpdateAgo}s` : `${Math.round(lastUpdateAgo / 60)}min`}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                En attente de la position...
              </div>
            )}
          </div>
        ) : (
          /* Carte Google Maps */
          <div className="space-y-2">
            <div
              ref={mapRef}
              className="w-full overflow-hidden rounded-lg border"
              style={{
                height: isExpanded ? 'calc(100vh - 240px)' : '280px',
              }}
            >
              {!mapLoaded && (
                <Skeleton className="h-full w-full" />
              )}
            </div>

            {/* Légende et infos */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Accompagnateur
              </span>
              {pickupAddress && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  RDV
                </span>
              )}
              {destinationAddress && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Destination
                </span>
              )}
              {position && position.speed != null && position.speed > 0 && (
                <span className="ml-auto flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {Math.round(position.speed * 3.6)} km/h
                </span>
              )}
              {lastUpdateAgo != null && (
                <span>
                  MAJ: {lastUpdateAgo < 60 ? `${lastUpdateAgo}s` : `${Math.round(lastUpdateAgo / 60)}min`}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
