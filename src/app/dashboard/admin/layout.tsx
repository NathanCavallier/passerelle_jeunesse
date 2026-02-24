/**
 * Layout de l'espace administration
 * Navigation latérale et structure commune pour les pages admin
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Download,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { logout } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  {
    href: '/dashboard/admin',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/admin/bookings',
    label: 'Réservations',
    icon: CalendarCheck,
  },
  {
    href: '/dashboard/admin/users',
    label: 'Utilisateurs',
    icon: Users,
  },
  {
    href: '/dashboard/admin/reviews',
    label: 'Modération avis',
    icon: MessageSquare,
  },
  {
    href: '/dashboard/admin/export',
    label: 'Export données',
    icon: Download,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, loading, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Déconnexion réussie' });
      router.push('/');
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de se déconnecter' });
    }
  };

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-4">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Administration</p>
                  <p className="text-xs text-gray-500">{userProfile?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-500 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
