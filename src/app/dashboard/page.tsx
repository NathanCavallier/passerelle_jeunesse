'use client';

import { useEffect } from 'react';
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
import { 
  User, 
  Calendar, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  AlertCircle 
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isEmailVerified } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
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
  };

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
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Bonjour, {userProfile.firstName} 👋
              </h1>
              <p className="text-muted-foreground">
                Bienvenue sur votre tableau de bord
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>

          {/* Alerte email non vérifié */}
          {!isEmailVerified && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Votre email n'est pas encore vérifié. Vérifiez votre boîte de réception pour activer toutes les fonctionnalités.
              </AlertDescription>
            </Alert>
          )}

          {/* Cartes de navigation */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mon profil
                </CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Modifier mon profil
                </Button>
              </CardContent>
            </Card>

            <Link href="/dashboard/bookings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Mes réservations
                  </CardTitle>
                  <CardDescription>
                    Consultez et créez vos prestations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {userProfile.parentProfile?.totalBookings || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">réservation(s)</p>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/bookings/new">
                      Nouvelle réservation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Paiements
                </CardTitle>
                <CardDescription>
                  Historique et factures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Voir l'historique
                </Button>
              </CardContent>
            </Card>

            {userProfile.role === 'parent' && (
              <Link href="/dashboard/youngsters">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Mes jeunes
                    </CardTitle>
                    <CardDescription>
                      Gérez les profils de vos enfants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {userProfile.parentProfile?.numberOfYoungsters || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">jeune(s) enregistré(s)</p>
                  </CardContent>
                </Card>
              </Link>
            )}

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Gérez vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configurer
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres
                </CardTitle>
                <CardDescription>
                  Personnalisez votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Accéder
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Informations du profil */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
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
                    <span className="font-medium">
                      {userProfile.parentProfile.loyaltyPoints} points
                    </span>

                    <span className="text-muted-foreground">Code de parrainage :</span>
                    <span className="font-medium font-mono">
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
  );
}
