/**
 * Dashboard principal de l'espace accompagnateur
 * Affiche les missions assignées, le planning, et les outils de suivi
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PWAInstallBanner } from '@/components/pwa/install-banner';
import { TestModeBanner } from '@/components/testing/test-mode-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Unsubscribe } from 'firebase/firestore';
import type { Booking } from '@/types/firestore';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Navigation,
  Camera,
  MessageSquare,
  Settings,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  User,
  Star,
  TestTube2,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AccompanistDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();
  
  const [assignedBookings, setAssignedBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Fonction de gestion d'erreur avec toast
  const handleBookingError = useCallback((error: any) => {
    console.error('Erreur lors du chargement des missions:', error);
    setLoadingBookings(false);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de charger vos missions assignées."
    });
  }, [toast]);
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && !isAccompanist) {
      router.push('/dashboard'); // Redirer vers dashboard parent si pas accompagnateur
      return;
    }
  }, [loading, isAuthenticated, isAccompanist, router]);

  // Écouter les missions assignées en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user || !isAccompanist) return;

    setLoadingBookings(true);

    // Query pour récupérer les bookings assignés à cet accompagnateur
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('accompanistId', '==', user.uid),
      where('status', 'in', ['confirmed', 'paid', 'assigned', 'in_progress']),
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
              scheduledFor: data.scheduledFor?.toDate?.() || data.scheduledFor,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as Booking);
        });
        
        setAssignedBookings(bookingsList);
        setLoadingBookings(false);
        setLastUpdate(new Date());
        
        console.log(`📋 ${bookingsList.length} missions assignées chargées`);
      },
      handleBookingError
    );

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid, isAccompanist, handleBookingError]); // Retirer toast, utiliser user.uid au lieu de user

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès."
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion."
      });
    }
  }, [toast, router]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "secondary" as const, label: "Confirmée" },
      paid: { variant: "default" as const, label: "Payée" },
      assigned: { variant: "default" as const, label: "Assignée" },
      in_progress: { variant: "default" as const, label: "En cours" }
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
      scheduled: { variant: "outline" as const, label: "Programmée" },
      en_route_to_pickup: { variant: "secondary" as const, label: "En route" },
      waiting_at_pickup: { variant: "secondary" as const, label: "Sur place" },
      picked_up: { variant: "default" as const, label: "Prise en charge" },
      en_route_to_destination: { variant: "default" as const, label: "En transport" },
      waiting_at_destination: { variant: "default" as const, label: "À destination" },
      dropped_off: { variant: "default" as const, label: "Déposé" },
      en_route_to_return: { variant: "default" as const, label: "Retour" },
      waiting_at_return: { variant: "default" as const, label: "Attente retour" },
      completed: { variant: "secondary" as const, label: "Terminée" }
    };

    const currentStatus = missionTracking.currentStatus || 'scheduled';
    const config = statusConfig[currentStatus as keyof typeof statusConfig] || 
                  { variant: "outline" as const, label: currentStatus };

    return (
      <Badge variant={config.variant}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PWAInstallBanner />
      <TestModeBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête du dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour {userProfile?.firstName} ! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Accompagnateur Passerelle Jeunesse
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                ⚡ Mis à jour {format(lastUpdate, 'HH:mm', { locale: fr })}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missions assignées</p>
                  <p className="text-2xl font-bold">{assignedBookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missions terminées</p>
                  <p className="text-2xl font-bold">{userProfile?.accompanistProfile?.totalMissions || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold">{userProfile?.accompanistProfile?.rating?.toFixed(1) || 'N/A'}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                  <p className="text-2xl font-bold">{userProfile?.accompanistProfile?.totalEarnings?.toFixed(0) || '0'}€</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation rapide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/accompanist/missions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Mes missions</h3>
                <p className="text-sm text-gray-600 mt-1">Planning complet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/accompanist/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Mon profil</h3>
                <p className="text-sm text-gray-600 mt-1">Infos & disponibilités</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/accompanist/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Messages</h3>
                <p className="text-sm text-gray-600 mt-1">Chat avec les parents</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/accompanist/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Paramètres</h3>
                <p className="text-sm text-gray-600 mt-1">Configuration</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Outils de développement PWA */}
        <Card className="mb-8 border-dashed border-blue-300 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Outils PWA Mobile (Phase 5)
            </CardTitle>
            <CardDescription className="text-blue-600">
              Tests et validation des fonctionnalités mobiles avancées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/accompanist/test">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
                  <CardContent className="p-4 text-center">
                    <TestTube2 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Tests PWA</h4>
                    <p className="text-xs text-gray-600 mt-1">Validation mobile</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/dashboard/accompanist/missions">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
                  <CardContent className="p-4 text-center">
                    <Navigation className="h-10 w-10 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Navigation GPS</h4>
                    <p className="text-xs text-gray-600 mt-1">Tester dans missions</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Missions assignées */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Missions assignées</CardTitle>
                <CardDescription>
                  Vos prochaines missions d'accompagnement
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                🔴 Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Chargement des missions...</span>
              </div>
            ) : assignedBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Aucune mission assignée
                </h3>
                <p className="text-gray-500">
                  Vous n'avez actuellement aucune mission programmée.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedBookings.map((booking) => (
                  <Link 
                    key={booking.id} 
                    href={`/dashboard/accompanist/missions/${booking.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">
                                {booking.trip.departure.address}
                                <span className="mx-2 text-gray-400">→</span>
                                {booking.trip.arrival.address}
                              </h4>
                              {getStatusBadge(booking.status)}
                              {getMissionStatusBadge(booking.missionTracking)}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {format(booking.scheduledFor instanceof Date ? booking.scheduledFor : booking.scheduledFor.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr })}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                {booking.youngsters.length} jeune{booking.youngsters.length > 1 ? 's' : ''}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {booking.trip.connections ? 'Avec correspondance' : 'Direct'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Navigation className="h-5 w-5 text-blue-600" />
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
      </main>

      <Footer />
    </div>
  );
}