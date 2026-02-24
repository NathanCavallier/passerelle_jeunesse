'use client';

import { useUniversalPWA } from '@/hooks/use-universal-pwa';
import { MobileBottomNav } from './mobile-bottom-nav';
import { EnhancedInstallBanner } from './enhanced-install-banner';
import { OfflineIndicator } from './offline-indicator';

interface MobileShellProps {
  children: React.ReactNode;
  unreadMessages?: number;
  pendingBookings?: number;
}

/**
 * Shell mobile englobant — fournit les éléments natifs PWA :
 * - Barre de navigation inférieure (mobile only)
 * - Bannière d'installation PWA
 * - Indicateur de statut réseau
 * - Padding du safe-area pour la barre inférieure
 */
export function MobileShell({ children, unreadMessages, pendingBookings }: MobileShellProps) {
  const pwa = useUniversalPWA();

  return (
    <>
      {/* Bannière d'installation */}
      <EnhancedInstallBanner pwa={pwa} />

      {/* Indicateur offline */}
      <OfflineIndicator
        isOnline={pwa.isOnline}
        pendingActionsCount={pwa.pendingActionsCount}
        isSyncing={pwa.isSyncing}
        syncNow={pwa.syncNow}
      />

      {/* Contenu principal avec safe-area bottom pour la nav */}
      <div className="pb-16 md:pb-0">
        {children}
      </div>

      {/* Navigation inférieure mobile */}
      <MobileBottomNav
        unreadMessages={unreadMessages}
        pendingBookings={pendingBookings}
      />
    </>
  );
}
