/**
 * Composant pour gérer l'activation des notifications push FCM
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useFCM } from '@/hooks/use-fcm';
import { Bell, Smartphone, AlertCircle, CheckCircle2, Settings, Info } from 'lucide-react';

interface FCMNotificationSettingsProps {
  className?: string;
}

export default function FCMNotificationSettings({ className }: FCMNotificationSettingsProps) {
  const {
    isSupported,
    isEnabled,
    isInitialized,
    permissionStatus,
    token,
    unreadCount,
    enableNotifications,
    disableNotifications,
    refreshToken,
    clearBadge,
    onNotificationReceived
  } = useFCM();

  const [isLoading, setIsLoading] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  /**
   * Gère l'activation/désactivation des notifications push
   */
  const handleToggleNotifications = async (enabled: boolean) => {
    setIsLoading(true);
    
    try {
      if (enabled) {
        const success = await enableNotifications();
        if (!success) {
          // L'erreur est déjà gérée dans le hook
          return;
        }
      } else {
        await disableNotifications();
      }
    } catch (error) {
      console.error('Erreur toggle notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envoie une notification de test
   */
  const sendTestNotification = () => {
    if (!isEnabled) return;

    // Simuler une notification locale
    const testPayload = {
      title: '🧪 Notification de test',
      body: 'Vos notifications push fonctionnent correctement !',
      icon: '/images/notification-icon.png',
      data: {
        type: 'test',
        url: '/dashboard/notifications'
      },
      timestamp: new Date().toISOString()
    };

    // Utiliser le système de notification du hook
    onNotificationReceived(() => {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    });

    // Déclencher la notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(testPayload.title, {
        body: testPayload.body,
        icon: testPayload.icon,
        badge: '/images/badge-icon.png',
        tag: 'test'
      });
    }
  };

  /**
   * Récupère l'icône de statut
   */
  const getStatusIcon = () => {
    if (!isSupported) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (!isEnabled) return <Bell className="h-5 w-5 text-gray-400" />;
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  };

  /**
   * Récupère le badge de statut
   */
  const getStatusBadge = () => {
    if (!isSupported) return <Badge variant="destructive">Non supporté</Badge>;
    if (!isInitialized) return <Badge variant="outline">Initialisation...</Badge>;
    if (permissionStatus === 'denied') return <Badge variant="destructive">Bloqué</Badge>;
    if (!isEnabled) return <Badge variant="secondary">Inactif</Badge>;
    return <Badge variant="default" className="bg-green-500">Actif</Badge>;
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Notifications Push non supportées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Votre navigateur ne supporte pas les notifications push. 
              Utilisez Chrome, Firefox, Safari ou Edge pour une expérience complète.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Notifications Push
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Recevez des notifications directement sur votre appareil même quand l'onglet est fermé
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isInitialized ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : (
          <>
            {/* Toggle principal */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Activer les notifications push</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Notifications temps réel sur cet appareil
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleNotifications}
                disabled={isLoading || permissionStatus === 'denied'}
              />
            </div>

            {/* Message d'aide selon l'état */}
            {permissionStatus === 'denied' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les notifications ont été bloquées. Cliquez sur l'icône de cadenas dans la barre d'adresse 
                  pour autoriser les notifications.
                </AlertDescription>
              </Alert>
            )}

            {permissionStatus === 'default' && !isEnabled && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Activez les notifications pour recevoir des alertes importantes même quand cette page n'est pas ouverte.
                </AlertDescription>
              </Alert>
            )}

            {isEnabled && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Notifications push activées ! Vous recevrez des alertes pour vos réservations et messages.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            {isEnabled && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendTestNotification}
                  disabled={isLoading}
                >
                  {testNotificationSent ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Notification envoyée
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Tester une notification
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshToken}
                  disabled={isLoading}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>

                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearBadge}
                  >
                    Effacer badge ({unreadCount})
                  </Button>
                )}
              </div>
            )}

            {/* Informations techniques (en développement uniquement) */}
            {process.env.NODE_ENV === 'development' && token && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Informations techniques
                </summary>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>Permission: {permissionStatus}</p>
                  <p>Token: {token.substring(0, 20)}...</p>
                  <p>Notifications non lues: {unreadCount}</p>
                </div>
              </details>
            )}

            {/* État de chargement */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <Progress value={undefined} className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  Configuration en cours...
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}