'use client';

import { useState } from 'react';
import { Download, X, RefreshCw, Wifi, WifiOff, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PWAState } from '@/hooks/use-universal-pwa';

interface EnhancedInstallBannerProps {
  pwa: PWAState;
}

export function EnhancedInstallBanner({ pwa }: EnhancedInstallBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Mise à jour disponible — priorité haute
  if (pwa.isUpdateAvailable) {
    return (
      <div className="fixed inset-x-0 top-0 z-[60] border-b bg-blue-500 text-white shadow-lg animate-in slide-in-from-top">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <div>
              <p className="text-sm font-semibold">Mise à jour disponible</p>
              <p className="text-xs opacity-90">Redémarrez pour appliquer les améliorations</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={pwa.updatePWA}
            className="shrink-0"
          >
            Mettre à jour
          </Button>
        </div>
      </div>
    );
  }

  // Bannière d'installation
  if (pwa.showInstallPrompt && !dismissed && !pwa.isInstalled) {
    return (
      <div className="fixed inset-x-0 bottom-20 z-[60] mx-4 animate-in slide-in-from-bottom md:bottom-4 md:left-auto md:right-4 md:mx-0 md:max-w-sm">
        <div className="rounded-2xl border bg-background p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Installer l&apos;application</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Accédez rapidement depuis votre écran d&apos;accueil. Fonctionne hors-ligne !
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={pwa.installPWA}
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Installer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDismissed(true);
                    pwa.dismissInstallPrompt();
                  }}
                >
                  Plus tard
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                setDismissed(true);
                pwa.dismissInstallPrompt();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
