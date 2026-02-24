/**
 * Page d'export de données (admin)
 * Export CSV des réservations et utilisateurs avec filtres de dates
 */

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  getAllBookings,
  getAllUsers,
  exportBookingsToCSV,
  exportUsersToCSV,
  downloadCSV,
  logAuditAction,
} from '@/lib/admin-service';
import { useAuth } from '@/contexts/auth-context';
import {
  Download,
  CalendarCheck,
  Users,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

export default function AdminExportPage() {
  const { user, userProfile } = useAuth();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExportBookings = useCallback(async () => {
    try {
      setLoading('bookings');
      setError(null);
      setSuccess(null);

      const bookings = await getAllBookings({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (bookings.length === 0) {
        setError('Aucune réservation trouvée pour cette période');
        return;
      }

      const csv = exportBookingsToCSV(bookings);
      const dateSuffix = dateFrom && dateTo
        ? `_${dateFrom}_${dateTo}`
        : `_${new Date().toISOString().slice(0, 10)}`;
      downloadCSV(csv, `reservations${dateSuffix}.csv`);

      await logAuditAction(
        'export_bookings',
        user!.uid,
        'admin',
        userProfile?.email || '',
        'export',
        undefined,
        { count: bookings.length, dateFrom, dateTo }
      );

      setSuccess(`${bookings.length} réservation(s) exportée(s) avec succès`);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'export des réservations');
    } finally {
      setLoading(null);
    }
  }, [dateFrom, dateTo, user, userProfile]);

  const handleExportUsers = useCallback(async () => {
    try {
      setLoading('users');
      setError(null);
      setSuccess(null);

      const users = await getAllUsers();

      if (users.length === 0) {
        setError('Aucun utilisateur trouvé');
        return;
      }

      const csv = exportUsersToCSV(users);
      downloadCSV(csv, `utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`);

      await logAuditAction(
        'export_users',
        user!.uid,
        'admin',
        userProfile?.email || '',
        'export',
        undefined,
        { count: users.length }
      );

      setSuccess(`${users.length} utilisateur(s) exporté(s) avec succès`);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'export des utilisateurs');
    } finally {
      setLoading(null);
    }
  }, [user, userProfile]);

  const handleExportAccompanists = useCallback(async () => {
    try {
      setLoading('accompanists');
      setError(null);
      setSuccess(null);

      const users = await getAllUsers({ role: 'accompanist' });

      if (users.length === 0) {
        setError('Aucun accompagnateur trouvé');
        return;
      }

      const csv = exportUsersToCSV(users);
      downloadCSV(csv, `accompagnateurs_${new Date().toISOString().slice(0, 10)}.csv`);

      await logAuditAction(
        'export_accompanists',
        user!.uid,
        'admin',
        userProfile?.email || '',
        'export',
        undefined,
        { count: users.length }
      );

      setSuccess(`${users.length} accompagnateur(s) exporté(s) avec succès`);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'export des accompagnateurs');
    } finally {
      setLoading(null);
    }
  }, [user, userProfile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export de données</h1>
        <p className="text-gray-600 mt-1">
          Exportez vos données en format CSV pour la comptabilité et les rapports
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Période */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Période d'export</CardTitle>
          <CardDescription>
            Sélectionnez une période pour filtrer les réservations (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date de début</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date de fin</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exports disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export réservations */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Réservations</CardTitle>
                <CardDescription className="text-xs">
                  ID, dates, trajet, montants, statuts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">ID</Badge>
                <Badge variant="outline" className="text-xs">Date</Badge>
                <Badge variant="outline" className="text-xs">Trajet</Badge>
                <Badge variant="outline" className="text-xs">Montant</Badge>
                <Badge variant="outline" className="text-xs">Statut</Badge>
                <Badge variant="outline" className="text-xs">Parent</Badge>
                <Badge variant="outline" className="text-xs">Accomp.</Badge>
              </div>
              <Button
                className="w-full"
                onClick={handleExportBookings}
                disabled={loading !== null}
              >
                {loading === 'bookings' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export utilisateurs */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Tous les utilisateurs</CardTitle>
                <CardDescription className="text-xs">
                  Parents, accompagnateurs, admins
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">Email</Badge>
                <Badge variant="outline" className="text-xs">Nom</Badge>
                <Badge variant="outline" className="text-xs">Rôle</Badge>
                <Badge variant="outline" className="text-xs">Statut</Badge>
                <Badge variant="outline" className="text-xs">Inscription</Badge>
                <Badge variant="outline" className="text-xs">Connexion</Badge>
              </div>
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleExportUsers}
                disabled={loading !== null}
              >
                {loading === 'users' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export accompagnateurs */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Accompagnateurs</CardTitle>
                <CardDescription className="text-xs">
                  Profils détaillés avec notes et missions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">Nom</Badge>
                <Badge variant="outline" className="text-xs">Note</Badge>
                <Badge variant="outline" className="text-xs">Missions</Badge>
                <Badge variant="outline" className="text-xs">Revenus</Badge>
                <Badge variant="outline" className="text-xs">Documents</Badge>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleExportAccompanists}
                disabled={loading !== null}
              >
                {loading === 'accompanists' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info RGPD */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Protection des données</p>
            <p>
              Les exports contiennent des données personnelles protégées par le RGPD.
              Assurez-vous de les stocker de manière sécurisée et de les supprimer
              lorsqu'elles ne sont plus nécessaires. Chaque export est tracé dans le journal d'audit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
