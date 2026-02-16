/**
 * Hook pour la géolocalisation temps réel
 * Compatible PWA avec gestion offline et cache des positions
 */

'use client';

import { useState, useEffect, useRef } from 'react';

export interface LocationPosition {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    heading?: number;
    speed?: number;
}

export interface LocationError {
    code: number;
    message: string;
}

export interface UseLocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    trackMovement?: boolean;
    distanceFilter?: number; // Mètres minimum entre les updates
}

export interface UseLocationReturn {
    position: LocationPosition | null;
    error: LocationError | null;
    isLoading: boolean;
    isTracking: boolean;
    startTracking: () => void;
    stopTracking: () => void;
    getCurrentPosition: () => Promise<LocationPosition>;
    isSupported: boolean;
    permissionStatus: PermissionState | 'unknown';
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 60000,
        trackMovement = false,
        distanceFilter = 10
    } = options;

    const [position, setPosition] = useState<LocationPosition | null>(null);
    const [error, setError] = useState<LocationError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');

    const watchId = useRef<number | null>(null);
    const lastPosition = useRef<LocationPosition | null>(null);

    // Vérifier le support de la géolocalisation (côté client uniquement)
    const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    // Géolocalisation options
    const geoOptions: PositionOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge
    };

    // Vérifier les permissions au chargement
    useEffect(() => {
        if (!isSupported) return;

        // Vérifier les permissions si supportées
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setPermissionStatus(result.state);

                result.addEventListener('change', () => {
                    setPermissionStatus(result.state);
                });
            }).catch(() => {
                setPermissionStatus('unknown');
            });
        }
    }, [isSupported]);

    // Calculer la distance entre deux positions
    const calculateDistance = (pos1: LocationPosition, pos2: LocationPosition): number => {
        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = (pos1.latitude * Math.PI) / 180;
        const φ2 = (pos2.latitude * Math.PI) / 180;
        const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
        const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Convertir une position native en LocationPosition
    const convertPosition = (nativePosition: GeolocationPosition): LocationPosition => {
        return {
            latitude: nativePosition.coords.latitude,
            longitude: nativePosition.coords.longitude,
            accuracy: nativePosition.coords.accuracy,
            timestamp: nativePosition.timestamp,
            heading: nativePosition.coords.heading || undefined,
            speed: nativePosition.coords.speed || undefined
        };
    };

    // Callback de succès
    const onSuccess = (nativePosition: GeolocationPosition) => {
        const newPosition = convertPosition(nativePosition);

        // Appliquer le filtre de distance si nécessaire
        if (lastPosition.current && distanceFilter > 0) {
            const distance = calculateDistance(lastPosition.current, newPosition);
            if (distance < distanceFilter) {
                return; // Ignorer cette position, trop proche de la précédente
            }
        }

        setPosition(newPosition);
        setError(null);
        setIsLoading(false);
        lastPosition.current = newPosition;

        // Sauvegarder en localStorage pour persistence offline
        if (trackMovement) {
            try {
                const savedPositions = JSON.parse(localStorage.getItem('accompanist-positions') || '[]');
                savedPositions.push(newPosition);

                // Garder seulement les 100 dernières positions
                if (savedPositions.length > 100) {
                    savedPositions.splice(0, savedPositions.length - 100);
                }

                localStorage.setItem('accompanist-positions', JSON.stringify(savedPositions));
            } catch (error) {
                console.warn('Impossible de sauvegarder la position:', error);
            }
        }
    };

    // Callback d'erreur
    const onError = (nativeError: GeolocationPositionError) => {
        const locationError: LocationError = {
            code: nativeError.code,
            message: getErrorMessage(nativeError.code)
        };

        setError(locationError);
        setIsLoading(false);

        console.error('Erreur géolocalisation:', locationError);
    };

    // Messages d'erreur localisés
    const getErrorMessage = (code: number): string => {
        switch (code) {
            case 1:
                return 'Permission de géolocalisation refusée';
            case 2:
                return 'Position indisponible';
            case 3:
                return 'Délai d\'attente dépassé';
            default:
                return 'Erreur de géolocalisation inconnue';
        }
    };

    // Obtenir la position actuelle
    const getCurrentPosition = (): Promise<LocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!isSupported) {
                reject(new Error('Géolocalisation non supportée'));
                return;
            }

            setIsLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationPosition = convertPosition(position);
                    setPosition(locationPosition);
                    setIsLoading(false);
                    resolve(locationPosition);
                },
                (error) => {
                    onError(error);
                    reject(new Error(getErrorMessage(error.code)));
                },
                geoOptions
            );
        });
    };

    // Démarrer le suivi
    const startTracking = () => {
        if (!isSupported || isTracking) return;

        setIsLoading(true);
        setError(null);

        watchId.current = navigator.geolocation.watchPosition(
            onSuccess,
            onError,
            geoOptions
        );

        setIsTracking(true);
    };

    // Arrêter le suivi
    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }

        setIsTracking(false);
        setIsLoading(false);
    };

    // Cleanup au démontage
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, []);

    return {
        position,
        error,
        isLoading,
        isTracking,
        startTracking,
        stopTracking,
        getCurrentPosition,
        isSupported,
        permissionStatus
    };
}