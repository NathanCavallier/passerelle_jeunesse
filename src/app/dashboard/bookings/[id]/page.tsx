'use client';

/**
 * Page de détail d'une réservation
 * /dashboard/bookings/[id]
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PaymentButton } from '@/components/payments/payment-button';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Euro,
    Phone,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, BookingStatus } from '@/types/firestore';
import { getBooking, cancelBooking } from '@/lib/firestore-service';
import { formatPrice, getDiscountLabel } from '@/lib/pricing-service';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    assigned: 'Accompagnateur assigné',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
};

const STATUS_VARIANTS: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    confirmed: 'secondary',
    paid: 'default',
    assigned: 'default',
    in_progress: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
    refunded: 'secondary',
};

export default function BookingDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        loadBooking();
    }, [user, id]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const data = await getBooking(id);
            if (!data) {
                toast({
                    title: 'Erreur',
                    description: 'Réservation introuvable',
                    variant: 'destructive',
                });
                router.push('/dashboard/bookings');
                return;
            }
            setBooking(data as Booking);
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

    const handleCancel = async () => {
        if (!booking) return;

        setCancelling(true);
        try {
            // Calculer le remboursement selon la politique d'annulation
            const scheduledDate = booking.scheduledFor.toDate();
            const now = new Date();
            const hoursDiff = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            let refundAmount = 0;
            if (hoursDiff > 48) {
                // Plus de 48h avant : remboursement de l'acompte
                refundAmount = booking.pricing.depositPaid ? booking.pricing.deposit : 0;
            }

            await cancelBooking(
                booking.id,
                'parent',
                'Annulation par le parent',
                refundAmount
            );

            toast({
                title: 'Réservation annulée',
                description: refundAmount > 0
                    ? `Un remboursement de ${formatPrice(refundAmount)} sera traité.`
                    : 'La réservation a été annulée.',
            });

            loadBooking();
        } catch (error: any) {
            console.error('Erreur lors de l\'annulation:', error);
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!booking) {
        return null;
    }

    const canCancel = 
        booking.status !== 'cancelled' && 
        booking.status !== 'completed' && 
        booking.scheduledFor.toDate() > new Date();

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
            {/* En-tête */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/bookings')}
                    className="mb-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux réservations
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">
                                {booking.serviceType === 'local'
                                    ? 'Accompagnement local'
                                    : 'Longue distance'}
                            </h1>
                            <Badge variant={STATUS_VARIANTS[booking.status]} className="text-base">
                                {STATUS_LABELS[booking.status]}
                            </Badge>
                        </div>
                        <p className="text-neutral-600">
                            Réservation #{booking.id.substring(0, 8).toUpperCase()}
                        </p>
                    </div>
                    {canCancel && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <X className="h-4 w-4 mr-2" />
                                    Annuler la réservation
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Selon notre politique d&apos;annulation,
                                        un remboursement peut être effectué sous conditions.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Conserver</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCancel} disabled={cancelling}>
                                        Confirmer l&apos;annulation
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Date et heure */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Date et heure
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <div className="font-semibold">
                                        {format(booking.scheduledFor.toDate(), 'EEEE d MMMM yyyy', {
                                            locale: fr,
                                        })}
                                    </div>
                                    <div className="text-neutral-600">
                                        {format(booking.scheduledFor.toDate(), 'HH:mm', { locale: fr })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trajet */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Trajet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Départ */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold mb-1">Départ</div>
                                        <div className="text-sm text-neutral-600 space-y-1">
                                            <div>{booking.trip.departure.address}</div>
                                            <div>
                                                {booking.trip.departure.postalCode} {booking.trip.departure.city}
                                            </div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Phone className="h-3 w-3" />
                                                {booking.trip.departure.contactPerson} -{' '}
                                                {booking.trip.departure.contactPhone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-4 border-l-2 border-dashed border-neutral-300 h-8" />

                            {/* Arrivée */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <div className="h-3 w-3 rounded-full bg-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold mb-1">Arrivée</div>
                                        <div className="text-sm text-neutral-600 space-y-1">
                                            <div>{booking.trip.arrival.address}</div>
                                            <div>
                                                {booking.trip.arrival.postalCode} {booking.trip.arrival.city}
                                            </div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Phone className="h-3 w-3" />
                                                {booking.trip.arrival.contactPerson} -{' '}
                                                {booking.trip.arrival.contactPhone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Jeunes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Jeunes concernés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {booking.youngsters.map((youngster, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                                            {youngster.firstName[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium">{youngster.firstName}</div>
                                            <div className="text-xs text-neutral-600">{youngster.age} ans</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations complémentaires */}
                    {booking.additionalInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Informations complémentaires
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                                    {booking.additionalInfo}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Colonne de droite */}
                <div className="space-y-6">
                    {/* Tarification */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Euro className="h-5 w-5" />
                                Tarification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Prix de base</span>
                                    <span>{formatPrice(booking.pricing.basePrice)}</span>
                                </div>

                                {booking.pricing.youngstersSuplement > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Jeunes supplémentaires</span>
                                        <span>{formatPrice(booking.pricing.youngstersSuplement)}</span>
                                    </div>
                                )}

                                {booking.pricing.distanceSupplement && booking.pricing.distanceSupplement > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Supplément distance</span>
                                        <span>{formatPrice(booking.pricing.distanceSupplement)}</span>
                                    </div>
                                )}

                                {booking.pricing.urgencySupplement && booking.pricing.urgencySupplement > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Urgence</span>
                                        <span>{formatPrice(booking.pricing.urgencySupplement)}</span>
                                    </div>
                                )}

                                {booking.pricing.discounts.length > 0 && (
                                    <>
                                        <Separator />
                                        {booking.pricing.discounts.map((discount, index) => (
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
                                    <span>{formatPrice(booking.pricing.subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-neutral-600">TVA (20%)</span>
                                    <span>{formatPrice(booking.pricing.taxes)}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total TTC</span>
                                    <span className="text-blue-600">{formatPrice(booking.pricing.total)}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Paiements */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                                    <div className="flex items-center gap-2">
                                        {booking.pricing.depositPaid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-orange-600" />
                                        )}
                                        <span className="text-sm font-medium">Acompte (30%)</span>
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {formatPrice(booking.pricing.deposit)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                                    <div className="flex items-center gap-2">
                                        {booking.pricing.balancePaid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-orange-600" />
                                        )}
                                        <span className="text-sm font-medium">Solde</span>
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {formatPrice(booking.pricing.balance)}
                                    </span>
                                </div>
                            </div>

                            {/* Boutons de paiement Stripe */}
                            {booking.status !== 'cancelled' && (
                                <div className="space-y-3">
                                    {!booking.pricing.depositPaid && (
                                        <PaymentButton
                                            bookingId={booking.id}
                                            amount={booking.pricing.deposit}
                                            paymentType="deposit"
                                            className="w-full"
                                        />
                                    )}
                                    
                                    {booking.pricing.depositPaid && !booking.pricing.balancePaid && (
                                        <PaymentButton
                                            bookingId={booking.id}
                                            amount={booking.pricing.balance}
                                            paymentType="balance"
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Alerte annulation */}
                    {booking.status === 'cancelled' && booking.cancellation && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-semibold mb-1">Réservation annulée</div>
                                <div className="text-sm">
                                    {booking.cancellation.reason}
                                </div>
                                {booking.cancellation.refundAmount > 0 && (
                                    <div className="text-sm mt-2">
                                        Remboursement : {formatPrice(booking.cancellation.refundAmount)} (
                                        {booking.cancellation.refundStatus === 'pending' ? 'en cours' : 'effectué'})
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
}
