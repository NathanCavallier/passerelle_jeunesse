/**
 * Planning personnel de l'accompagnateur
 * Vue calendrier des missions avec navigation jour/semaine/mois
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { Booking } from '@/types/firestore';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Eye,
} from 'lucide-react';
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month';

export default function AccompanistPlanningPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!loading && !isAccompanist) {
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, isAccompanist, router]);

  // Charger missions en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user || !isAccompanist) return;

    setLoadingBookings(true);

    const bookingsQuery = query(
      collection(getFirebaseDb(), 'bookings'),
      where('accompanistId', '==', user.uid),
      orderBy('scheduledDate', 'asc')
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingsList: Booking[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          bookingsList.push({
            id: doc.id,
            ...data,
            scheduledFor: data.scheduledFor?.toDate?.() instanceof Date ? data.scheduledFor.toDate() : new Date(data.scheduledFor),
            scheduledDate: data.scheduledDate?.toDate?.() instanceof Date ? data.scheduledDate.toDate() : new Date(data.scheduledDate),
            createdAt: data.createdAt?.toDate?.() instanceof Date ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() instanceof Date ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as unknown as Booking);
        });
        setAllBookings(bookingsList);
        setLoadingBookings(false);
      },
      (error) => {
        console.error('Erreur chargement planning:', error);
        setLoadingBookings(false);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger votre planning.',
        });
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user, isAccompanist, toast]);

  // Navigation
  const goToToday = () => setCurrentDate(new Date());

  const goPrev = () => {
    switch (viewMode) {
      case 'day': setCurrentDate((d) => subDays(d, 1)); break;
      case 'week': setCurrentDate((d) => subWeeks(d, 1)); break;
      case 'month': setCurrentDate((d) => subMonths(d, 1)); break;
    }
  };

  const goNext = () => {
    switch (viewMode) {
      case 'day': setCurrentDate((d) => addDays(d, 1)); break;
      case 'week': setCurrentDate((d) => addWeeks(d, 1)); break;
      case 'month': setCurrentDate((d) => addMonths(d, 1)); break;
    }
  };

  // Missions pour un jour donné
  const getMissionsForDay = (date: Date) => {
    return allBookings.filter((booking) => {
      const bookingDate = booking.scheduledFor instanceof Date
        ? booking.scheduledFor
        : new Date((booking.scheduledFor?.toDate()) || booking.scheduledFor);
      return isSameDay(bookingDate, date) && booking.status !== 'cancelled';
    });
  };

  // Jours affichés
  const displayDays = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week': {
        const start = startOfWeek(currentDate, { locale: fr });
        const end = endOfWeek(currentDate, { locale: fr });
        return eachDayOfInterval({ start, end });
      }
      case 'month': {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { locale: fr });
        const calendarEnd = endOfWeek(monthEnd, { locale: fr });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      }
    }
  }, [currentDate, viewMode]);

  // Titre de la période
  const periodTitle = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
      case 'week': {
        const start = startOfWeek(currentDate, { locale: fr });
        const end = endOfWeek(currentDate, { locale: fr });
        return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  }, [currentDate, viewMode]);

  const getBookingTimeLabel = (booking: Booking) => {
    const scheduledDate = booking.scheduledFor instanceof Date
      ? booking.scheduledFor
      : booking.scheduledFor?.toDate?.();

    if (!scheduledDate || Number.isNaN(scheduledDate.getTime())) {
      return 'Horaire à définir';
    }

    return format(scheduledDate, 'HH:mm');
  };

  const getServiceLabel = (booking: Booking) => {
    switch (booking.serviceType) {
      case 'local':
        return '📍 Local';
      case 'long_distance':
        return '🛣️ Longue distance';
      default:
        return '📍 Trajet';
    }
  };

  const getServiceTitle = (booking: Booking) => {
    switch (booking.serviceType) {
      case 'local':
        return 'Accompagnement local';
      case 'long_distance':
        return 'Accompagnement longue distance';
      default:
        return 'Accompagnement trajet';
    }
  };

  const getTripSummary = (booking: Booking) => {
    const departure = booking.trip?.departure?.address || 'Départ à définir';
    const arrival = booking.trip?.arrival?.address || 'Arrivée à définir';
    return `${departure} → ${arrival}`;
  };

  const getBookingNotes = (booking: Booking) => {
    return booking.additionalInfo || booking.internalNotes || '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée',
      assigned: 'Assignée', in_progress: 'En cours', completed: 'Terminée',
    };
    return labels[status] || status;
  };

  if (loading || !isAuthenticated || !isAccompanist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/accompanist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
              <p className="text-gray-600 mt-1">Votre calendrier de missions</p>
            </div>
          </div>
        </div>

        {/* Contrôles de navigation */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Mode vue */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                  >
                    {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
                  </Button>
                ))}
              </div>

              {/* Navigation temporelle */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goPrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Aujourd&apos;hui
                </Button>
                <Button variant="outline" size="sm" onClick={goNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Titre période */}
              <p className="text-lg font-semibold capitalize">{periodTitle}</p>
            </div>
          </CardContent>
        </Card>

        {loadingBookings ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : viewMode === 'month' ? (
          /* Vue Mois - Grille calendrier */
          <Card>
            <CardContent className="py-4">
              {/* En-têtes jours */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                  <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">
                    {d}
                  </div>
                ))}
              </div>
              {/* Grille des jours */}
              <div className="grid grid-cols-7 gap-1">
                {displayDays.map((day) => {
                  const missions = getMissionsForDay(day);
                  const today = isToday(day);
                  const currentMonth = isSameMonth(day, currentDate);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        today ? 'bg-blue-50 border-blue-300' : currentMonth ? 'bg-white' : 'bg-gray-50 opacity-60'
                      }`}
                      onClick={() => {
                        setCurrentDate(day);
                        setViewMode('day');
                      }}
                    >
                      <p
                        className={`text-sm font-medium mb-1 ${
                          today ? 'text-blue-600' : currentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {format(day, 'd')}
                      </p>
                      {missions.slice(0, 2).map((m) => (
                        <div
                          key={m.id}
                          className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${getStatusColor(m.status)}`}
                        >
                          {getBookingTimeLabel(m)}
                        </div>
                      ))}
                      {missions.length > 2 && (
                        <p className="text-xs text-gray-500">+{missions.length - 2} autre(s)</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'week' ? (
          /* Vue Semaine */
          <div className="space-y-2">
            {displayDays.map((day) => {
              const missions = getMissionsForDay(day);
              const today = isToday(day);

              return (
                <Card key={day.toISOString()} className={today ? 'border-blue-300 bg-blue-50/30' : ''}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 text-center w-16 py-2 rounded-lg ${
                          today ? 'bg-blue-600 text-white' : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-xs uppercase">
                          {format(day, 'EEE', { locale: fr })}
                        </p>
                        <p className="text-lg font-bold">{format(day, 'd')}</p>
                      </div>

                      <div className="flex-1">
                        {missions.length === 0 ? (
                          <p className="text-sm text-gray-400 italic py-2">Pas de mission</p>
                        ) : (
                          <div className="space-y-2">
                            {missions.map((mission) => (
                              <Link
                                key={mission.id}
                                href={`/dashboard/accompanist/missions/${mission.id}`}
                                className="block"
                              >
                                <div
                                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${getStatusColor(mission.status)}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {getServiceLabel(mission)}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs mt-1 opacity-75">
                                        <Clock className="h-3 w-3" />
                                        {getBookingTimeLabel(mission)}
                                        {mission.youngsters && mission.youngsters.length > 0 && (
                                          <>
                                            <Users className="h-3 w-3 ml-2" />
                                            {mission.youngsters.length} jeune(s)
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {getStatusLabel(mission.status)}
                                    </Badge>
                                    <Eye className="h-4 w-4 opacity-50" />
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Vue Jour */
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </CardTitle>
              <CardDescription>
                {getMissionsForDay(currentDate).length} mission(s) prévue(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getMissionsForDay(currentDate).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune mission ce jour</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getMissionsForDay(currentDate).map((mission) => (
                    <Link
                      key={mission.id}
                      href={`/dashboard/accompanist/missions/${mission.id}`}
                      className="block"
                    >
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {mission.serviceType === 'local' ? '📍' : '🛣️'}
                            </span>
                            <h3 className="font-medium">
                              {getServiceTitle(mission)}
                            </h3>
                          </div>
                          <Badge variant="outline">{getStatusLabel(mission.status)}</Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            {getBookingTimeLabel(mission)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {getTripSummary(mission)}
                          </div>
                          {mission.youngsters && mission.youngsters.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              {mission.youngsters.length} jeune(s)
                            </div>
                          )}
                        </div>

                        {getBookingNotes(mission) && (
                          <p className="mt-3 text-sm text-gray-500 bg-yellow-50 p-2 rounded">
                            📋 {getBookingNotes(mission)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Résumé rapide */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {allBookings.filter((b) => b.status === 'assigned' || b.status === 'confirmed' || b.status === 'paid').length}
                </p>
                <p className="text-xs text-gray-500">À venir</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {allBookings.filter((b) => b.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {allBookings.filter((b) => b.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500">Terminées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{allBookings.length}</p>
                <p className="text-xs text-gray-500">Total missions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
