/**
 * Composant de configuration des notifications par événement
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, Bell, AlertTriangle, MessageSquare, CreditCard, Calendar, Star, User } from 'lucide-react';
import type { 
  NotificationPreferences, 
  NotificationEventType, 
  NotificationChannel,
  NotificationEventSettings 
} from '@/types/firestore';
import { getEventLabels, getChannelLabels } from '@/lib/notifications-service';

interface EventNotificationSettingsProps {
  preferences: NotificationPreferences;
  isLoading: boolean;
  onUpdateEventPreferences: (
    eventType: NotificationEventType, 
    channel: NotificationChannel, 
    enabled: boolean
  ) => Promise<void>;
}

// Icônes par type d'événement
const eventIcons: Record<NotificationEventType, any> = {
  booking_confirmed: Calendar,
  booking_cancelled: AlertTriangle,
  mission_status_update: Bell,
  new_message: MessageSquare,
  payment_processed: CreditCard,
  payment_failed: AlertTriangle,
  reminder_mission: Calendar,
  reminder_payment: CreditCard,
  review_request: Star,
  account_update: User,
};

// Couleurs par priorité
const eventPriority: Record<NotificationEventType, 'high' | 'medium' | 'low'> = {
  payment_failed: 'high',
  booking_cancelled: 'high',
  reminder_payment: 'high',
  mission_status_update: 'medium',
  new_message: 'medium',
  booking_confirmed: 'medium',
  reminder_mission: 'medium',
  payment_processed: 'low',
  review_request: 'low',
  account_update: 'low',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function EventNotificationSettings({
  preferences,
  isLoading,
  onUpdateEventPreferences
}: EventNotificationSettingsProps) {
  const eventLabels = getEventLabels();
  const channelLabels = getChannelLabels();
  const [openEvents, setOpenEvents] = useState<Set<NotificationEventType>>(new Set());

  const handleToggleEvent = (eventType: NotificationEventType) => {
    const newOpenEvents = new Set(openEvents);
    if (newOpenEvents.has(eventType)) {
      newOpenEvents.delete(eventType);
    } else {
      newOpenEvents.add(eventType);
    }
    setOpenEvents(newOpenEvents);
  };

  const handleChannelToggle = async (
    eventType: NotificationEventType, 
    channel: NotificationChannel, 
    enabled: boolean
  ) => {
    try {
      await onUpdateEventPreferences(eventType, channel, enabled);
    } catch (error) {
      console.error('Erreur mise à jour canal événement:', error);
    }
  };

  const countEnabledChannels = (eventSettings: NotificationEventSettings): number => {
    return Object.values(eventSettings).filter(setting => setting.enabled).length;
  };

  const isGlobalChannelEnabled = (channel: NotificationChannel): boolean => {
    return preferences.globalSettings[channel].enabled;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Préférences par événement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personnalisez les notifications pour chaque type d'événement
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.entries(eventLabels) as [NotificationEventType, typeof eventLabels[NotificationEventType]][]).map(
          ([eventType, { title, description }], index) => {
            const IconComponent = eventIcons[eventType];
            const priority = eventPriority[eventType]; 
            const eventSettings = preferences.events[eventType];
            const enabledChannels = countEnabledChannels(eventSettings);
            const isOpen = openEvents.has(eventType);
            
            return (
              <div key={eventType}>
                <Collapsible open={isOpen} onOpenChange={() => handleToggleEvent(eventType)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{title}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-0.5 ${priorityColors[priority]}`}
                          >
                            {priority === 'high' ? 'Urgent' : priority === 'medium' ? 'Important' : 'Info'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {enabledChannels}/3 activé{enabledChannels > 1 ? 's' : ''}
                      </Badge>
                      <ChevronDown 
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="pt-3 pb-2">
                    <div className="pl-7 space-y-3">
                      {(Object.entries(channelLabels) as [NotificationChannel, typeof channelLabels[NotificationChannel]][]).map(
                        ([channel, { title: channelTitle, icon }]) => {
                          const isChannelEnabled = eventSettings[channel].enabled;
                          const isGlobalEnabled = isGlobalChannelEnabled(channel);
                          const isDisabled = !isGlobalEnabled || isLoading;
                          
                          return (
                            <div key={channel} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{icon}</span>
                                <span className="text-sm">{channelTitle}</span>
                                {!isGlobalEnabled && (
                                  <Badge variant="secondary" className="text-xs">
                                    Canal désactivé
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={isChannelEnabled && isGlobalEnabled}
                                onCheckedChange={(enabled) => 
                                  handleChannelToggle(eventType, channel, enabled)
                                }
                                disabled={isDisabled}
                              />
                            </div>
                          );
                        }
                      )}
                      
                      {!isGlobalChannelEnabled('email') && 
                       !isGlobalChannelEnabled('sms') && 
                       !isGlobalChannelEnabled('push') && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                          ⚠️ Tous les canaux globaux sont désactivés. Activez au moins un canal dans les paramètres globaux.
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {index < Object.keys(eventLabels).length - 1 && <Separator />}
              </div>
            );
          }
        )}

        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 dark:text-green-400 mt-0.5">💡</div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Conseils personnalisation
              </p>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>• <strong>Urgent</strong> : Recommandé d'activer tous les canaux</li>
                <li>• <strong>Important</strong> : Email + Push généralement suffisant</li>
                <li>• <strong>Info</strong> : Push uniquement pour éviter les spams</li>
                <li>• Les messages peuvent être configurés en push uniquement pour plus de réactivité</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}