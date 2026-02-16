/**
 * Page de messagerie pour l'accompagnateur
 * Communication avec les parents des missions
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ArrowLeft,
  MessageSquare,
  Info,
  Rocket
} from 'lucide-react';

export default function AccompanistMessagesPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();

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

  if (loading || !isAuthenticated || !isAccompanist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/accompanist">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              Communication avec les familles
            </p>
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Messagerie en cours de développement
              </h2>
              
              <p className="text-gray-600 mb-8">
                La messagerie instantanée avec les familles sera bientôt disponible ! 
                Vous pourrez échanger en temps réel pour coordonner les détails de chaque mission.
              </p>

              <Alert className="text-left">
                <Info className="h-4 w-4" />
                <AlertTitle>Fonctionnalités prévues</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Chat en temps réel avec les parents</li>
                    <li>Notifications push pour nouveaux messages</li>
                    <li>Partage de photos et localisation</li>
                    <li>Messages automatiques aux étapes clés</li>
                    <li>Historique des conversations par mission</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium">En attendant, vous pouvez :</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard/accompanist/missions">
                    <Button variant="outline">
                      📋 Consulter vos missions
                    </Button>
                  </Link>
                  <Button variant="outline" disabled>
                    📞 Appel téléphonique direct
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}