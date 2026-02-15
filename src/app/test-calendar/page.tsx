'use client';

/**
 * Page de test pour le Calendar
 * URL: http://localhost:9002/test-calendar
 */

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';

export default function TestCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Test du Calendar</h1>
          <p className="text-muted-foreground">
            Date sélectionnée: {date ? date.toLocaleDateString('fr-FR') : 'Aucune'}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={fr}
            className="rounded-md border"
          />
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>✅ Si vous pouvez cliquer sur les jours → Le Calendar fonctionne</p>
          <p>❌ Si les jours ne sont pas cliquables → Problème de CSS ou d'événements</p>
        </div>
      </div>
    </div>
  );
}
