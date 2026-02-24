/**
 * Composant de configuration des canaux globaux de notifications
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings } from 'lucide-react';
import type { NotificationPreferences, NotificationChannel } from '@/types/firestore';
import { getChannelLabels } from '@/lib/notifications-service';

interface GlobalNotificationSettingsProps {
  preferences: NotificationPreferences;
  isLoading: boolean;
  onToggleChannel: (channel: NotificationChannel, enabled: boolean) => Promise<void>;
  onUpdateQuietHours: (channel: NotificationChannel, quietHours: { start: string; end: string } | undefined) => Promise<void>;
}

export default function GlobalNotificationSettings({
  preferences,
  isLoading,
  onToggleChannel,
  onUpdateQuietHours
}: GlobalNotificationSettingsProps) {
  const channelLabels = getChannelLabels();
  const [expandedChannel, setExpandedChannel] = useState<NotificationChannel | null>(null);
  const [quietHoursData, setQuietHoursData] = useState<Record<NotificationChannel, { start: string; end: string; enabled: boolean }>>({
    email: {
      start: preferences.globalSettings.email.quietHours?.start || '22:00',
      end: preferences.globalSettings.email.quietHours?.end || '08:00',
      enabled: !!preferences.globalSettings.email.quietHours
    },
    sms: {
      start: preferences.globalSettings.sms.quietHours?.start || '22:00',
      end: preferences.globalSettings.sms.quietHours?.end || '08:00',
      enabled: !!preferences.globalSettings.sms.quietHours
    },
    push: {
      start: preferences.globalSettings.push.quietHours?.start || '22:00',
      end: preferences.globalSettings.push.quietHours?.end || '08:00',
      enabled: !!preferences.globalSettings.push.quietHours
    }
  });

  const handleToggleChannel = async (channel: NotificationChannel, enabled: boolean) => {
    try {
      await onToggleChannel(channel, enabled);
    } catch (error) {
      console.error('Erreur toggle canal:', error);
    }
  };

  const handleToggleQuietHours = async (channel: NotificationChannel, enabled: boolean) => {
    const newData = {
      ...quietHoursData,
      [channel]: { ...quietHoursData[channel], enabled }
    };
    setQuietHoursData(newData);

    try {
      await onUpdateQuietHours(
        channel,
        enabled ? { start: newData[channel].start, end: newData[channel].end } : undefined
      );
    } catch (error) {
      console.error('Erreur heures silencieuses:', error);
      // Revenir à l'état précédent en cas d'erreur
      setQuietHoursData(quietHoursData);
    }
  };

  const handleUpdateTime = async (channel: NotificationChannel, timeType: 'start' | 'end', value: string) => {
    const newData = {
      ...quietHoursData,
      [channel]: { ...quietHoursData[channel], [timeType]: value }
    };
    setQuietHoursData(newData);

    if (newData[channel].enabled) {
      try {
        await onUpdateQuietHours(channel, {
          start: newData[channel].start,
          end: newData[channel].end
        });
      } catch (error) {
        console.error('Erreur mise à jour horaire:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Paramètres globaux
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {(Object.entries(channelLabels) as [NotificationChannel, typeof channelLabels[NotificationChannel]][]).map(
          ([channel, { title, icon, description }]) => {
            const isChannelEnabled = preferences.globalSettings[channel].enabled;
            const hasQuietHours = quietHoursData[channel].enabled;
            
            return (
              <div key={channel} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{title}</span>
                        {!isChannelEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            Désactivé
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isChannelEnabled}
                    onCheckedChange={(enabled) => handleToggleChannel(channel, enabled)}
                    disabled={isLoading}
                  />
                </div>

                {isChannelEnabled && (
                  <div className="ml-8 space-y-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`quiet-hours-${channel}`} className="text-sm">
                          Heures silencieuses
                        </Label>
                      </div>
                      <Switch
                        id={`quiet-hours-${channel}`}
                        checked={hasQuietHours}
                        onCheckedChange={(enabled) => handleToggleQuietHours(channel, enabled)}
                        disabled={isLoading}
                      />
                    </div>

                    {hasQuietHours && (
                      <div className="grid grid-cols-2 gap-3 pl-6">
                        <div className="space-y-1">
                          <Label htmlFor={`start-${channel}`} className="text-xs text-muted-foreground">
                            Début
                          </Label>
                          <Input
                            id={`start-${channel}`}
                            type="time"
                            value={quietHoursData[channel].start}
                            onChange={(e) => handleUpdateTime(channel, 'start', e.target.value)}
                            disabled={isLoading}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`end-${channel}`} className="text-xs text-muted-foreground">
                            Fin
                          </Label>
                          <Input
                            id={`end-${channel}`}
                            type="time"
                            value={quietHoursData[channel].end}
                            onChange={(e) => handleUpdateTime(channel, 'end', e.target.value)}
                            disabled={isLoading}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />
              </div>
            );
          }
        )}

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                À propos des paramètres globaux
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Ces paramètres s'appliquent à tous les types de notifications</li>
                <li>• Les heures silencieuses empêchent l'envoi de notifications pendant ces créneaux</li>
                <li>• Vous pouvez personnaliser chaque type d'événement dans la section ci-dessous</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}