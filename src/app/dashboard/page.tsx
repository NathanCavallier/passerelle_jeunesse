'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { logout } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { ActiveMissions } from '@/components/mission/active-missions';
import { MobileShell } from '@/components/pwa/mobile-shell';
import { PWA_TEST_MODE } from '@/lib/test-config';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Unsubscribe } from 'firebase/firestore';
import type { Booking } from '@/types/firestore';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  AlertCircle,
  Gift,
  BarChart3,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isEmailVerified, isAccompanist, isAdmin } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [unsubscribeRef, setUnsubscribeRef] = useState<Unsubscribe | null>(null);

  // Fonction pour gérer les erreurs avec toast
  const handleBookingError = useCallback((error: any) => {
    console.error('Erreur lors de l\'écoute des réservations:', error);
    toast({
      variant: 'destructive',
      title: 'Erreur',
      description: 'Impossible de charger vos réservations',
    });
    setLoadingBookings(false);
  }, [toast]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Rediriger les admins vers leur espace dédié
    if (!loading && isAdmin) {
      router.push('/dashboard/admin');
      return;
    }

    // Rediriger les accompagnateurs vers leur espace dédié
    if (!loading && isAccompanist) {
      router.push('/dashboard/accompanist');
      return;
    }
  }, [loading, isAuthenticated, isAccompanist, isAdmin, router]);

  // Écouter les bookings en temps réel
  useEffect(() => {
    // Vérifier si on est sur la page dashboard parent (pas accompagnateur)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isParentDashboard = currentPath === '/dashboard';
    
    // Ne charger que si on est sur le dashboard parent et authentifié comme parent
    if (!isParentDashboard || !isAuthenticated || !user || loadingBookings || isAccompanist) {
      setLoadingBookings(false);
      return;
    }

    // Nettoyage de l'ancienne souscription
    if (unsubscribeRef) {
      unsubscribeRef();
    }

    setLoadingBookings(true);
    
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('parentId', '==', user.uid)
    );

    // Listener en temps réel
    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));
        
        // Trier côté client par createdAt décroissant
        bookingsData.sort((a, b) => {
          const timeA = a.createdAt?.toDate().getTime() || 0;
          const timeB = b.createdAt?.toDate().getTime() || 0;
          return timeB - timeA;
        });
        
        setBookings(bookingsData);
        setLastUpdate(new Date());
        setLoadingBookings(false);

        // Détection de changement de statut pour notification
        if (snapshot.docChanges().length > 0) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const booking = { id: change.doc.id, ...change.doc.data() } as Booking;
              if (booking.missionTracking?.currentStatus) {
                toast({
                  title: 'Mise à jour de mission',
                  description: `La mission pour ${booking.youngsterName || 'votre enfant'} a été mise à jour`,
                });
              }
            }
          });
        }
      },
      (error) => {
        console.error('Erreur lors de l\'écoute des réservations:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger vos réservations',
        });
        setLoadingBookings(false);
      }
    );

    // Cleanup à la destruction du composant
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]); // Retirer toast des dépendances pour éviter la boucle infinie

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt sur Passerelle Jeunesse !',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la déconnexion',
      });
    }
  }, [toast, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[300px]" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user || !userProfile) {
    return null;
  }

  return (
    <MobileShell
      unreadMessages={0}
      pendingBookings={bookings.filter(b => b.status === 'pending').length}
    >
    <div className="flex flex-col min-h-dvh bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="space-y-6">
          {/* En-tête */}
          <Card className="border-none shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Bonjour, {userProfile.firstName} 👋
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Bienvenue sur votre tableau de bord
                  </p>
                </div>
                <Button variant="secondary" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerte email non vérifié */}
          {!isEmailVerified && (
            <Alert className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                Votre email n'est pas encore vérifié. Vérifiez votre boîte de réception pour activer toutes les fonctionnalités.
              </AlertDescription>
            </Alert>
          )}

          {/* Missions en cours (suivi temps réel) */}
          {userProfile.role === 'parent' && (
            <ActiveMissions 
              bookings={bookings}
              lastUpdate={lastUpdate}
            />
          )}

          {/* Cartes de navigation */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/profile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-purple-200 bg-gradient-to-br from-purple-50 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Mon profil
                  </CardTitle>
                  <CardDescription>
                    Gérez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50">
                    Modifier mon profil
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-green-200 bg-gradient-to-br from-green-50 to-background" onClick={() => router.push('/dashboard/bookings')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Mes réservations
                </CardTitle>
                <CardDescription>
                  Consultez et créez vos prestations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {loadingBookings ? '...' : bookings.length}
                </p>
                <p className="text-sm text-muted-foreground">réservation(s)</p>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-green-300 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/bookings/new');
                  }}
                >
                  Nouvelle réservation
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-emerald-200 bg-gradient-to-br from-emerald-50 to-background" onClick={() => router.push('/dashboard/payments')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Paiements
                </CardTitle>
                <CardDescription>
                  Historique et factures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-emerald-300 hover:bg-emerald-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/payments');
                  }}
                >
                  Voir l'historique
                </Button>
              </CardContent>
            </Card>

            {userProfile.role === 'parent' && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-pink-200 bg-gradient-to-br from-pink-50 to-background" onClick={() => router.push('/dashboard/youngsters')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-600" />
                    Mes jeunes
                  </CardTitle>
                  <CardDescription>
                    Gérez les profils de vos enfants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {userProfile.parentProfile?.numberOfYoungsters || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">jeune(s) enregistré(s)</p>
                </CardContent>
              </Card>
            )}

            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-orange-200 bg-gradient-to-br from-orange-50 to-background" onClick={() => router.push('/dashboard/notifications')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Gérez vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-300 hover:bg-orange-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/notifications');
                  }}
                >
                  Configurer
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-slate-200 bg-gradient-to-br from-slate-50 to-background" onClick={() => router.push('/dashboard/settings')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Paramètres
                </CardTitle>
                <CardDescription>
                  Personnalisez votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-300 hover:bg-slate-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/settings');
                  }}
                >
                  Accéder
                </Button>
              </CardContent>
            </Card>

            {userProfile.role === 'parent' && userProfile.parentProfile && (
              <Link href="/dashboard/loyalty">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-yellow-200 bg-gradient-to-br from-yellow-50 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-yellow-600" />
                      Programme de fidélité
                    </CardTitle>
                    <CardDescription>
                      Vos points et récompenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-yellow-600">
                      {userProfile.parentProfile.loyaltyPoints}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">points de fidélité</p>
                    <Button variant="outline" className="w-full">
                      Voir mes récompenses
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {userProfile.role === 'parent' && userProfile.parentProfile && (
              <Link href="/dashboard/referral">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-blue-200 bg-gradient-to-br from-blue-50 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Programme de parrainage
                    </CardTitle>
                    <CardDescription>
                      Partagez et gagnez des récompenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold font-mono text-blue-600 mb-1">
                      {userProfile.parentProfile.referralCode}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">votre code de parrainage</p>
                    <Button variant="outline" className="w-full">
                      Partager mon code
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {userProfile.role === 'parent' && (
              <Link href="/dashboard/calendar">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-cyan-200 bg-gradient-to-br from-cyan-50 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-cyan-600" />
                      Calendrier
                    </CardTitle>
                    <CardDescription>
                      Vue mensuelle de vos missions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full border-cyan-300 hover:bg-cyan-50">
                      Voir le calendrier
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}

            {userProfile.role === 'parent' && (
              <Link href="/dashboard/stats">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-indigo-200 bg-gradient-to-br from-indigo-50 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      Statistiques
                    </CardTitle>
                    <CardDescription>
                      Analysez votre activité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Graphiques, KPIs et impact environnemental
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir les statistiques
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          {/* Informations du profil */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informations du compte
              </CardTitle>
              <CardDescription>
                Détails de votre compte Passerelle Jeunesse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Email :</span>
                <span className="font-medium">{user.email}</span>

                <span className="text-muted-foreground">Nom complet :</span>
                <span className="font-medium">
                  {userProfile.firstName} {userProfile.lastName}
                </span>

                <span className="text-muted-foreground">Téléphone :</span>
                <span className="font-medium">{userProfile.phoneNumber}</span>

                <span className="text-muted-foreground">Rôle :</span>
                <span className="font-medium capitalize">{userProfile.role}</span>

                <span className="text-muted-foreground">Email vérifié :</span>
                <span className="font-medium">
                  {isEmailVerified ? '✅ Oui' : '❌ Non'}
                </span>

                {userProfile.role === 'parent' && userProfile.parentProfile && (
                  <>
                    <span className="text-muted-foreground">Points de fidélité :</span>
                    <span className="font-medium text-yellow-600">
                      {userProfile.parentProfile.loyaltyPoints} points
                    </span>

                    <span className="text-muted-foreground">Code de parrainage :</span>
                    <span className="font-medium font-mono text-blue-600">
                      {userProfile.parentProfile.referralCode}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
    </MobileShell>
  );
}
