/**
 * Page de gestion des utilisateurs (admin)
 * Liste avec onglets (parents, accompagnateurs, admins), recherche, actions (suspendre, activer)
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  onUsersSnapshot,
  updateUserStatus,
  verifyAccompanistDocument,
  logAuditAction,
} from '@/lib/admin-service';
import type { User, UserStatus } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Eye,
  Shield,
  Star,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  FileCheck,
  Ban,
  CheckCircle,
} from 'lucide-react';

function UserStatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    active: { variant: 'default', label: 'Actif' },
    suspended: { variant: 'destructive', label: 'Suspendu' },
    deleted: { variant: 'destructive', label: 'Supprimé' },
    pending: { variant: 'outline', label: 'En attente' },
  };
  const c = config[status] || { variant: 'outline' as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { color: string; label: string }> = {
    parent: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Parent' },
    accompanist: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Accompagnateur' },
    admin: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Admin' },
  };
  const c = config[role] || { color: '', label: role };
  return <Badge variant="outline" className={c.color}>{c.label}</Badge>;
}

export default function AdminUsersPage() {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<(User & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<(User & { id: string }) | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = onUsersSnapshot(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur utilisateurs:', err);
        setError('Impossible de charger les utilisateurs');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filtrer par onglet
    if (activeTab !== 'all') {
      result = result.filter((u) => u.role === activeTab);
    }

    // Recherche
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.firstName?.toLowerCase().includes(search) ||
          u.lastName?.toLowerCase().includes(search) ||
          u.phoneNumber?.includes(search) ||
          u.id.toLowerCase().includes(search)
      );
    }

    return result;
  }, [users, activeTab, searchQuery]);

  const userStats = useMemo(() => ({
    total: users.length,
    parents: users.filter((u) => u.role === 'parent').length,
    accompanists: users.filter((u) => u.role === 'accompanist').length,
    admins: users.filter((u) => u.role === 'admin').length,
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
  }), [users]);

  const handleStatusChange = useCallback(async (userId: string, newStatus: UserStatus) => {
    try {
      setActionLoading(true);
      await updateUserStatus(userId, newStatus);
      await logAuditAction(
        `user_${newStatus}`,
        user!.uid,
        'admin',
        userProfile?.email || '',
        'user',
        userId,
        { newStatus }
      );
    } catch (err) {
      console.error(err);
      setError(`Erreur lors du changement de statut`);
    } finally {
      setActionLoading(false);
    }
  }, [user, userProfile]);

  const handleVerifyDocument = useCallback(
    async (userId: string, docType: 'criminalRecord' | 'insurance' | 'idCard', verified: boolean) => {
      try {
        setActionLoading(true);
        await verifyAccompanistDocument(userId, docType, verified);
        await logAuditAction(
          'document_verified',
          user!.uid,
          'admin',
          userProfile?.email || '',
          'user',
          userId,
          { documentType: docType, verified }
        );
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la vérification du document');
      } finally {
        setActionLoading(false);
      }
    },
    [user, userProfile]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600 mt-1">
          {userStats.total} utilisateurs · {userStats.active} actifs · {userStats.suspended} suspendus
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <UsersIcon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold">{userStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <UsersIcon className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-500">Parents</p>
              <p className="text-lg font-bold">{userStats.parents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Accompagnateurs</p>
              <p className="text-lg font-bold">{userStats.accompanists}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Shield className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xs text-gray-500">Admins</p>
              <p className="text-lg font-bold">{userStats.admins}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom, email, téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Onglets par rôle */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({userStats.total})</TabsTrigger>
          <TabsTrigger value="parent">Parents ({userStats.parents})</TabsTrigger>
          <TabsTrigger value="accompanist">Accompagnateurs ({userStats.accompanists})</TabsTrigger>
          <TabsTrigger value="admin">Admins ({userStats.admins})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50/50 text-left text-gray-500">
                        <th className="px-4 py-3 font-medium">Utilisateur</th>
                        <th className="px-4 py-3 font-medium">Rôle</th>
                        <th className="px-4 py-3 font-medium">Statut</th>
                        <th className="px-4 py-3 font-medium">Inscription</th>
                        <th className="px-4 py-3 font-medium">Détails</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const createdAt = u.createdAt?.toDate?.()
                          ? format(u.createdAt.toDate(), 'dd/MM/yy', { locale: fr })
                          : '—';
                        return (
                          <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <RoleBadge role={u.role} />
                            </td>
                            <td className="px-4 py-3">
                              <UserStatusBadge status={u.status || 'active'} />
                            </td>
                            <td className="px-4 py-3 text-gray-600">{createdAt}</td>
                            <td className="px-4 py-3">
                              {u.role === 'accompanist' && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                                  {u.accompanistProfile?.rating?.toFixed(1) || 'N/A'}
                                  <span>·</span>
                                  {u.accompanistProfile?.totalMissions || 0} missions
                                </div>
                              )}
                              {u.role === 'parent' && u.parentProfile && (
                                <div className="text-xs text-gray-500">
                                  {u.parentProfile.numberOfYoungsters || 0} enfant(s)
                                </div>
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
                                    setSelectedUser(u);
                                    setShowDetail(true);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>

                                {u.status === 'active' && u.role !== 'admin' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-600"
                                    title="Suspendre"
                                    onClick={() => handleStatusChange(u.id, 'suspended')}
                                    disabled={actionLoading}
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </Button>
                                )}

                                {u.status === 'suspended' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-green-600"
                                    title="Réactiver"
                                    onClick={() => handleStatusChange(u.id, 'active')}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
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
        </TabsContent>
      </Tabs>

      {/* Dialog détail utilisateur */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              <RoleBadge role={selectedUser?.role || ''} />
              <span className="ml-2">
                <UserStatusBadge status={selectedUser?.status || 'active'} />
              </span>
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Téléphone</p>
                    <p className="font-medium">{selectedUser.phoneNumber || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Inscription</p>
                    <p className="font-medium">
                      {selectedUser.createdAt?.toDate?.()
                        ? format(selectedUser.createdAt.toDate(), 'dd/MM/yyyy', { locale: fr })
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Dernière connexion</p>
                    <p className="font-medium">
                      {selectedUser.lastLoginAt?.toDate?.()
                        ? format(selectedUser.lastLoginAt.toDate(), 'dd/MM/yyyy HH:mm', {
                            locale: fr,
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails accompagnateur */}
              {selectedUser.role === 'accompanist' && selectedUser.accompanistProfile && (
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-green-800">Profil accompagnateur</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-green-700">Note</p>
                      <p className="font-bold text-lg">
                        {selectedUser.accompanistProfile.rating?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Missions</p>
                      <p className="font-bold text-lg">
                        {selectedUser.accompanistProfile.totalMissions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Revenus</p>
                      <p className="font-bold text-lg">
                        {selectedUser.accompanistProfile.totalEarnings?.toFixed(0) || '0'}€
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  {selectedUser.accompanistProfile.documents && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-green-700">Documents</h5>
                      {['criminalRecord', 'insurance', 'idCard'].map((docType) => {
                        const doc =
                          selectedUser.accompanistProfile?.documents?.[
                            docType as keyof typeof selectedUser.accompanistProfile.documents
                          ];
                        const docLabels: Record<string, string> = {
                          criminalRecord: 'Casier judiciaire',
                          insurance: 'Assurance',
                          idCard: "Pièce d'identité",
                        };
                        return (
                          <div
                            key={docType}
                            className="flex items-center justify-between bg-white/60 rounded p-2"
                          >
                            <div className="flex items-center gap-2">
                              <FileCheck
                                className={`h-4 w-4 ${
                                  doc?.verified ? 'text-green-600' : 'text-gray-400'
                                }`}
                              />
                              <span className="text-sm">{docLabels[docType]}</span>
                              {doc?.verified && (
                                <Badge variant="outline" className="text-xs bg-green-100">
                                  Vérifié
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {!doc?.verified && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() =>
                                    handleVerifyDocument(
                                      selectedUser.id,
                                      docType as 'criminalRecord' | 'insurance' | 'idCard',
                                      true
                                    )
                                  }
                                  disabled={actionLoading}
                                >
                                  Valider
                                </Button>
                              )}
                              {doc?.verified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-red-600"
                                  onClick={() =>
                                    handleVerifyDocument(
                                      selectedUser.id,
                                      docType as 'criminalRecord' | 'insurance' | 'idCard',
                                      false
                                    )
                                  }
                                  disabled={actionLoading}
                                >
                                  Retirer
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ID */}
              <p className="text-xs text-gray-400 font-mono">ID: {selectedUser.id}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedUser?.status === 'active' && selectedUser?.role !== 'admin' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleStatusChange(selectedUser.id, 'suspended');
                  setShowDetail(false);
                }}
                disabled={actionLoading}
              >
                <Ban className="h-4 w-4 mr-1" />
                Suspendre
              </Button>
            )}
            {selectedUser?.status === 'suspended' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  handleStatusChange(selectedUser.id, 'active');
                  setShowDetail(false);
                }}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Réactiver
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetail(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
