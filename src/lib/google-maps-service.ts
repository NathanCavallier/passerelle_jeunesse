/**
 * Service Google Maps
 * Intégration de l'API Google Maps pour le calcul de distance et l'autocomplétion d'adresses
 */

import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

let loader: Loader | null = null;
let isLoaded = false;

// Déclaration globale pour TypeScript
declare global {
    interface Window {
        google: any;
    }
}

/**
 * Initialise et charge l'API Google Maps
 */
async function loadGoogleMapsAPI(): Promise<void> {
    if (isLoaded && typeof window !== 'undefined' && window.google) {
        return;
    }

    if (!loader) {
        loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ['places'],
        });
    }

    try {
        // @ts-ignore - La méthode loadPromise existe dans v2
        await loader.loadPromise();
        isLoaded = true;
        console.log('Google Maps API chargée avec succès');
    } catch (error) {
        console.error('Erreur lors du chargement de Google Maps:', error);
        throw new Error('Impossible de charger Google Maps');
    }
}

/**
 * Calcule la distance réelle entre deux adresses via Google Maps Distance Matrix API
 */
export async function calculateRealDistance(
    origin: string,
    destination: string
): Promise<{ distanceKm: number; durationMinutes: number; status: string }> {
    try {
        await loadGoogleMapsAPI();

        if (typeof window === 'undefined' || !window.google) {
            throw new Error('Google Maps non disponible');
        }

        const service = new window.google.maps.DistanceMatrixService();

        return new Promise((resolve, reject) => {
            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: window.google.maps.TravelMode.DRIVING,
                    unitSystem: window.google.maps.UnitSystem.METRIC,
                },
                (response: any, status: any) => {
                    if (status === 'OK' && response && response.rows[0].elements[0].status === 'OK') {
                        const element = response.rows[0].elements[0];
                        const distanceKm = Math.round(element.distance!.value / 1000);
                        const durationMinutes = Math.round(element.duration!.value / 60);

                        resolve({
                            distanceKm,
                            durationMinutes,
                            status: 'OK',
                        });
                    } else {
                        reject(new Error(`Distance Matrix API error: ${status}`));
                    }
                }
            );
        });
    } catch (error) {
        console.error('Erreur lors du calcul de distance:', error);
        throw error;
    }
}

/**
 * Géocode une adresse pour obtenir les coordonnées
 */
export async function geocodeAddress(
    address: string
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    try {
        await loadGoogleMapsAPI();

        if (typeof window === 'undefined' || !window.google) {
            return null;
        }

        const geocoder = new window.google.maps.Geocoder();

        return new Promise((resolve) => {
            geocoder.geocode({ address }, (results: any, status: any) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    resolve({
                        lat: location.lat(),
                        lng: location.lng(),
                        formattedAddress: results[0].formatted_address,
                    });
                } else {
                    resolve(null);
                }
            });
        });
    } catch (error) {
        console.error('Erreur lors du géocodage:', error);
        return null;
    }
}

/**
 * Autocomplétion d'adresses
 */
export async function getAddressSuggestions(input: string): Promise<string[]> {
    try {
        await loadGoogleMapsAPI();

        if (typeof window === 'undefined' || !window.google) {
            return [];
        }

        const service = new window.google.maps.places.AutocompleteService();

        return new Promise((resolve) => {
            service.getPlacePredictions(
                {
                    input,
                    componentRestrictions: { country: 'fr' }, // Limiter à la France
                    types: ['address'],
                },
                (predictions: any, status: any) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        resolve(predictions.map((p: any) => p.description));
                    } else {
                        resolve([]);
                    }
                }
            );
        });
    } catch (error) {
        console.error('Erreur lors de l\'autocomplétion:', error);
        return [];
    }
}

/**
 * Vérifie si l'API Google Maps est disponible
 */
export function isGoogleMapsAvailable(): boolean {
    return !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 0;
}
