'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CloudOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingActionsCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
}

export function OfflineIndicator({
  isOnline,
  pendingActionsCount,
  isSyncing,
  syncNow,
}: OfflineIndicatorProps) {
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Reconnecté temporaire
  if (showReconnected) {
    return (
      <div className="fixed inset-x-0 top-0 z-[55] border-b bg-green-500 text-white animate-in slide-in-from-top">
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Connexion rétablie</span>
          {pendingActionsCount > 0 && (
            <span className="text-xs opacity-90">
              — Synchronisation de {pendingActionsCount} action{pendingActionsCount > 1 ? 's' : ''}...
            </span>
          )}
        </div>
      </div>
    );
  }

  // Hors-ligne
  if (!isOnline) {
    return (
      <div className="fixed inset-x-0 top-0 z-[55] border-b bg-amber-500 text-white animate-in slide-in-from-top">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Mode hors-ligne</span>
            {pendingActionsCount > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pendingActionsCount} en attente
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // En ligne avec actions en attente
  if (pendingActionsCount > 0) {
    return (
      <div className="fixed inset-x-0 top-0 z-[55] border-b bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 animate-in slide-in-from-top">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-2">
            <CloudOff className="h-4 w-4" />
            <span className="text-sm">
              {pendingActionsCount} action{pendingActionsCount > 1 ? 's' : ''} en attente de synchronisation
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={syncNow}
            disabled={isSyncing}
            className="h-7 gap-1.5 text-xs"
          >
            <RefreshCw className={cn('h-3 w-3', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Sync...' : 'Synchroniser'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
