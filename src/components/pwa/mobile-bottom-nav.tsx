'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CalendarDays, MessageSquare, User, Star, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const parentNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/dashboard/bookings', label: 'Réservations', icon: CalendarDays },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/reviews', label: 'Avis', icon: Star },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
];

const accompanistNavItems: NavItem[] = [
  { href: '/dashboard/accompanist', label: 'Accueil', icon: Home },
  { href: '/dashboard/accompanist/missions', label: 'Missions', icon: Map },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/reviews', label: 'Avis', icon: Star },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
];

interface MobileBottomNavProps {
  unreadMessages?: number;
  pendingBookings?: number;
}

export function MobileBottomNav({ unreadMessages = 0, pendingBookings = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isAccompanist, isAdmin, isAuthenticated } = useAuth();

  // Ne pas afficher sur les pages publiques, admin ou si non authentifié
  if (!isAuthenticated || isAdmin) return null;

  const isDashboard = pathname.startsWith('/dashboard');
  if (!isDashboard) return null;

  const navItems = isAccompanist ? accompanistNavItems : parentNavItems;

  // Ajouter les badges
  const itemsWithBadges = navItems.map((item) => {
    if (item.href.includes('messages') && unreadMessages > 0) {
      return { ...item, badge: unreadMessages };
    }
    if (item.href.includes('bookings') && pendingBookings > 0) {
      return { ...item, badge: pendingBookings };
    }
    return item;
  });

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/dashboard/accompanist') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around">
        {itemsWithBadges.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', active && 'scale-110')} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn('font-medium', active && 'font-semibold')}>
                {item.label}
              </span>
              {active && (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
