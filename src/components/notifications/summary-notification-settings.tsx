/**
 * Composant de configuration des résumés et paramètres avancés
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, BookOpen, Clock } from 'lucide-react';
import type { NotificationPreferences } from '@/types/firestore';

interface SummaryNotificationSettingsProps {
  preferences: NotificationPreferences;
  isLoading: boolean;
  onUpdateSummarySettings: (settings: {
    dailyEnabled?: boolean;
    weeklyEnabled?: boolean;
    preferredTime?: string;
  }) => Promise<void>;
}

export default function SummaryNotificationSettings({
  preferences,
  isLoading,
  onUpdateSummarySettings
}: SummaryNotificationSettingsProps) {
  const { dailyEnabled, weeklyEnabled, preferredTime } = preferences.summary;

  const handleToggleDaily = async (enabled: boolean) => {
    try {
      await onUpdateSummarySettings({ dailyEnabled: enabled });
    } catch (error) {
      console.error('Erreur toggle résumé quotidien:', error);
    }
  };

  const handleToggleWeekly = async (enabled: boolean) => {
    try {
      await onUpdateSummarySettings({ weeklyEnabled: enabled });
    } catch (error) {
      console.error('Erreur toggle résumé hebdomadaire:', error);
    }
  };

  const handleTimeChange = async (time: string) => {
    try {
      await onUpdateSummarySettings({ preferredTime: time });
    } catch (error) {
      console.error('Erreur mise à jour heure préférée:', error);
    }
  };

  const isEmailEnabled = preferences.globalSettings.email.enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Résumés et paramètres avancés
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recevez des résumés périodiques de vos activités
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Paramètres de résumé */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Résumé quotidien</span>
                  {!isEmailEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      Email requis
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Récapitulatif quotidien de vos missions et messages
                </p>
              </div>
            </div>
            <Switch
              checked={dailyEnabled && isEmailEnabled}
              onCheckedChange={handleToggleDaily}
              disabled={isLoading || !isEmailEnabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Résumé hebdomadaire</span>
                  {weeklyEnabled && (
                    <Badge variant="default" className="text-xs">
                      Actif
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Statistiques et bilan hebdomadaire de vos activités
                </p>
              </div>
            </div>
            <Switch
              checked={weeklyEnabled && isEmailEnabled}
              onCheckedChange={handleToggleWeekly}
              disabled={isLoading || !isEmailEnabled}
            />
          </div>
        </div>

        {/* Heure préférée */}
        {(dailyEnabled || weeklyEnabled) && isEmailEnabled && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="preferred-time" className="font-medium">
                  Heure d'envoi préférée
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="preferred-time"
                  type="time"
                  value={preferredTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={isLoading}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  Les résumés seront envoyés à cette heure
                </span>
              </div>
            </div>
          </>
        )}

        {!isEmailEnabled && (
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-orange-600 dark:text-orange-400 mt-0.5">⚠️</div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Email requis pour les résumés
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Activez les notifications par email dans les paramètres globaux pour recevoir les résumés.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations sur les résumés */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">📊</div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Contenu des résumés
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Quotidien</strong> : Missions du jour, nouveaux messages, rappels</li>
                <li>• <strong>Hebdomadaire</strong> : Statistiques, missions complétées, points fidélité</li>
                <li>• Les résumés respectent vos heures silencieuses configurées</li>
                <li>• Aucun envoi si pas d'activité pendant la période</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}