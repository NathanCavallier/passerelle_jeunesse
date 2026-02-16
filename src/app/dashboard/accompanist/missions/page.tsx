/**
 * Page des missions de l'accompagnateur
 * Affichage, filtrage et gestion des missions assignées
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { Booking } from '@/types/firestore';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Navigation,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AccompanistMissionsPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();
  
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

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

  // Écouter toutes les missions de l'accompagnateur
  useEffect(() => {
    if (!isAuthenticated || !user || !isAccompanist) return;

    setLoadingBookings(true);

    // Query pour récupérer TOUTES les bookings assignés (même annulés/terminés)
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('accompanistId', '==', user.uid),
      orderBy('scheduledDate', 'desc')
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
        
        console.log(`📋 ${bookingsList.length} missions chargées`);
      },
      (error) => {
        console.error('Erreur lors du chargement des missions:', error);
        setLoadingBookings(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos missions."
        });
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user, isAccompanist, toast]);

  // Filtrer les missions par onglet
  const getFilteredBookings = (tab: string) => {
    const now = startOfDay(new Date());

    switch (tab) {
      case 'upcoming':
        return allBookings.filter(booking => {
          const scheduledDate = booking.scheduledFor instanceof Date ? booking.scheduledFor : booking.scheduledFor.toDate();
          return isAfter(scheduledDate, now) && 
            !['cancelled', 'completed'].includes(booking.status);
        });
      case 'past':
        return allBookings.filter(booking => {
          const scheduledDate = booking.scheduledFor instanceof Date ? booking.scheduledFor : booking.scheduledFor.toDate();
          return isBefore(scheduledDate, now) || 
            ['completed'].includes(booking.status);
        });
      case 'cancelled':
        return allBookings.filter(booking => booking.status === 'cancelled');
      default:
        return allBookings;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "En attente" },
      confirmed: { variant: "secondary" as const, label: "Confirmée" },
      paid: { variant: "default" as const, label: "Payée" },
      assigned: { variant: "default" as const, label: "Assignée" },
      in_progress: { variant: "default" as const, label: "En cours" },
      completed: { variant: "secondary" as const, label: "Terminée" },
      cancelled: { variant: "destructive" as const, label: "Annulée" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { variant: "secondary" as const, label: status };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getMissionStatusBadge = (missionTracking?: any) => {
    if (!missionTracking) {
      return <Badge variant="outline">Programmée</Badge>;
    }

    const statusConfig = {
      scheduled: { variant: "outline" as const, label: "Programmée", icon: Calendar },
      en_route_to_pickup: { variant: "secondary" as const, label: "En route", icon: Navigation },
      waiting_at_pickup: { variant: "secondary" as const, label: "Sur place", icon: Clock },
      picked_up: { variant: "default" as const, label: "Prise en charge", icon: Users },
      en_route_to_destination: { variant: "default" as const, label: "En transport", icon: Navigation },
      waiting_at_destination: { variant: "default" as const, label: "À destination", icon: MapPin },
      dropped_off: { variant: "default" as const, label: "Déposé", icon: CheckCircle },
      en_route_to_return: { variant: "default" as const, label: "Retour", icon: Navigation },
      waiting_at_return: { variant: "default" as const, label: "Attente retour", icon: Clock },
      completed: { variant: "secondary" as const, label: "Terminée", icon: CheckCircle }
    };

    const currentStatus = missionTracking.currentStatus || 'scheduled';
    const config = statusConfig[currentStatus as keyof typeof statusConfig] || 
                  { variant: "outline" as const, label: currentStatus, icon: AlertCircle };

    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading || !isAuthenticated || !isAccompanist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const upcomingBookings = getFilteredBookings('upcoming');
  const pastBookings = getFilteredBookings('past');
  const cancelledBookings = getFilteredBookings('cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/accompanist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes missions</h1>
              <p className="text-gray-600 mt-1">
                Gestion complète de vos missions d'accompagnement
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">À venir</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{pastBookings.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold text-red-600">{cancelledBookings.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs des missions */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              À venir ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Terminées ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Annulées ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <MissionsList 
              bookings={upcomingBookings} 
              loading={loadingBookings}
              emptyMessage="Aucune mission programmée"
              emptyDescription="Vous n'avez actuellement aucune mission à venir."
              getStatusBadge={getStatusBadge}
              getMissionStatusBadge={getMissionStatusBadge}
            />
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <MissionsList 
              bookings={pastBookings} 
              loading={loadingBookings}
              emptyMessage="Aucune mission terminée"
              emptyDescription="Vous n'avez encore terminé aucune mission."
              getStatusBadge={getStatusBadge}
              getMissionStatusBadge={getMissionStatusBadge}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <MissionsList 
              bookings={cancelledBookings} 
              loading={loadingBookings}
              emptyMessage="Aucune mission annulée"
              emptyDescription="Vous n'avez aucune mission annulée."
              getStatusBadge={getStatusBadge}
              getMissionStatusBadge={getMissionStatusBadge}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

// Composant pour afficher la liste des missions
function MissionsList({ 
  bookings, 
  loading, 
  emptyMessage, 
  emptyDescription,
  getStatusBadge,
  getMissionStatusBadge 
}: {
  bookings: Booking[];
  loading: boolean;
  emptyMessage: string;
  emptyDescription: string;
  getStatusBadge: (status: string) => React.ReactElement;
  getMissionStatusBadge: (missionTracking?: any) => React.ReactElement;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500">
            {emptyDescription}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Link 
          key={booking.id} 
          href={`/dashboard/accompanist/missions/${booking.id}`}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-lg">
                      {booking.trip.departure.address}
                      <span className="mx-2 text-gray-400">→</span>
                      {booking.trip.arrival.address}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(booking.status)}
                    {getMissionStatusBadge(booking.missionTracking)}
                  </div>
                </div>
                
                <div className="ml-4">
                  <Eye className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {format(booking.scheduledFor instanceof Date ? booking.scheduledFor : booking.scheduledFor.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {booking.youngsters.length} jeune{booking.youngsters.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {booking.trip.connections ? 'Avec correspondance' : 'Direct'}
                </div>
                <div className="flex items-center text-gray-600">
                  <Navigation className="h-4 w-4 mr-2" />
                  {booking.serviceType === 'local' ? 'Local' : 'Longue distance'}
                </div>
              </div>

              {/* Jeunes à accompagner */}
              {booking.youngsters.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-500 mb-2">Jeunes à accompagner :</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.youngsters.map((youngster, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {youngster.firstName}, {youngster.age} ans
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}