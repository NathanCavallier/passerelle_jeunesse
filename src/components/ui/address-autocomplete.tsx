'use client';

/**
 * Composant d'autocomplétion d'adresses avec Google Places API
 */

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { getAddressSuggestions, isGoogleMapsAvailable } from '@/lib/google-maps-service';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (address: string, details?: AddressDetails) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

interface AddressDetails {
    fullAddress: string;
    streetAddress?: string;
    city?: string;
    postalCode?: string;
}

/**
 * Extrait les détails d'une adresse formatée par Google
 * Format typique: "12 Rue de Rivoli, 75001 Paris, France"
 */
function parseGoogleAddress(fullAddress: string): AddressDetails {
    const parts = fullAddress.split(',').map(p => p.trim());
    
    const details: AddressDetails = {
        fullAddress,
    };

    // Première partie = adresse de rue
    if (parts[0]) {
        details.streetAddress = parts[0];
    }

    // Deuxième partie contient souvent le code postal et la ville
    if (parts[1]) {
        const match = parts[1].match(/(\d{5})\s+(.+)/);
        if (match) {
            details.postalCode = match[1];
            details.city = match[2];
        } else {
            details.city = parts[1];
        }
    }

    return details;
}

export function AddressAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = 'Entrez une adresse...',
    disabled = false,
    className,
    id,
}: AddressAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [mapsAvailable, setMapsAvailable] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // S'assurer que value n'est jamais undefined (fix erreur uncontrolled input)
    const safeValue = value ?? '';

    // Vérifier si Google Maps est disponible
    useEffect(() => {
        setMapsAvailable(isGoogleMapsAvailable());
    }, []);

    // Rechercher des suggestions lors de la saisie
    useEffect(() => {
        // Annuler la recherche précédente
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Ne pas chercher si le champ est vide ou trop court
        if (!value || value.length < 3 || !mapsAvailable) {
            setSuggestions([]);
            return;
        }

        // Attendre 500ms après la dernière saisie (debounce)
        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await getAddressSuggestions(value);
                setSuggestions(results);
                setOpen(results.length > 0);
            } catch (error) {
                console.error('Erreur autocomplétion:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, mapsAvailable]);

    const handleSelect = (selectedAddress: string) => {
        onChange(selectedAddress);
        setOpen(false);
        setSuggestions([]);

        // Appeler onSelect avec les détails parsés si fourni
        if (onSelect) {
            const details = parseGoogleAddress(selectedAddress);
            onSelect(selectedAddress, details);
        }
    };

    // Si Google Maps n'est pas disponible, afficher un input normal
    if (!mapsAvailable) {
        return (
            <Input
                id={id}
                type="text"
                value={safeValue}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
            />
        );
    }

    return (
        <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
                id={id}
                type="text"
                value={safeValue}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn('pl-10 pr-10', className)}
                autoComplete="off"
            />
            {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
            )}
            
            {/* Liste de suggestions */}
            {open && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                    <div className="p-1">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className={cn(
                                    'w-full text-left px-3 py-2 rounded-sm text-sm',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    'focus:bg-accent focus:text-accent-foreground',
                                    'flex items-start gap-2 cursor-pointer transition-colors'
                                )}
                            >
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
