'use client';

/**
 * Formulaire de création de réservation
 * Permet aux parents de réserver une prestation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Timestamp } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { 
    Calendar,
    Clock,
    MapPin,
    Users,
    Euro,
    AlertCircle,
    Check,
    ChevronRight,
    FileText,
} from 'lucide-react';
import type { ServiceType, Youngster, Pricing } from '@/types/firestore';
import { getYoungsters, createBooking, getUserDocument } from '@/lib/firestore-service';
import { 
    calculateBookingPrice, 
    formatPrice, 
    isUrgentBooking,
    calculateDistance,
    getDiscountLabel,
    type PricingInput 
} from '@/lib/pricing-service';

// ============================================================================
// SCHEMA DE VALIDATION
// ============================================================================

const bookingSchema = z.object({
    serviceType: z.enum(['local', 'long_distance']),
    selectedYoungsters: z.array(z.string()).min(1, 'Sélectionnez au moins un jeune'),
    
    // Départ
    departureAddress: z.string().min(5, 'Adresse de départ requise'),
    departureCity: z.string().min(2, 'Ville de départ requise'),
    departurePostalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    departureDate: z.string().min(1, 'Date de départ requise'),
    departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'Heure invalide (HH:MM)'),
    departureContactPerson: z.string().min(2, 'Nom du contact requis'),
    departureContactPhone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, 'Téléphone invalide'),
    
    // Arrivée
    arrivalAddress: z.string().min(5, 'Adresse d\'arrivée requise'),
    arrivalCity: z.string().min(2, 'Ville d\'arrivée requise'),
    arrivalPostalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    arrivalContactPerson: z.string().min(2, 'Nom du contact requis'),
    arrivalContactPhone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, 'Téléphone invalide'),
    
    // Transport (longue distance)
    transportType: z.enum(['train', 'bus', 'car', 'metro', 'tram']).optional(),
    ticketsProvided: z.boolean().optional(),
    
    // Informations complémentaires
    additionalInfo: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// ============================================================================
// COMPOSANT
// ============================================================================

export default function BookingForm() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [youngsters, setYoungsters] = useState<Youngster[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pricing, setPricing] = useState<Pricing | null>(null);
    const [step, setStep] = useState<'form' | 'review'>('form');
    const [parentData, setParentData] = useState<any>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            serviceType: 'local',
            selectedYoungsters: [],
            ticketsProvided: false,
            transportType: 'train',
        },
    });

    const serviceType = watch('serviceType');
    const selectedYoungsters = watch('selectedYoungsters');
    const departureDate = watch('departureDate');
    const departureAddress = watch('departureAddress');
    const departurePostalCode = watch('departurePostalCode');
    const arrivalAddress = watch('arrivalAddress');
    const arrivalPostalCode = watch('arrivalPostalCode');

    // Charger les jeunes et les données parent
    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [youngstersData, userData] = await Promise.all([
                getYoungsters(user!.uid),
                getUserDocument(user!.uid),
            ]);

            setYoungsters(youngstersData as Youngster[]);
            setParentData(userData);
        } catch (error: any) {
            console.error('Erreur lors du chargement:', error);
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Calculer le prix en temps réel
    useEffect(() => {
        if (selectedYoungsters.length === 0) {
            setPricing(null);
            return;
        }

        // Fonction asynchrone pour calculer la distance avec Google Maps
        const calculatePricing = async () => {
            let distanceKm: number | undefined = undefined;

            // Calculer la distance pour les longues distances
            if (serviceType === 'long_distance' && 
                departureAddress && departurePostalCode && 
                arrivalAddress && arrivalPostalCode) {
                try {
                    distanceKm = await calculateDistance(
                        departureAddress,
                        departurePostalCode,
                        arrivalAddress,
                        arrivalPostalCode
                    );
                } catch (error) {
                    console.error('Erreur calcul distance:', error);
                    distanceKm = undefined;
                }
            }

            const scheduledDate = departureDate ? new Date(departureDate) : new Date();
            const isUrgent = isUrgentBooking(scheduledDate);

            const pricingInput: PricingInput = {
                serviceType,
                numberOfYoungsters: selectedYoungsters.length,
                distanceKm,
                isUrgent,
                hasMultipleSiblings: selectedYoungsters.length > 1,
                isFirstBooking: (parentData?.parentProfile?.totalBookings || 0) === 0,
                totalPreviousBookings: parentData?.parentProfile?.totalBookings || 0,
            };

            const calculatedPricing = calculateBookingPrice(pricingInput);
            setPricing(calculatedPricing);
        };

        calculatePricing();
    }, [
        serviceType,
        selectedYoungsters,
        departureAddress,
        departurePostalCode,
        arrivalAddress,
        arrivalPostalCode,
        departureDate,
        parentData,
    ]);

    const onSubmit = async (data: BookingFormData) => {
        if (!pricing) return;

        setSubmitting(true);
        try {
            // Préparer les données de réservation
            const selectedYoungstersData = youngsters
                .filter((y) => data.selectedYoungsters.includes(y.id))
                .map((y) => ({
                    youngsterId: y.id,
                    firstName: y.firstName,
                    age: y.age,
                }));

            const departureTimestamp = Timestamp.fromDate(
                new Date(`${data.departureDate}T${data.departureTime}`)
            );

            // Préparer bookingData - fonction utilitaire pour supprimer undefined/null
            const cleanObject = (obj: any): any => {
                if (obj === null || obj === undefined) return null;
                if (typeof obj !== 'object') return obj;
                if (Array.isArray(obj)) return obj.map(cleanObject).filter(item => item !== null);
                
                const cleaned: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (value !== undefined && value !== null && value !== '') {
                        const cleanedValue = cleanObject(value);
                        if (cleanedValue !== null) {
                            cleaned[key] = cleanedValue;
                        }
                    }
                }
                return Object.keys(cleaned).length > 0 ? cleaned : null;
            };

            const rawBookingData = {
                parentId: user!.uid,
                youngstersIds: data.selectedYoungsters,
                serviceType: data.serviceType,
                youngsters: selectedYoungstersData,
                trip: {
                    departure: {
                        address: data.departureAddress,
                        city: data.departureCity,
                        postalCode: data.departurePostalCode,
                        date: departureTimestamp,
                        time: data.departureTime,
                        contactPerson: data.departureContactPerson,
                        contactPhone: data.departureContactPhone,
                    },
                    arrival: {
                        address: data.arrivalAddress,
                        city: data.arrivalCity,
                        postalCode: data.arrivalPostalCode,
                        contactPerson: data.arrivalContactPerson,
                        contactPhone: data.arrivalContactPhone,
                        estimatedDate: departureTimestamp,
                        estimatedTime: data.departureTime,
                    },
                    transportType: data.transportType || 'car',
                    ticketsProvided: data.ticketsProvided ?? false,
                },
                pricing,
                scheduledFor: departureTimestamp,
                additionalInfo: data.additionalInfo || undefined,
                documents: {},
            };

            // Nettoyer l'objet pour Firestore (supprimer undefined/null/empty)
            const bookingData = cleanObject(rawBookingData);

            const bookingId = await createBooking(bookingData);

            toast({
                title: 'Réservation créée ! 🎉',
                description: 'Votre demande a été enregistrée. Vous recevrez une confirmation par email.',
            });

            router.push(`/dashboard/bookings/${bookingId}`);
        } catch (error: any) {
            console.error('Erreur lors de la création:', error);
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <p className="text-center text-neutral-600">Chargement...</p>
            </div>
        );
    }

    if (youngsters.length === 0) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Vous devez d&apos;abord ajouter au moins un jeune dans votre profil avant de pouvoir réserver.
                    </AlertDescription>
                </Alert>
                <Button onClick={() => router.push('/dashboard/youngsters')} className="mt-4">
                    Ajouter un jeune
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Nouvelle réservation</h1>
                <p className="text-neutral-600">
                    Réservez une prestation d&apos;accompagnement pour vos jeunes
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Type de service */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Type de prestation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Controller
                                    name="serviceType"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card
                                                className={`cursor-pointer transition-all ${
                                                    field.value === 'local'
                                                        ? 'border-blue-500 border-2 bg-blue-50'
                                                        : 'hover:border-neutral-400'
                                                }`}
                                                onClick={() => field.onChange('local')}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="font-semibold">Accompagnement local</h3>
                                                        {field.value === 'local' && (
                                                            <Check className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-600 mb-2">
                                                        Dans la même ville ou à proximité
                                                    </p>
                                                    <Badge variant="secondary">À partir de {formatPrice(35)}</Badge>
                                                </CardContent>
                                            </Card>

                                            <Card
                                                className={`cursor-pointer transition-all ${
                                                    field.value === 'long_distance'
                                                        ? 'border-blue-500 border-2 bg-blue-50'
                                                        : 'hover:border-neutral-400'
                                                }`}
                                                onClick={() => field.onChange('long_distance')}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="font-semibold">Longue distance</h3>
                                                        {field.value === 'long_distance' && (
                                                            <Check className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-600 mb-2">
                                                        Transport entre villes (train, bus...)
                                                    </p>
                                                    <Badge variant="secondary">À partir de {formatPrice(80)}</Badge>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Sélection des jeunes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Jeunes concernés
                                </CardTitle>
                                <CardDescription>
                                    Sélectionnez les jeunes pour cette prestation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Controller
                                    name="selectedYoungsters"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            {youngsters.map((youngster) => (
                                                <div
                                                    key={youngster.id}
                                                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50"
                                                >
                                                    <Checkbox
                                                        checked={field.value.includes(youngster.id)}
                                                        onCheckedChange={(checked) => {
                                                            const newValue = checked
                                                                ? [...field.value, youngster.id]
                                                                : field.value.filter((id) => id !== youngster.id);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {youngster.firstName} {youngster.lastName}
                                                        </div>
                                                        <div className="text-sm text-neutral-600">
                                                            {youngster.age} ans
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                />
                                {errors.selectedYoungsters && (
                                    <p className="text-sm text-red-600">{errors.selectedYoungsters.message}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Départ */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Point de départ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="departureDate">Date *</Label>
                                        <Input
                                            id="departureDate"
                                            type="date"
                                            {...register('departureDate')}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.departureDate && (
                                            <p className="text-sm text-red-600">{errors.departureDate.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departureTime">Heure *</Label>
                                        <Input
                                            id="departureTime"
                                            type="time"
                                            {...register('departureTime')}
                                        />
                                        {errors.departureTime && (
                                            <p className="text-sm text-red-600">{errors.departureTime.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="departureAddress">Adresse *</Label>
                                    <Controller
                                        name="departureAddress"
                                        control={control}
                                        render={({ field }) => (
                                            <AddressAutocomplete
                                                id="departureAddress"
                                                value={field.value}
                                                onChange={field.onChange}
                                                onSelect={(address, details) => {
                                                    field.onChange(details?.streetAddress || address);
                                                    // Auto-remplir ville et code postal si disponibles
                                                    if (details?.city) {
                                                        setValue('departureCity', details.city);
                                                    }
                                                    if (details?.postalCode) {
                                                        setValue('departurePostalCode', details.postalCode);
                                                    }
                                                }}
                                                placeholder="12 rue de la Paix, 75001 Paris"
                                            />
                                        )}
                                    />
                                    {errors.departureAddress && (
                                        <p className="text-sm text-red-600">{errors.departureAddress.message}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="departureCity">Ville *</Label>
                                        <Input
                                            id="departureCity"
                                            {...register('departureCity')}
                                            placeholder="Paris"
                                        />
                                        {errors.departureCity && (
                                            <p className="text-sm text-red-600">{errors.departureCity.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departurePostalCode">Code postal *</Label>
                                        <Input
                                            id="departurePostalCode"
                                            {...register('departurePostalCode')}
                                            placeholder="75001"
                                        />
                                        {errors.departurePostalCode && (
                                            <p className="text-sm text-red-600">{errors.departurePostalCode.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="departureContactPerson">Contact sur place *</Label>
                                        <Input
                                            id="departureContactPerson"
                                            {...register('departureContactPerson')}
                                            placeholder="Marie Dupont"
                                        />
                                        {errors.departureContactPerson && (
                                            <p className="text-sm text-red-600">{errors.departureContactPerson.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departureContactPhone">Téléphone *</Label>
                                        <Input
                                            id="departureContactPhone"
                                            {...register('departureContactPhone')}
                                            placeholder="06 12 34 56 78"
                                        />
                                        {errors.departureContactPhone && (
                                            <p className="text-sm text-red-600">{errors.departureContactPhone.message}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Arrivée */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Point d&apos;arrivée
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalAddress">Adresse *</Label>
                                    <Controller
                                        name="arrivalAddress"
                                        control={control}
                                        render={({ field }) => (
                                            <AddressAutocomplete
                                                id="arrivalAddress"
                                                value={field.value}
                                                onChange={field.onChange}
                                                onSelect={(address, details) => {
                                                    field.onChange(details?.streetAddress || address);
                                                    // Auto-remplir ville et code postal si disponibles
                                                    if (details?.city) {
                                                        setValue('arrivalCity', details.city);
                                                    }
                                                    if (details?.postalCode) {
                                                        setValue('arrivalPostalCode', details.postalCode);
                                                    }
                                                }}
                                                placeholder="45 avenue des Champs-Élysées, 75008 Paris"
                                            />
                                        )}
                                    />
                                    {errors.arrivalAddress && (
                                        <p className="text-sm text-red-600">{errors.arrivalAddress.message}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalCity">Ville *</Label>
                                        <Input
                                            id="arrivalCity"
                                            {...register('arrivalCity')}
                                            placeholder="Paris"
                                        />
                                        {errors.arrivalCity && (
                                            <p className="text-sm text-red-600">{errors.arrivalCity.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalPostalCode">Code postal *</Label>
                                        <Input
                                            id="arrivalPostalCode"
                                            {...register('arrivalPostalCode')}
                                            placeholder="75008"
                                        />
                                        {errors.arrivalPostalCode && (
                                            <p className="text-sm text-red-600">{errors.arrivalPostalCode.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalContactPerson">Contact sur place *</Label>
                                        <Input
                                            id="arrivalContactPerson"
                                            {...register('arrivalContactPerson')}
                                            placeholder="Jean Martin"
                                        />
                                        {errors.arrivalContactPerson && (
                                            <p className="text-sm text-red-600">{errors.arrivalContactPerson.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalContactPhone">Téléphone *</Label>
                                        <Input
                                            id="arrivalContactPhone"
                                            {...register('arrivalContactPhone')}
                                            placeholder="06 98 76 54 32"
                                        />
                                        {errors.arrivalContactPhone && (
                                            <p className="text-sm text-red-600">{errors.arrivalContactPhone.message}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transport longue distance */}
                        {serviceType === 'long_distance' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transport</CardTitle>
                                    <CardDescription>
                                        Informations sur le moyen de transport
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="transportType">Type de transport *</Label>
                                       <Controller
                                            name="transportType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="train">Train</SelectItem>
                                                        <SelectItem value="bus">Bus</SelectItem>
                                                        <SelectItem value="car">Voiture</SelectItem>
                                                        <SelectItem value="metro">Métro</SelectItem>
                                                        <SelectItem value="tram">Tramway</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <Controller
                                        name="ticketsProvided"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label>Les billets sont déjà achetés</Label>
                                            </div>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Informations complémentaires */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations complémentaires</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    {...register('additionalInfo')}
                                    placeholder="Ajoutez des informations importantes pour l'accompagnateur (besoins spécifiques, particularités du trajet, etc.)"
                                    rows={4}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Récapitulatif et prix */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            {/* Estimation du prix */}
                            {pricing && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Euro className="h-5 w-5" />
                                            Estimation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Prix de base</span>
                                                <span className="font-medium">{formatPrice(pricing.basePrice)}</span>
                                            </div>

                                            {pricing.youngstersSuplement > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-600">
                                                        {selectedYoungsters.length - 1} jeune(s) supplémentaire(s)
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatPrice(pricing.youngstersSuplement)}
                                                    </span>
                                                </div>
                                            )}

                                            {pricing.distanceSupplement && pricing.distanceSupplement > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-600">Supplément distance</span>
                                                    <span className="font-medium">
                                                        {formatPrice(pricing.distanceSupplement)}
                                                    </span>
                                                </div>
                                            )}

                                            {pricing.urgencySupplement && pricing.urgencySupplement > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-600">Urgence (&lt; 48h)</span>
                                                    <span className="font-medium">
                                                        {formatPrice(pricing.urgencySupplement)}
                                                    </span>
                                                </div>
                                            )}

                                            {pricing.discounts.length > 0 && (
                                                <>
                                                    <Separator />
                                                    {pricing.discounts.map((discount, index) => (
                                                        <div key={index} className="flex justify-between text-green-600">
                                                            <span>{getDiscountLabel(discount.type)}</span>
                                                            <span>-{formatPrice(discount.amount)}</span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            <Separator />

                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Sous-total HT</span>
                                                <span className="font-medium">{formatPrice(pricing.subtotal)}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">TVA (20%)</span>
                                                <span className="font-medium">{formatPrice(pricing.taxes)}</span>
                                            </div>

                                            <Separator />

                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total TTC</span>
                                                <span className="text-blue-600">{formatPrice(pricing.total)}</span>
                                            </div>

                                            <Separator />

                                            <div className="space-y-1 text-xs text-neutral-600 bg-neutral-50 p-3 rounded">
                                                <div className="flex justify-between">
                                                    <span>Acompte à verser (30%)</span>
                                                    <span className="font-semibold text-neutral-900">
                                                        {formatPrice(pricing.deposit)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Solde restant</span>
                                                    <span>{formatPrice(pricing.balance)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Bouton de soumission */}
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={submitting || !pricing}
                            >
                                {submitting ? 'Création...' : 'Créer la réservation'}
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>

                            {/* Note importante */}
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    En créant cette réservation, vous recevrez un devis par email. 
                                    Un acompte de 30% sera demandé pour confirmer la réservation.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
