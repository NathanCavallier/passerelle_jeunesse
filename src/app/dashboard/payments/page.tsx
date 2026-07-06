'use client';

/**
 * Page d'historique des paiements
 * Affiche tous les paiements effectués par le parent avec filtres et recherche
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, where, orderBy, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Search,
    Download,
    FileText,
    TrendingUp,
    Calendar,
    Euro,
    Filter,
    Loader2,
} from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import type { Booking } from '@/types/firestore';
import { formatPrice } from '@/lib/pricing-service';

// ============================================================================
// TYPES
// ============================================================================

interface PaymentRecord {
    id: string;
    bookingId: string;
    date: Date;
    type: 'deposit' | 'balance';
    amount: number;
    status: 'paid' | 'pending';
    invoiceURL?: string;
    youngsters: string[];
    serviceType: string;
}

// ============================================================================
// COMPOSANT
// ============================================================================

export default function PaymentsPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'balance'>('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Statistiques
    const [totalSpent, setTotalSpent] = useState(0);
    const [averagePayment, setAveragePayment] = useState(0);
    const [paymentCount, setPaymentCount] = useState(0);

    // Charger les réservations et construire les paiements
    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push('/login');
            return;
        }

        setLoading(true);

        // Listener temps réel
        const bookingsQuery = query(
            collection(getFirebaseDb(), 'bookings'),
            where('parentId', '==', user.uid)
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            bookingsQuery,
            (snapshot) => {
                const bookingsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Booking));

                // Trier côté client par createdAt décroissant
                bookingsData.sort((a, b) => {
                    const timeA = a.createdAt?.toDate().getTime() || 0;
                    const timeB = b.createdAt?.toDate().getTime() || 0;
                    return timeB - timeA;
                });

                setBookings(bookingsData);

                // Construire la liste des paiements
                const paymentRecords: PaymentRecord[] = [];

                bookingsData.forEach((booking) => {
                    const { pricing, youngsters, serviceType } = booking;
                    const youngstersNames = youngsters.map((y) => y.firstName).join(', ');

                    // Acompte
                    if (pricing.deposit > 0) {
                        paymentRecords.push({
                            id: `${booking.id}-deposit`,
                            bookingId: booking.id,
                            date: booking.confirmedAt?.toDate() || booking.createdAt.toDate(),
                            type: 'deposit',
                            amount: pricing.deposit,
                            status: pricing.depositPaid ? 'paid' : 'pending',
                            invoiceURL: booking.documents.invoiceURL,
                            youngsters: [youngstersNames],
                            serviceType,
                        });
                    }

                    // Solde
                    if (pricing.balance > 0) {
                        paymentRecords.push({
                            id: `${booking.id}-balance`,
                            bookingId: booking.id,
                            date: booking.scheduledFor.toDate(),
                            type: 'balance',
                            amount: pricing.balance,
                            status: pricing.balancePaid ? 'paid' : 'pending',
                            invoiceURL: booking.documents.invoiceURL,
                            youngsters: [youngstersNames],
                            serviceType,
                        });
                    }
                });

                setPayments(paymentRecords);
                setFilteredPayments(paymentRecords);
                setLoading(false);
            },
            (error) => {
                console.error('Erreur chargement paiements:', error);
                toast({
                    title: 'Erreur',
                    description: 'Impossible de charger les paiements',
                    variant: 'destructive',
                });
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isAuthenticated, user, router, toast]);

    // Calculer les statistiques
    useEffect(() => {
        const paidPayments = payments.filter((p) => p.status === 'paid');
        const total = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const count = paidPayments.length;
        const average = count > 0 ? total / count : 0;

        setTotalSpent(total);
        setAveragePayment(average);
        setPaymentCount(count);
    }, [payments]);

    // Appliquer les filtres
    useEffect(() => {
        let filtered = [...payments];

        // Filtre de recherche (par ID de réservation)
        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtre de statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter((p) => p.status === statusFilter);
        }

        // Filtre de type
        if (typeFilter !== 'all') {
            filtered = filtered.filter((p) => p.type === typeFilter);
        }

        // Tri par date
        filtered.sort((a, b) => {
            const diff = b.date.getTime() - a.date.getTime();
            return sortOrder === 'desc' ? diff : -diff;
        });

        setFilteredPayments(filtered);
    }, [payments, searchQuery, statusFilter, typeFilter, sortOrder]);

    // Télécharger la facture
    const handleDownloadInvoice = (payment: PaymentRecord) => {
        if (payment.invoiceURL) {
            window.open(payment.invoiceURL, '_blank');
        } else {
            toast({
                title: 'Facture non disponible',
                description: 'La facture n\'est pas encore générée',
                variant: 'destructive',
            });
        }
    };

    // Exporter en CSV
    const handleExportCSV = () => {
        const csvHeaders = ['Date', 'ID Réservation', 'Type', 'Montant', 'Statut', 'Jeunes'];
        const csvRows = filteredPayments.map((p) => [
            format(p.date, 'dd/MM/yyyy', { locale: fr }),
            p.bookingId,
            p.type === 'deposit' ? 'Acompte' : 'Solde',
            `${(p.amount / 100).toFixed(2)}€`,
            p.status === 'paid' ? 'Payé' : 'En attente',
            p.youngsters.join(', '),
        ]);

        const csvContent = [csvHeaders, ...csvRows].map((row) => row.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `paiements_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();

        toast({
            title: 'Export réussi',
            description: 'Le fichier CSV a été téléchargé',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
                {/* En-tête */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au dashboard
                    </Button>

                    <h1 className="text-3xl font-bold mb-2">Historique des paiements</h1>
                    <p className="text-neutral-600">
                        Consultez tous vos paiements et téléchargez vos factures
                    </p>
                </div>

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                Total dépensé
                            </CardTitle>
                            <Euro className="h-4 w-4 text-neutral-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
                            <p className="text-xs text-neutral-600 mt-1">
                                {paymentCount} paiement{paymentCount > 1 ? 's' : ''} effectué{paymentCount > 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                Montant moyen
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-neutral-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(averagePayment)}</div>
                            <p className="text-xs text-neutral-600 mt-1">Par transaction</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                Réservations
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-neutral-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bookings.length}</div>
                            <p className="text-xs text-neutral-600 mt-1">
                                {bookings.filter((b) => b.status === 'pending').length} en attente
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtres et recherche */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtres
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            {/* Recherche */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rechercher</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        placeholder="ID de réservation"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Filtre statut */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Statut</label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value: any) => setStatusFilter(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="paid">Payé</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtre type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(value: any) => setTypeFilter(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="deposit">Acompte</SelectItem>
                                        <SelectItem value="balance">Solde</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tri */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tri</label>
                                <Select
                                    value={sortOrder}
                                    onValueChange={(value: any) => setSortOrder(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Plus récent</SelectItem>
                                        <SelectItem value="asc">Plus ancien</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600">
                                {filteredPayments.length} résultat{filteredPayments.length > 1 ? 's' : ''}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                                disabled={filteredPayments.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exporter CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table des paiements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des paiements</CardTitle>
                        <CardDescription>
                            Historique complet de vos transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredPayments.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucun paiement</h3>
                                <p className="text-neutral-600">
                                    Aucun paiement ne correspond à vos critères de recherche
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>ID Réservation</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Jeunes</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">
                                                    {format(payment.date, 'dd MMM yyyy', { locale: fr })}
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        onClick={() =>
                                                            router.push(`/dashboard/bookings/${payment.bookingId}`)
                                                        }
                                                        className="text-blue-600 hover:underline font-mono text-sm"
                                                    >
                                                        {payment.bookingId.slice(0, 8)}...
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {payment.type === 'deposit' ? 'Acompte' : 'Solde'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-600">
                                                    {payment.youngsters[0]}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatPrice(payment.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.status === 'paid' ? (
                                                        <Badge variant="default" className="bg-green-600">
                                                            Payé
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">En attente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadInvoice(payment)}
                                                        disabled={!payment.invoiceURL}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
