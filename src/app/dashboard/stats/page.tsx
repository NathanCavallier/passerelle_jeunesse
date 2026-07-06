/**
 * Page des statistiques parent  * Tableau de bord analytique, graphiques, KPIs
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    TrendingUp,
    DollarSign,
    MapPin,
    Calendar,
    Loader2,
    Download,
    BarChart3,
    Leaf,
    Navigation
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, ParentProfile } from '@/types/firestore';
import { getUserDocument } from '@/lib/firestore-service';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '@/components/ui/chart';
import {
    Line,
    LineChart,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Pie,
    PieChart,
    Cell
} from 'recharts';

interface MonthlyStats {
    month: string;
    bookings: number;
    spending: number;
}

interface RouteStats {
    route: string;
    count: number;
    color: string;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StatsPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [userProfile, setUserProfile] = useState<ParentProfile | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
    const [topRoutes, setTopRoutes] = useState<RouteStats[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [co2Saved, setCo2Saved] = useState(0);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                // Charger le profil
                const profile = await getUserDocument(user.uid);
                if (profile?.parentProfile) {
                    setUserProfile(profile.parentProfile);
                    setTotalSpent(profile.parentProfile.totalSpent);
                }

                // Charger les réservations
                const bookingsRef = collection(getFirebaseDb(), 'bookings');
                const q = query(
                    bookingsRef,
                    where('userId', '==', user.uid)
                );

                const snapshot = await getDocs(q);
                const bookingsData: Booking[] = [];
                let distance = 0;

                snapshot.forEach((doc) => {
                    const booking = { id: doc.id, ...doc.data() } as Booking;
                    bookingsData.push(booking);

                    // Simuler la distance (entre 10 et 150 km)
                    const simulatedDistance = Math.floor(Math.random() * 140) + 10;
                    distance += simulatedDistance;
                });

                setBookings(bookingsData);
                setTotalDistance(distance);

                // CO2 économisé (voiture moyenne = 120g CO2/km, covoiturage = 30g CO2/km)
                // Économie = 90g par km
                const savedCO2 = (distance * 0.09); // en kg
                setCo2Saved(Math.round(savedCO2));

                // Calculer les stats mensuelles
                calculateMonthlyStats(bookingsData);

                // Calculer les routes les plus fréquentes
                calculateTopRoutes(bookingsData);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const calculateMonthlyStats = (bookingsData: Booking[]) => {
        const statsMap = new Map<string, { bookings: number; spending: number }>();

        bookingsData.forEach(booking => {
            if (booking.createdAt) {
                const monthKey = format(booking.createdAt.toDate(), 'yyyy-MM');
                const existing = statsMap.get(monthKey) || { bookings: 0, spending: 0 };

                statsMap.set(monthKey, {
                    bookings: existing.bookings + 1,
                    spending: existing.spending + booking.pricing.total
                });
            }
        });

        // Convertir en tableau et trier
        const stats = Array.from(statsMap.entries())
            .map(([month, data]) => ({
                month: format(parseISO(month + '-01'), 'MMM yyyy', { locale: fr }),
                bookings: data.bookings,
                spending: data.spending
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6); // Les 6 derniers mois

        setMonthlyStats(stats);
    };

    const calculateTopRoutes = (bookingsData: Booking[]) => {
        const routesMap = new Map<string, number>();

        bookingsData.forEach(booking => {
            const route = `${booking.trip.departure.city} → ${booking.trip.arrival.city}`;
            routesMap.set(route, (routesMap.get(route) || 0) + 1);
        });

        // Convertir en tableau, trier et prendre le top 5
        const routes = Array.from(routesMap.entries())
            .map(([route, count], index) => ({
                route,
                count,
                color: CHART_COLORS[index % CHART_COLORS.length]
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        setTopRoutes(routes);
    };

    const handleExportCSV = () => {
        let csv = 'Date,Départ,Arrivée,Jeunes,Prix,Statut\n';

        bookings.forEach(booking => {
            const date = booking.createdAt ? format(booking.createdAt.toDate(), 'dd/MM/yyyy') : 'N/A';
            csv += `"${date}","${booking.trip.departure.city}","${booking.trip.arrival.city}",${booking.youngstersIds.length},${booking.pricing.total}€,"${booking.status}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `passerelle-jeunesse-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-7xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au dashboard
                </Button>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-8 w-8" />
                            Statistiques
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Vue d'ensemble de votre activité
                        </p>
                    </div>
                    <Button onClick={handleExportCSV} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter CSV
                    </Button>
                </div>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="pt-10 pb-10 text-center">
                        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Aucune donnée</h3>
                        <p className="text-muted-foreground mb-6">
                            Créez votre première réservation pour voir vos statistiques.
                        </p>
                        <Button onClick={() => router.push('/dashboard/bookings/new')}>
                            Nouvelle réservation
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    Total dépensé
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{totalSpent}€</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sur {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    Total trajets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Depuis votre inscription
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Navigation className="h-4 w-4 text-orange-600" />
                                    Distance parcourue
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{totalDistance} km</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Estimation totale
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Leaf className="h-4 w-4 text-emerald-600" />
                                    CO₂ économisé
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">{co2Saved} kg</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    vs voiture personnelle
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphiques */}
                    <Tabs defaultValue="bookings" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="bookings">Réservations</TabsTrigger>
                            <TabsTrigger value="spending">Dépenses</TabsTrigger>
                            <TabsTrigger value="routes">Trajets</TabsTrigger>
                        </TabsList>

                        {/* Graphique des réservations */}
                        <TabsContent value="bookings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Évolution des réservations</CardTitle>
                                    <CardDescription>
                                        Nombre de réservations par mois (6 derniers mois)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            bookings: {
                                                label: 'Réservations',
                                                color: 'hsl(var(--primary))'
                                            }
                                        }}
                                        className="h-[300px]"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyStats}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="bookings"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Graphique des dépenses */}
                        <TabsContent value="spending">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dépenses mensuelles</CardTitle>
                                    <CardDescription>
                                        Montant total dépensé par mois (6 derniers mois)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            spending: {
                                                label: 'Dépenses (€)',
                                                color: '#10b981'
                                            }
                                        }}
                                        className="h-[300px]"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyStats}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar
                                                    dataKey="spending"
                                                    fill="#10b981"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Graphique des trajets */}
                        <TabsContent value="routes">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Trajets les plus fréquents</CardTitle>
                                        <CardDescription>
                                            Top 5 de vos itinéraires
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {topRoutes.map((route, index) => (
                                                <div key={route.route} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded ${
                                                            index === 0 ? 'bg-blue-500' :
                                                            index === 1 ? 'bg-green-500' :
                                                            index === 2 ? 'bg-yellow-500' :
                                                            index === 3 ? 'bg-red-500' :
                                                            'bg-purple-500'
                                                        }`} />
                                                        <span className="text-sm">{route.route}</span>
                                                    </div>
                                                    <span className="font-semibold">{route.count}x</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Répartition des trajets</CardTitle>
                                        <CardDescription>
                                            Distribution visuelle
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer
                                            config={{}}
                                            className="h-[200px]"
                                        >
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={topRoutes}
                                                        dataKey="count"
                                                        nameKey="route"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        label
                                                    >
                                                        {topRoutes.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Impact environnemental */}
                    <Card className="mt-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700">
                                <Leaf className="h-5 w-5" />
                                Votre impact environnemental
                            </CardTitle>
                            <CardDescription>
                                En choisissant Passerelle Jeunesse, vous contribuez à réduire les émissions de CO₂
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3 text-center">
                                <div className="p-4 rounded-lg bg-background border">
                                    <p className="text-3xl font-bold text-emerald-600">{co2Saved} kg</p>
                                    <p className="text-sm text-muted-foreground mt-1">CO₂ économisé</p>
                                </div>
                                <div className="p-4 rounded-lg bg-background border">
                                    <p className="text-3xl font-bold text-emerald-600">{Math.round(co2Saved / 25)}</p>
                                    <p className="text-sm text-muted-foreground mt-1">Arbres équivalents</p>
                                    <p className="text-xs text-muted-foreground">(1 arbre = 25kg CO₂/an)</p>
                                </div>
                                <div className="p-4 rounded-lg bg-background border">
                                    <p className="text-3xl font-bold text-emerald-600">{Math.round(totalDistance * 0.08)}L</p>
                                    <p className="text-sm text-muted-foreground mt-1">Carburant économisé</p>
                                    <p className="text-xs text-muted-foreground">(8L/100km moyenne)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
