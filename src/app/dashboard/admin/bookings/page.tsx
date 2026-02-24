/**
 * Page de gestion des réservations (admin)
 * Liste complète avec filtres, recherche, actions (valider, assigner, annuler)
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  onBookingsSnapshot,
  updateBookingStatus,
  assignAccompanist,
  getAvailableAccompanists,
  logAuditAction,
} from '@/lib/admin-service';
import type { Booking, BookingStatus, User } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  Filter,
  CalendarCheck,
  Loader2,
  AlertCircle,
  UserPlus,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Euro,
  Users as UsersIcon,
} from 'lucide-react';

// Badge de statut
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }> = {
    pending: { variant: 'outline', label: 'En attente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    confirmed: { variant: 'secondary', label: 'Confirmée', color: '' },
    paid: { variant: 'default', label: 'Payée', color: '' },
    assigned: { variant: 'default', label: 'Assignée', color: '' },
    in_progress: { variant: 'default', label: 'En cours', color: '' },
    completed: { variant: 'secondary', label: 'Terminée', color: '' },
    cancelled: { variant: 'destructive', label: 'Annulée', color: '' },
    refunded: { variant: 'destructive', label: 'Remboursée', color: '' },
  };
  const c = config[status] || { variant: 'outline' as const, label: status, color: '' };
  return <Badge variant={c.variant} className={c.color}>{c.label}</Badge>;
}

export default function AdminBookingsPage() {
  const { user, userProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialogues
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [availableAccompanists, setAvailableAccompanists] = useState<(User & { id: string })[]>([]);
  const [selectedAccompanist, setSelectedAccompanist] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Écoute temps réel
  useEffect(() => {
    setLoading(true);
    const unsub = onBookingsSnapshot(
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur bookings:', err);
        setError('Impossible de charger les réservations');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Filtrage côté client
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(search) ||
          b.trip?.departure?.address?.toLowerCase().includes(search) ||
          b.trip?.arrival?.address?.toLowerCase().includes(search) ||
          b.youngsters?.some((y) => y.firstName?.toLowerCase().includes(search)) ||
          b.parentId?.toLowerCase().includes(search) ||
          b.accompanistId?.toLowerCase().includes(search)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((b) => {
        const d = b.createdAt?.toDate?.() || new Date(b.createdAt as any);
        return d >= from;
      });
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      result = result.filter((b) => {
        const d = b.createdAt?.toDate?.() || new Date(b.createdAt as any);
        return d <= to;
      });
    }

    return result;
  }, [bookings, statusFilter, searchQuery, dateFrom, dateTo]);

  // Stats rapides
  const quickStats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      inProgress: bookings.filter((b) => b.status === 'in_progress' || b.status === 'assigned').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
    };
  }, [bookings]);

  // Actions
  const handleConfirm = useCallback(async (booking: Booking) => {
    try {
      setActionLoading(true);
      await updateBookingStatus(booking.id, 'confirmed');
      await logAuditAction(
        'booking_confirmed',
        user!.uid,
        'admin',
        userProfile?.email || '',
        'booking',
        booking.id
      );
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la confirmation');
    } finally {
      setActionLoading(false);
    }
  }, [user, userProfile]);

  const openAssignDialog = useCallback(async (booking: Booking) => {
    setSelectedBooking(booking);
    setShowAssign(true);
    try {
      const accomps = await getAvailableAccompanists();
      setAvailableAccompanists(accomps);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleAssign = useCallback(async () => {
    if (!selectedBooking || !selectedAccompanist) return;
    try {
      setActionLoading(true);
      await assignAccompanist(selectedBooking.id, selectedAccompanist);
      await logAuditAction(
        'booking_assigned',
        user!.uid,
        'admin',
        userProfile?.email || '',
        'booking',
        selectedBooking.id,
        { accompanistId: selectedAccompanist }
      );
      setShowAssign(false);
      setSelectedAccompanist('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'attribution');
    } finally {
      setActionLoading(false);
    }
  }, [selectedBooking, selectedAccompanist, user, userProfile]);

  const handleCancel = useCallback(async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      await updateBookingStatus(selectedBooking.id, 'cancelled', cancelReason);
      await logAuditAction(
        'booking_cancelled',
        user!.uid,
        'admin',
        userProfile?.email || '',
        'booking',
        selectedBooking.id,
        { reason: cancelReason }
      );
      setShowCancel(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'annulation');
    } finally {
      setActionLoading(false);
    }
  }, [selectedBooking, cancelReason, user, userProfile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des réservations</h1>
        <p className="text-gray-600 mt-1">
          {filteredBookings.length} réservation{filteredBookings.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' ? ` (filtrées)` : ''}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-3 flex items-center gap-3">
            <CalendarCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold">{quickStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('pending')}>
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">En attente</p>
              <p className="text-lg font-bold">{quickStats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('in_progress')}>
          <CardContent className="p-3 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">En cours</p>
              <p className="text-lg font-bold">{quickStats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('completed')}>
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Terminées</p>
              <p className="text-lg font-bold">{quickStats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher (ID, adresse, parent...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="assigned">Assignée</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
                <SelectItem value="refunded">Remboursée</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-[160px]"
              placeholder="Depuis"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-[160px]"
              placeholder="Jusqu'à"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des réservations */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune réservation trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Date création</th>
                    <th className="px-4 py-3 font-medium">Date prévue</th>
                    <th className="px-4 py-3 font-medium">Trajet</th>
                    <th className="px-4 py-3 font-medium">Jeunes</th>
                    <th className="px-4 py-3 font-medium">Montant</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Accomp.</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const createdAt = booking.createdAt?.toDate?.()
                      ? format(booking.createdAt.toDate(), 'dd/MM/yy', { locale: fr })
                      : '—';
                    const scheduledFor = booking.scheduledFor?.toDate?.()
                      ? format(booking.scheduledFor.toDate(), 'dd/MM/yy HH:mm', { locale: fr })
                      : '—';

                    return (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {booking.id.slice(0, 8)}…
                        </td>
                        <td className="px-4 py-3 text-gray-600">{createdAt}</td>
                        <td className="px-4 py-3">{scheduledFor}</td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-gray-700">
                          {booking.trip?.departure?.address || '—'}
                          <span className="text-gray-400 mx-1">→</span>
                          {booking.trip?.arrival?.address || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
                            {booking.youngsters?.length || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {booking.pricing?.total?.toFixed(0) || '0'}€
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {booking.accompanistId ? (
                            <Badge variant="outline" className="text-xs">
                              Assigné
                            </Badge>
                          ) : (
                            <span className="text-orange-500">Non assigné</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetail(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {booking.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-green-600"
                                title="Confirmer"
                                onClick={() => handleConfirm(booking)}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {!booking.accompanistId &&
                              booking.status !== 'cancelled' &&
                              booking.status !== 'completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-blue-600"
                                  title="Assigner un accompagnateur"
                                  onClick={() => openAssignDialog(booking)}
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                </Button>
                              )}

                            {booking.status !== 'cancelled' &&
                              booking.status !== 'completed' &&
                              booking.status !== 'refunded' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-600"
                                  title="Annuler"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowCancel(true);
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog détail */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogDescription>ID: {selectedBooking?.id}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Statut</p>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div>
                  <p className="text-gray-500">Type de service</p>
                  <p className="font-medium">{selectedBooking.serviceType || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Trajet</p>
                <p><strong>Départ:</strong> {selectedBooking.trip?.departure?.address || '—'}</p>
                <p><strong>Arrivée:</strong> {selectedBooking.trip?.arrival?.address || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Montant total</p>
                  <p className="font-bold text-lg">{selectedBooking.pricing?.total?.toFixed(2) || '0.00'}€</p>
                </div>
                <div>
                  <p className="text-gray-500">Acompte</p>
                  <p className={selectedBooking.pricing?.depositPaid ? 'text-green-600' : 'text-orange-600'}>
                    {selectedBooking.pricing?.deposit?.toFixed(2) || '0.00'}€
                    {selectedBooking.pricing?.depositPaid ? ' ✓ Payé' : ' ✗ Non payé'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Jeunes ({selectedBooking.youngsters?.length || 0})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.youngsters?.map((y, i) => (
                    <Badge key={i} variant="outline">{y.firstName} ({y.age} ans)</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p>Parent ID: {selectedBooking.parentId?.slice(0, 12)}…</p>
                </div>
                <div>
                  <p>Accomp. ID: {selectedBooking.accompanistId?.slice(0, 12) || 'Non assigné'}…</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog attribution accompagnateur */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un accompagnateur</DialogTitle>
            <DialogDescription>
              Sélectionnez un accompagnateur actif pour cette réservation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableAccompanists.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun accompagnateur disponible
              </p>
            ) : (
              <Select value={selectedAccompanist} onValueChange={setSelectedAccompanist}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un accompagnateur" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccompanists.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.firstName} {a.lastName}
                      {a.accompanistProfile?.rating
                        ? ` (★ ${a.accompanistProfile.rating.toFixed(1)})`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedAccompanist || actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog annulation */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation</DialogTitle>
            <DialogDescription>
              Cette action annulera la réservation. Veuillez indiquer un motif.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Motif d'annulation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason || actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
