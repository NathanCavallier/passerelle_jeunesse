'use client';

/**
 * Page de liste des réservations
 * /dashboard/bookings
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Plus,
    Calendar,
    MapPin,
    Users,
    Euro,
    Clock,
    ArrowLeft,
    ChevronRight,
    FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, BookingStatus } from '@/types/firestore';
import { getParentBookings } from '@/lib/firestore-service';
import { formatPrice } from '@/lib/pricing-service';

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

export default function BookingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await getParentBookings(user!.uid);
            setBookings(data as Booking[]);
        } catch (error: any) {
            console.error('Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = (bookings: Booking[]): Booking[] => {
        const now = new Date();

        switch (activeTab) {
            case 'upcoming':
                return bookings.filter((b) => {
                    const scheduledDate = b.scheduledFor.toDate();
                    return scheduledDate > now && b.status !== 'cancelled' && b.status !== 'completed';
                });
            case 'past':
                return bookings.filter((b) => {
                    const scheduledDate = b.scheduledFor.toDate();
                    return scheduledDate <= now || b.status === 'cancelled' || b.status === 'completed';
                });
            default:
                return bookings;
        }
    };

    const filteredBookings = filterBookings(bookings);

    if (loading) {
        return (
            <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </Button>
                    <h1 className="text-3xl font-bold">Mes réservations</h1>
                    <p className="text-neutral-600">
                        Gérez vos prestations d&apos;accompagnement
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/bookings/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle réservation
                    </Link>
                </Button>
            </div>

            {/* Filtres */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList>
                    <TabsTrigger value="all">
                        Toutes ({bookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">
                        À venir ({filterBookings(bookings).length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        Passées ({filterBookings(bookings).length})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Liste des réservations */}
            {filteredBookings.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-16 w-16 text-neutral-300 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            Aucune réservation
                        </h3>
                        <p className="text-neutral-600 text-center mb-6 max-w-md">
                            {activeTab === 'upcoming'
                                ? 'Vous n\'avez aucune réservation à venir.'
                                : activeTab === 'past'
                                ? 'Vous n\'avez aucune réservation passée.'
                                : 'Créez votre première réservation pour commencer.'}
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/bookings/new">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une réservation
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredBookings.map((booking) => (
                        <Card
                            key={booking.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">
                                                    {booking.serviceType === 'local'
                                                        ? 'Accompagnement local'
                                                        : 'Longue distance'}
                                                </h3>
                                                <Badge variant={STATUS_VARIANTS[booking.status]}>
                                                    {STATUS_LABELS[booking.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-neutral-600">
                                                {format(booking.scheduledFor.toDate(), 'EEEE d MMMM yyyy à HH:mm', {
                                                    locale: fr,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatPrice(booking.pricing.total)}
                                        </div>
                                        {!booking.pricing.depositPaid && (
                                            <p className="text-xs text-neutral-600">
                                                Acompte : {formatPrice(booking.pricing.deposit)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-neutral-900">Départ</div>
                                            <div className="text-neutral-600">
                                                {booking.trip.departure.address}, {booking.trip.departure.city}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-neutral-900">Arrivée</div>
                                            <div className="text-neutral-600">
                                                {booking.trip.arrival.address}, {booking.trip.arrival.city}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-neutral-400" />
                                        <span className="text-neutral-600">
                                            {booking.youngsters.length} jeune{booking.youngsters.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {booking.accompanistId && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-neutral-400" />
                                            <span className="text-neutral-600">Accompagnateur assigné</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end mt-4 text-blue-600 hover:text-blue-700">
                                    <span className="text-sm font-medium">Voir les détails</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
