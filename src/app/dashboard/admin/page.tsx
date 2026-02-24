/**
 * Dashboard principal de l'administration
 * Statistiques globales, activité récente et accès rapide aux outils
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAdminStats, onBookingsSnapshot, type AdminStats } from '@/lib/admin-service';
import type { Booking } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart3,
  Users,
  CalendarCheck,
  Euro,
  Star,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

// Badge de statut réutilisable
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'En attente' },
    confirmed: { variant: 'secondary', label: 'Confirmée' },
    paid: { variant: 'default', label: 'Payée' },
    assigned: { variant: 'default', label: 'Assignée' },
    in_progress: { variant: 'default', label: 'En cours' },
    completed: { variant: 'secondary', label: 'Terminée' },
    cancelled: { variant: 'destructive', label: 'Annulée' },
    refunded: { variant: 'destructive', label: 'Remboursée' },
  };
  const c = config[status] || { variant: 'outline' as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const data = await getAdminStats();
      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur stats admin:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Charger les stats au montage
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Écouter les réservations récentes en temps réel
  useEffect(() => {
    setLoadingBookings(true);
    const unsub = onBookingsSnapshot(
      (bookings) => {
        setRecentBookings(bookings.slice(0, 10));
        setLoadingBookings(false);
      },
      (err) => {
        console.error('Erreur bookings snapshot:', err);
        setLoadingBookings(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue, {userProfile?.firstName}. Vue d'ensemble de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Mis à jour {format(lastUpdate, 'HH:mm', { locale: fr })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={loadStats} disabled={loadingStats}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques principales */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Réservations totales</p>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.bookingsThisMonth} ce mois-ci
                    </p>
                  </div>
                  <CalendarCheck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)}€</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.revenueThisMonth.toFixed(0)}€ ce mois
                    </p>
                  </div>
                  <Euro className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.totalParents} parents · {stats.totalAccompanists} accomp.
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                    <p className="text-2xl font-bold">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.completedMissions} missions terminées
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indicateurs secondaires */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-orange-400">
              <CardContent className="p-4 flex items-center gap-4">
                <Clock className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-xl font-bold">{stats.pendingBookings}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-400">
              <CardContent className="p-4 flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Missions terminées</p>
                  <p className="text-xl font-bold">{stats.completedMissions}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-400">
              <CardContent className="p-4 flex items-center gap-4">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Annulées</p>
                  <p className="text-xl font-bold">{stats.cancelledBookings}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {/* Accès rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/admin/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Gérer les réservations</p>
                  <p className="text-xs text-gray-500">Validation, attribution, annulation</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-semibold">Gérer les utilisateurs</p>
                  <p className="text-xs text-gray-500">Parents, accompagnateurs, admins</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/export">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">Exporter les données</p>
                  <p className="text-xs text-gray-500">CSV comptabilité, rapports</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Réservations récentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Réservations récentes</CardTitle>
              <CardDescription>Dernières réservations de la plateforme</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              🔴 Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingBookings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune réservation</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Trajet</th>
                    <th className="pb-3 font-medium">Jeunes</th>
                    <th className="pb-3 font-medium">Montant</th>
                    <th className="pb-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => {
                    const createdAt = booking.createdAt?.toDate?.()
                      ? format(booking.createdAt.toDate(), 'dd/MM/yy', { locale: fr })
                      : '—';
                    return (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs text-gray-500">
                          {booking.id.slice(0, 8)}…
                        </td>
                        <td className="py-3">{createdAt}</td>
                        <td className="py-3 max-w-[200px] truncate">
                          {booking.trip?.departure?.address || '—'}
                          <span className="text-gray-400 mx-1">→</span>
                          {booking.trip?.arrival?.address || '—'}
                        </td>
                        <td className="py-3">{booking.youngsters?.length || 0}</td>
                        <td className="py-3 font-medium">
                          {booking.pricing?.total?.toFixed(0) || '0'}€
                        </td>
                        <td className="py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 text-center">
                <Link href="/dashboard/admin/bookings">
                  <Button variant="outline" size="sm">
                    Voir toutes les réservations
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
