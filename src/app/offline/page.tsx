'use client';

import Link from 'next/link';
import { WifiOff, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <WifiOff className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Mode hors ligne</CardTitle>
          <CardDescription className="text-base">
            Vous n&apos;êtes pas connecté à Internet. Certaines fonctionnalités sont limitées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4 text-sm text-orange-800 dark:text-orange-200">
            <p className="font-medium mb-2">Disponible hors ligne :</p>
            <ul className="text-left space-y-1">
              <li>• Consultation des réservations en cache</li>
              <li>• Lecture des messages précédents</li>
              <li>• Consultation du profil</li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Nécessite une connexion :</p>
            <ul className="text-left space-y-1">
              <li>• Nouvelle réservation</li>
              <li>• Envoi de messages</li>
              <li>• Paiements</li>
              <li>• Suivi temps réel</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button variant="ghost" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Vos données seront automatiquement synchronisées dès que la connexion sera rétablie.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
