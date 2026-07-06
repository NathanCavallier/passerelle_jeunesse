'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { TestModeBanner } from '@/components/testing/test-mode-banner';
import GlobalNotificationSettings from '@/components/notifications/global-notification-settings';
import EventNotificationSettings from '@/components/notifications/event-notification-settings';
import SummaryNotificationSettings from '@/components/notifications/summary-notification-settings';
import FCMNotificationSettings from '@/components/notifications/fcm-notification-settings';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Save, RotateCcw } from 'lucide-react';
import type {
  NotificationPreferences,
  NotificationChannel,
  NotificationEventType
} from '@/types/firestore';
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
  toggleGlobalChannel,
  updateEventPreferences,
  updateQuietHours,
  getDefaultNotificationPreferences
} from '@/lib/notifications-service';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Redirection si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Chargement des préférences
  useEffect(() => {
    if (user?.uid) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const prefs = await getUserNotificationPreferences(user.uid);
      setPreferences(prefs);
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger vos préférences. Les paramètres par défaut seront utilisés.',
        variant: 'destructive',
      });
      // Utiliser les préférences par défaut
      setPreferences({
        ...(getDefaultNotificationPreferences() as any),
        updatedAt: new Date() as any
      } as NotificationPreferences);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChannel = async (channel: NotificationChannel, enabled: boolean) => {
    if (!user?.uid || !preferences) return;

    try {
      setIsSaving(true);
      setHasChanges(true);

      await toggleGlobalChannel(user.uid, channel, enabled);

      // Mettre à jour l'état local
      setPreferences(prev => prev ? {
        ...prev,
        globalSettings: {
          ...prev.globalSettings,
          [channel]: {
            ...prev.globalSettings[channel],
            enabled
          }
        }
      } : null);

      toast({
        title: 'Paramètres sauvegardés',
        description: `Notifications ${channel} ${enabled ? 'activées' : 'désactivées'}`,
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Erreur toggle canal:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuietHours = async (
    channel: NotificationChannel,
    quietHours: { start: string; end: string } | undefined
  ) => {
    if (!user?.uid || !preferences) return;

    try {
      setIsSaving(true);
      setHasChanges(true);

      await updateQuietHours(user.uid, channel, quietHours);

      // Mettre à jour l'état local
      setPreferences(prev => prev ? {
        ...prev,
        globalSettings: {
          ...prev.globalSettings,
          [channel]: {
            ...prev.globalSettings[channel],
            quietHours
          }
        }
      } : null);

      toast({
        title: 'Heures silencieuses mises à jour',
        description: quietHours
          ? `${channel}: ${quietHours.start} - ${quietHours.end}`
          : `Heures silencieuses désactivées pour ${channel}`,
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Erreur heures silencieuses:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les heures silencieuses',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEventPreferences = async (
    eventType: NotificationEventType,
    channel: NotificationChannel,
    enabled: boolean
  ) => {
    if (!user?.uid || !preferences) return;

    try {
      setIsSaving(true);
      setHasChanges(true);

      await updateEventPreferences(user.uid, eventType, {
        [channel]: { enabled }
      });

      // Mettre à jour l'état local
      setPreferences(prev => prev ? {
        ...prev,
        events: {
          ...prev.events,
          [eventType]: {
            ...prev.events[eventType],
            [channel]: {
              ...prev.events[eventType][channel],
              enabled
            }
          }
        }
      } : null);

      setHasChanges(false);
    } catch (error) {
      console.error('Erreur mise à jour événement:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les préférences d\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSummarySettings = async (settings: {
    dailyEnabled?: boolean;
    weeklyEnabled?: boolean;
    preferredTime?: string;
  }) => {
    if (!user?.uid || !preferences) return;

    try {
      setIsSaving(true);
      setHasChanges(true);

      const updatedPrefs = {
        ...preferences,
        summary: {
          ...preferences.summary,
          ...settings
        }
      };

      await updateNotificationPreferences(user.uid, updatedPrefs);
      setPreferences(updatedPrefs);

      toast({
        title: 'Résumés mis à jour',
        description: 'Paramètres des résumés sauvegardés',
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Erreur mise à jour résumés:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les paramètres des résumés',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);
      const defaultPrefs = {
        ...(getDefaultNotificationPreferences() as any),
        updatedAt: new Date() as any
      } as NotificationPreferences;

      await updateNotificationPreferences(user.uid, defaultPrefs);
      setPreferences(defaultPrefs);

      toast({
        title: 'Paramètres réinitialisés',
        description: 'Les paramètres par défaut ont été rétablis',
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast({
        title: 'Erreur de réinitialisation',
        description: 'Impossible de réinitialiser les paramètres',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background">
        <Header />
        <TestModeBanner />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !preferences) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <TestModeBanner />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Settings className="h-8 w-8" />
                  Configuration des notifications
                </h1>
                <p className="text-muted-foreground mt-2">
                  Personnalisez vos préférences de notifications pour ne rien manquer d'important
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            {hasChanges && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary">
                  Modifications en cours...
                </Badge>
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="space-y-8">
            {/* Notifications push (FCM) */}
            <FCMNotificationSettings className="mb-6" />

            {/* Paramètres globaux */}
            <GlobalNotificationSettings
              preferences={preferences}
              isLoading={isSaving}
              onToggleChannel={handleToggleChannel}
              onUpdateQuietHours={handleUpdateQuietHours}
            />

            {/* Préférences par événement */}
            <EventNotificationSettings
              preferences={preferences}
              isLoading={isSaving}
              onUpdateEventPreferences={handleUpdateEventPreferences}
            />

            {/* Résumés et paramètres avancés */}
            <SummaryNotificationSettings
              preferences={preferences}
              isLoading={isSaving}
              onUpdateSummarySettings={handleUpdateSummarySettings}
            />
          </div>

          {/* Navigation rapide */}
          <div className="mt-12 p-6 bg-accent/50 rounded-lg">
            <h3 className="font-medium mb-3">Actions rapides</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Retour au dashboard
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="outline" size="sm">
                  Voir mes messages
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" size="sm">
                  Modifier mon profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
