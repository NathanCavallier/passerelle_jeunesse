/**
 * Banner d'alerte pour le mode test PWA
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube2, Settings } from 'lucide-react';
import { PWA_TEST_MODE, PWA_TEST_PAGES, TEST_USER_CONFIG } from '@/lib/test-config';

export function TestModeBanner() {
  if (!PWA_TEST_MODE || typeof window === 'undefined') return null;
  
  // Vérifier si on est sur une page de test (uniquement côté client)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isTestPage = PWA_TEST_PAGES.some(page => currentPath.startsWith(page));
  
  if (!isTestPage) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <TestTube2 className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Mode Test PWA Activé</strong> - 
            Connecté en tant que : {TEST_USER_CONFIG.name} ({TEST_USER_CONFIG.role})
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Settings className="h-3 w-3" />
            Désactiver dans test-config.ts
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}