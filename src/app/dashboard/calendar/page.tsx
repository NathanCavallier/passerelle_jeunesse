/**
 * Page du calendrier des missions
 * Vue calendrier des réservations à venir et passées
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Download, Loader2, MapPin } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '@/types/firestore';

interface BookingDay {
    date: Date;
    bookings: Booking[];
}

const STATUS_COLORS = {
    pending: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    paid: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    assigned: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    in_progress: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    refunded: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
};

const STATUS_LABELS = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    assigned: 'Assignée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    refunded: 'Remboursée'
};

export default function CalendarPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
    const [bookingDays, setBookingDays] = useState<Date[]>([]);

    useEffect(() => {
        if (!user) return;

        const loadBookings = async () => {
            try {
                const bookingsRef = collection(db, 'bookings');
                const q = query(
                    bookingsRef,
                    where('parentId', '==', user.uid)
                );

                const snapshot = await getDocs(q);
                const bookingsData: Booking[] = [];
                snapshot.forEach((doc) => {
                    bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
                });

                // Trier côté client par createdAt décroissant
                bookingsData.sort((a, b) => {
                    const timeA = a.createdAt?.toDate().getTime() || 0;
                    const timeB = b.createdAt?.toDate().getTime() || 0;
                    return timeB - timeA;
                });

                setBookings(bookingsData);

                // Extraire les jours avec des réservations
                const days = bookingsData
                    .map(b => b.trip.departure.date.toDate())
                    .filter((date, index, self) => 
                        self.findIndex(d => isSameDay(d, date)) === index
                    );
                setBookingDays(days);

                // Charger les réservations du jour sélectionné
                updateSelectedBookings(bookingsData, selectedDate);
            } catch (error) {
                console.error('Erreur lors du chargement des réservations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, [user]);

    const updateSelectedBookings = (allBookings: Booking[], date: Date) => {
        const bookingsForDay = allBookings.filter(b =>
            isSameDay(b.trip.departure.date.toDate(), date)
        );
        setSelectedBookings(bookingsForDay);
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            updateSelectedBookings(bookings, date);
        }
    };

    const handleExportICal = () => {
        // Générer un fichier iCal simple
        let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Passerelle Jeunesse//Calendar//FR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n';
        
        bookings.forEach((booking) => {
            const startDate = booking.trip.departure.date.toDate();
            const formattedDate = format(startDate, "yyyyMMdd'T'HHmmss");
            
            icalContent += `BEGIN:VEVENT\n`;
            icalContent += `UID:booking-${booking.id}@passerelle-jeunesse.fr\n`;
            icalContent += `DTSTAMP:${formattedDate}\n`;
            icalContent += `DTSTART:${formattedDate}\n`;
            icalContent += `SUMMARY:Mission ${booking.trip.departure.city} → ${booking.trip.arrival.city}\n`;
            icalContent += `DESCRIPTION:Réservation Passerelle Jeunesse - ${STATUS_LABELS[booking.status]}\n`;
            icalContent += `LOCATION:${booking.trip.departure.address}\n`;
            icalContent += `STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}\n`;
            icalContent += `END:VEVENT\n`;
        });
        
        icalContent += 'END:VCALENDAR';
        
        // Télécharger le fichier
        const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `passerelle-jeunesse-${format(new Date(), 'yyyy-MM')}.ics`;
        link.click();
    };

    const getDayModifiers = () => {
        const modifiers: Record<string, Date[]> = {};
        
        // Grouper les jours par statut
        bookings.forEach(booking => {
            const status = booking.status;
            const date = booking.trip.departure.date.toDate();
            
            if (!modifiers[status]) {
                modifiers[status] = [];
            }
            modifiers[status].push(date);
        });
        
        return modifiers;
    };

    const getDayModifiersClassNames = () => {
        const classNames: Record<string, string> = {};
        
        Object.keys(STATUS_COLORS).forEach(status => {
            classNames[status] = `${STATUS_COLORS[status as keyof typeof STATUS_COLORS].bg} ${STATUS_COLORS[status as keyof typeof STATUS_COLORS].text} font-semibold`;
        });
        
        return classNames;
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au dashboard
                </Button>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-8 w-8" />
                            Calendrier des missions
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Vue d'ensemble de vos réservations
                        </p>
                    </div>
                    <Button onClick={handleExportICal} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter iCal
                    </Button>
                </div>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="pt-10 pb-10 text-center">
                        <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
                        <p className="text-muted-foreground mb-6">
                            Créez votre première réservation pour voir votre calendrier.
                        </p>
                        <Button onClick={() => router.push('/dashboard/bookings/new')}>
                            Nouvelle réservation
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendrier */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                                </CardTitle>
                                <CardDescription>
                                    Sélectionnez un jour pour voir les détails
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={fr}
                                    modifiers={getDayModifiers()}
                                    modifiersClassNames={getDayModifiersClassNames()}
                                    className="rounded-md border w-full"
                                />
                            </CardContent>
                        </Card>

                        {/* Légende */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-base">Légende des statuts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                        <div key={status} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded ${STATUS_COLORS[status as keyof typeof STATUS_COLORS].bg}`} />
                                            <span className="text-sm">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Réservations du jour sélectionné */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                                </CardTitle>
                                <CardDescription>
                                    {selectedBookings.length} réservation{selectedBookings.length > 1 ? 's' : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedBookings.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Aucune réservation ce jour</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedBookings.map((booking) => (
                                            <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                                                <Card className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${STATUS_COLORS[booking.status].border}`}>
                                                    <CardContent className="pt-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <Badge 
                                                                    className={`${STATUS_COLORS[booking.status].bg} ${STATUS_COLORS[booking.status].text}`}
                                                                >
                                                                    {STATUS_LABELS[booking.status]}
                                                                </Badge>
                                                                <span className="text-sm font-medium">
                                                                    {booking.trip.departure.time}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                                <div className="text-sm">
                                                                    <p className="font-medium">
                                                                        {booking.trip.departure.city}
                                                                    </p>
                                                                    <p className="text-muted-foreground text-xs">
                                                                        → {booking.trip.arrival.city}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-2 border-t">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {booking.youngstersIds.length} jeune{booking.youngstersIds.length > 1 ? 's' : ''}
                                                                </span>
                                                                <span className="text-sm font-bold text-primary">
                                                                    {booking.pricing.total}€
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistiques rapides */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Ce mois-ci</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const monthStart = startOfMonth(selectedDate);
                                    const monthEnd = endOfMonth(selectedDate);
                                    const monthBookings = bookings.filter(b => {
                                        const date = b.trip.departure.date.toDate();
                                        return date >= monthStart && date <= monthEnd;
                                    });
                                    
                                    return (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total réservations</span>
                                                <span className="font-semibold">{monthBookings.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">En cours</span>
                                                <span className="font-semibold">
                                                    {monthBookings.filter(b => ['assigned', 'in_progress'].includes(b.status)).length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Terminées</span>
                                                <span className="font-semibold">
                                                    {monthBookings.filter(b => b.status === 'completed').length}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
