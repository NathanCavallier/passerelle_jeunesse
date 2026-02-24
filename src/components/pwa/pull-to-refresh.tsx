'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

/**
 * Wrapper de pull-to-refresh natif pour mobile.
 * Gère le geste de tirage vers le bas pour rafraîchir le contenu.
 */
export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;
      const container = containerRef.current;
      if (!container) return;

      // Ne pull que si on est au top du scroll
      if (container.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPullingRef.current || disabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0) {
        // Résistance progressive
        const resistance = Math.min(diff * 0.4, threshold * 1.5);
        setPullDistance(resistance);
      }
    },
    [disabled, isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6); // garder un indicateur visible
      try {
        await onRefresh();
      } catch (e) {
        console.error('Pull-to-refresh error:', e);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicateur de pull */}
      <div
        className="pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: pullDistance > 0 ? `${pullDistance}px` : '0px',
          opacity: progress,
        }}
      >
        <div
          className={cn(
            'flex items-center gap-2 text-sm text-muted-foreground',
            isRefreshing && 'text-primary'
          )}
        >
          <RefreshCw
            className={cn(
              'h-5 w-5 transition-transform',
              isRefreshing && 'animate-spin'
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${progress * 360}deg)`,
            }}
          />
          <span>
            {isRefreshing
              ? 'Actualisation...'
              : progress >= 1
              ? 'Relâchez pour actualiser'
              : 'Tirez pour actualiser'}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
