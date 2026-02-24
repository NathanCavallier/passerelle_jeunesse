/**
 * Page du programme de fidélité
 * Historique des points, récompenses, niveaux
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
    ArrowLeft, 
    TrendingUp, 
    Gift, 
    Star, 
    Award,
    Sparkles,
    Calendar,
    Info,
    Check,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, ParentProfile, LoyaltyTransaction } from '@/types/firestore';
import { getUserDocument } from '@/lib/firestore-service';
import { getLoyaltyTransactions, redeemReward as redeemRewardService, getUserRedemptions, deductLoyaltyPoints, addLoyaltyPoints } from '@/lib/loyalty-service';
import type { LoyaltyRedemption } from '@/types/firestore';

interface LoyaltyTier {
    name: string;
    minPoints: number;
    maxPoints: number;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    benefits: string[];
}

interface Reward {
    id: string;
    title: string;
    description: string;
    pointsCost: number;
    type: 'discount' | 'free_trip' | 'upgrade';
    value: string;
    available: boolean;
}

interface PointsTransaction {
    id: string;
    date: Date;
    type: 'earned' | 'redeemed';
    amount: number;
    description: string;
    bookingId?: string;
}

const LOYALTY_TIERS: LoyaltyTier[] = [
    {
        name: 'Bronze',
        minPoints: 0,
        maxPoints: 499,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        icon: <Star className="h-5 w-5 text-amber-700" />,
        benefits: [
            '1 point par € dépensé',
            'Accès aux offres spéciales',
            'Newsletter mensuelle'
        ]
    },
    {
        name: 'Argent',
        minPoints: 500,
        maxPoints: 1499,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        icon: <Award className="h-5 w-5 text-slate-600" />,
        benefits: [
            '1.5 points par € dépensé',
            'Réduction de 5% sur toutes les courses',
            'Support prioritaire',
            'Accès anticipé aux nouveaux services'
        ]
    },
    {
        name: 'Or',
        minPoints: 1500,
        maxPoints: Infinity,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: <Sparkles className="h-5 w-5 text-yellow-600" />,
        benefits: [
            '2 points par € dépensé',
            'Réduction de 10% sur toutes les courses',
            'Support VIP 24/7',
            '1 trajet gratuit par an',
            'Accompagnateurs premium prioritaires',
            'Anniversaire jeune : trajet offert'
        ]
    }
];

const REWARDS_CATALOG: Reward[] = [
    {
        id: 'r1',
        title: 'Réduction 5€',
        description: 'Utilisez cette récompense sur votre prochaine réservation',
        pointsCost: 100,
        type: 'discount',
        value: '5€',
        available: true
    },
    {
        id: 'r2',
        title: 'Réduction 10€',
        description: 'Économisez 10€ sur une course de votre choix',
        pointsCost: 180,
        type: 'discount',
        value: '10€',
        available: true
    },
    {
        id: 'r3',
        title: 'Réduction 20€',
        description: 'Grande économie sur une réservation',
        pointsCost: 350,
        type: 'discount',
        value: '20€',
        available: true
    },
    {
        id: 'r4',
        title: 'Réduction 50€',
        description: 'Récompense premium pour vos longs trajets',
        pointsCost: 800,
        type: 'discount',
        value: '50€',
        available: true
    },
    {
        id: 'r5',
        title: 'Trajet gratuit',
        description: 'Un trajet complet entièrement gratuit (jusqu\'à 100€)',
        pointsCost: 1500,
        type: 'free_trip',
        value: 'Gratuit',
        available: true
    },
    {
        id: 'r6',
        title: 'Upgrade Premium',
        description: 'Accompagnateur premium garanti pour votre prochain trajet',
        pointsCost: 500,
        type: 'upgrade',
        value: 'Premium',
        available: true
    }
];

export default function LoyaltyPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<ParentProfile | null>(null);
    const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
    const [currentTier, setCurrentTier] = useState<LoyaltyTier>(LOYALTY_TIERS[0]);
    const [nextTier, setNextTier] = useState<LoyaltyTier | null>(LOYALTY_TIERS[1]);
    const [progressToNext, setProgressToNext] = useState(0);
    const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                // Charger le profil utilisateur
                const profile = await getUserDocument(user.uid);
                if (profile?.parentProfile) {
                    setUserProfile(profile.parentProfile);

                    // Déterminer le niveau actuel
                    const points = profile.parentProfile.loyaltyPoints;
                    const tier = LOYALTY_TIERS.find(
                        t => points >= t.minPoints && points <= t.maxPoints
                    ) || LOYALTY_TIERS[0];
                    setCurrentTier(tier);

                    // Déterminer le niveau suivant
                    const tierIndex = LOYALTY_TIERS.indexOf(tier);
                    const next = tierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[tierIndex + 1] : null;
                    setNextTier(next);

                    // Calculer le progrès vers le niveau suivant
                    if (next) {
                        const progress = ((points - tier.minPoints) / (next.minPoints - tier.minPoints)) * 100;
                        setProgressToNext(Math.min(progress, 100));
                    } else {
                        setProgressToNext(100); // Niveau max atteint
                    }
                }

                // Charger l'historique des bookings pour simuler les transactions
                const bookingsRef = collection(db, 'bookings');
                const q = query(
                    bookingsRef,
                    where('parentId', '==', user.uid),
                    where('status', 'in', ['completed', 'paid'])
                );
                const bookingsSnapshot = await getDocs(q);

                // Construire et trier les transactions côté client
                const txs: PointsTransaction[] = [];
                bookingsSnapshot.forEach((doc) => {
                    const booking = { id: doc.id, ...doc.data() } as Booking;
                    
                    // Points gagnés = 1 point par euro dépensé (niveau Bronze)
                    // On pourrait ajuster selon le niveau au moment de la transaction
                    const pointsEarned = Math.floor(booking.pricing.total);
                    
                    if (booking.createdAt) {
                        txs.push({
                            id: booking.id,
                            date: booking.createdAt.toDate(),
                            type: 'earned',
                            amount: pointsEarned,
                            description: `Réservation ${booking.trip.departure.city} → ${booking.trip.arrival.city}`,
                            bookingId: booking.id
                        });
                    }
                });

                setTransactions(txs);
            } catch (error) {
                console.error('Erreur lors du chargement des données de fidélité:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleRedeemReward = async (reward: Reward) => {
        if (!user || !userProfile || userProfile.loyaltyPoints < reward.pointsCost) {
            return;
        }
        setRedeemingId(reward.id);
        try {
            // Déduire les points
            await deductLoyaltyPoints(
                user.uid,
                reward.pointsCost,
                `Échange: ${reward.title} (${reward.value})`
            );
            toast({
                title: 'Récompense échangée ! 🎉',
                description: `${reward.pointsCost} points déduits pour : ${reward.title}`,
            });
            // Recharger le profil
            const profile = await getUserDocument(user.uid);
            if (profile?.parentProfile) {
                setUserProfile(profile.parentProfile);
                const points = profile.parentProfile.loyaltyPoints;
                const tier = LOYALTY_TIERS.find(
                    t => points >= t.minPoints && points <= t.maxPoints
                ) || LOYALTY_TIERS[0];
                setCurrentTier(tier);
                const tierIndex = LOYALTY_TIERS.indexOf(tier);
                const next = tierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[tierIndex + 1] : null;
                setNextTier(next);
                if (next) {
                    const progress = ((points - tier.minPoints) / (next.minPoints - tier.minPoints)) * 100;
                    setProgressToNext(Math.min(progress, 100));
                } else {
                    setProgressToNext(100);
                }
            }
        } catch (error: any) {
            toast({
                title: 'Erreur',
                description: error.message || 'Impossible d\'échanger cette récompense.',
                variant: 'destructive',
            });
        } finally {
            setRedeemingId(null);
        }
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
        <div className="container max-w-6xl py-8 px-4">
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Gift className="h-8 w-8" />
                            Programme de fidélité
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gagnez des points à chaque réservation et profitez de récompenses exclusives
                        </p>
                    </div>
                </div>
            </div>

            {/* Carte de niveau actuel */}
            <Card className={`mb-6 border-2 ${currentTier.bgColor}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${currentTier.bgColor} border-2`}>
                                {currentTier.icon}
                            </div>
                            <div>
                                <h2 className={`text-2xl font-bold ${currentTier.color}`}>
                                    Niveau {currentTier.name}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Membre depuis {user?.metadata?.creationTime ? 
                                        format(new Date(user.metadata.creationTime), 'MMMM yyyy', { locale: fr }) 
                                        : 'récemment'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">
                                {userProfile?.loyaltyPoints || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">points</p>
                        </div>
                    </div>

                    {nextTier && (
                        <>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Progrès vers {nextTier.name}
                                    </span>
                                    <span className="font-medium">
                                        {nextTier.minPoints - (userProfile?.loyaltyPoints || 0)} points restants
                                    </span>
                                </div>
                                <Progress value={progressToNext} className="h-2" />
                            </div>
                        </>
                    )}

                    {!nextTier && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <Sparkles className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-900">Niveau maximum atteint !</AlertTitle>
                            <AlertDescription className="text-yellow-800">
                                Vous bénéficiez de tous les avantages du programme de fidélité.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="rewards" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rewards">Récompenses</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                    <TabsTrigger value="tiers">Niveaux</TabsTrigger>
                </TabsList>

                {/* Onglet Récompenses */}
                <TabsContent value="rewards" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Catalogue de récompenses</CardTitle>
                            <CardDescription>
                                Échangez vos points contre des réductions et avantages exclusifs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {REWARDS_CATALOG.map((reward) => {
                                    const canAfford = (userProfile?.loyaltyPoints || 0) >= reward.pointsCost;
                                    
                                    return (
                                        <Card key={reward.id} className={canAfford ? 'border-primary' : 'opacity-60'}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{reward.title}</h3>
                                                        <Badge variant="secondary" className="mt-1">
                                                            {reward.pointsCost} points
                                                        </Badge>
                                                    </div>
                                                    <Gift className="h-5 w-5 text-primary" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {reward.description}
                                                </p>
                                                <Button 
                                                    className="w-full"
                                                    disabled={!canAfford || redeemingId === reward.id}
                                                    onClick={() => handleRedeemReward(reward)}
                                                    variant={canAfford ? 'default' : 'outline'}
                                                >
                                                    {redeemingId === reward.id ? 'Échange en cours...' : canAfford ? 'Échanger' : 'Points insuffisants'}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Comment ça marche ?</AlertTitle>
                        <AlertDescription>
                            Les récompenses échangées génèrent un code promo automatiquement appliqué à votre prochaine réservation.
                            Les codes sont valables 6 mois après leur création.
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                {/* Onglet Historique */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Historique des points
                            </CardTitle>
                            <CardDescription>
                                Toutes vos transactions de points de fidélité
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <h3 className="font-semibold text-lg mb-2">Aucune transaction</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Vous gagnerez des points avec vos prochaines réservations
                                    </p>
                                    <Button onClick={() => router.push('/dashboard/bookings/new')}>
                                        Créer une réservation
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${
                                                    tx.type === 'earned' 
                                                        ? 'bg-green-50 text-green-600' 
                                                        : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {tx.type === 'earned' ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <Gift className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{tx.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(tx.date, 'dd MMMM yyyy', { locale: fr })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-lg font-bold ${
                                                tx.type === 'earned' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Règles du programme</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <p>Gagnez des points sur chaque réservation complétée (1 point = 1€ niveau Bronze)</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <p>Les points sont crédités automatiquement après chaque trajet terminé</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <p>Les points n'expirent jamais tant que votre compte est actif</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <p>Les codes promo obtenus sont valables 6 mois</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <p>Un seul code promo par réservation</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Onglet Niveaux */}
                <TabsContent value="tiers" className="space-y-4">
                    {LOYALTY_TIERS.map((tier, index) => {
                        const isCurrentTier = tier.name === currentTier.name;
                        const isUnlocked = (userProfile?.loyaltyPoints || 0) >= tier.minPoints;

                        return (
                            <Card key={tier.name} className={`${isCurrentTier ? 'border-2 border-primary' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-full ${tier.bgColor} border-2`}>
                                                {tier.icon}
                                            </div>
                                            <div>
                                                <CardTitle className={`flex items-center gap-2 ${tier.color}`}>
                                                    Niveau {tier.name}
                                                    {isCurrentTier && (
                                                        <Badge variant="default">Votre niveau</Badge>
                                                    )}
                                                </CardTitle>
                                                <CardDescription>
                                                    {tier.maxPoints === Infinity 
                                                        ? `${tier.minPoints}+ points`
                                                        : `${tier.minPoints} - ${tier.maxPoints} points`}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {isUnlocked && (
                                            <Check className="h-6 w-6 text-green-600" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold mb-3">Avantages :</h4>
                                    <ul className="space-y-2">
                                        {tier.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Sparkles className={`h-4 w-4 mt-0.5 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <span className={!isUnlocked ? 'text-muted-foreground' : ''}>
                                                    {benefit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    {!isUnlocked && (
                                        <div className="mt-4 p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                Encore {tier.minPoints - (userProfile?.loyaltyPoints || 0)} points 
                                                pour débloquer ce niveau
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </TabsContent>
            </Tabs>
        </div>
    );
}
