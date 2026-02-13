/**
 * Page de gestion des jeunes
 * Permet aux parents d'ajouter, modifier et supprimer les profils des jeunes
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getYoungsters } from '@/lib/firestore-service';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AddYoungsterForm from '@/components/youngsters/add-youngster-form';
import YoungsterCard from '@/components/youngsters/youngster-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function YoungstersPage() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, loading: authLoading } = useAuth();
  const [youngsters, setYoungsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadYoungsters = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getYoungsters(user.uid);
      setYoungsters(data);
    } catch (error) {
      console.error('Erreur lors du chargement des jeunes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadYoungsters();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* En-tête */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Mes jeunes</h1>
                <p className="text-muted-foreground">
                  Gérez les profils des jeunes accompagnés
                </p>
              </div>
            </div>

            {/* Barre d'actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {youngsters.length} {youngsters.length > 1 ? 'jeunes enregistrés' : 'jeune enregistré'}
                </span>
              </div>
              <AddYoungsterForm onSuccess={loadYoungsters} />
            </div>
          </div>

          {/* Message d'information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Confidentialité et sécurité</AlertTitle>
            <AlertDescription>
              Toutes les informations saisies sont cryptées et sécurisées. Elles ne seront partagées 
              qu'avec les accompagnateurs assignés à vos missions et ne seront jamais divulguées à des tiers.
            </AlertDescription>
          </Alert>

          {/* Liste des jeunes */}
          {youngsters.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucun jeune enregistré</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Commencez par ajouter le profil d'un jeune pour pouvoir réserver des prestations.
              </p>
              <AddYoungsterForm onSuccess={loadYoungsters} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {youngsters.map((youngster) => (
                <YoungsterCard
                  key={youngster.id}
                  youngster={youngster}
                  parentId={user.uid}
                  onUpdate={loadYoungsters}
                />
              ))}
            </div>
          )}

          {/* Informations complémentaires */}
          <div className="rounded-lg bg-muted p-6">
            <h3 className="mb-2 font-semibold">Pourquoi ces informations ?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Les informations médicales permettent d'assurer la sécurité de votre enfant</li>
              <li>• Le contact d'urgence sera utilisé uniquement en cas d'absolue nécessité</li>
              <li>• Les autorisations définissent ce qui est permis lors des accompagnements</li>
              <li>• Vous pouvez modifier ces informations à tout moment</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
