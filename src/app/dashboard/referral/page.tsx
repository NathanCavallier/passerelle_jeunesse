/**
 * Page du programme de parrainage
 * Partage du code, suivi des filleuls, récompenses
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    ArrowLeft, 
    Users, 
    Copy,
    Mail,
    MessageCircle,
    Share2,
    Gift,
    Check,
    Info,
    Sparkles,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ParentProfile } from '@/types/firestore';
import { getUserDocument } from '@/lib/firestore-service';

interface ReferralReward {
    id: string;
    type: 'referrer' | 'referee';
    description: string;
    value: string;
    icon: React.ReactNode;
}

const REFERRAL_REWARDS: ReferralReward[] = [
    {
        id: 'r1',
        type: 'referrer',
        description: 'Vous gagnez une réduction de 20€',
        value: '20€',
        icon: <Gift className="h-5 w-5 text-green-600" />
    },
    {
        id: 'r2',
        type: 'referrer',
        description: 'Vous gagnez 200 points de fidélité',
        value: '200 pts',
        icon: <Sparkles className="h-5 w-5 text-yellow-600" />
    },
    {
        id: 'r3',
        type: 'referee',
        description: 'Votre filleul obtient 15€ de réduction',
        value: '15€',
        icon: <Gift className="h-5 w-5 text-blue-600" />
    }
];

export default function ReferralPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<ParentProfile | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                const profile = await getUserDocument(user.uid);
                if (profile?.parentProfile) {
                    setUserProfile(profile.parentProfile);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const referralLink = userProfile?.referralCode 
        ? `${window.location.origin}/register?ref=${userProfile.referralCode}`
        : '';

    const handleCopyCode = () => {
        if (userProfile?.referralCode) {
            navigator.clipboard.writeText(userProfile.referralCode);
            setCopied(true);
            toast({
                title: 'Code copié !',
                description: 'Votre code de parrainage a été copié dans le presse-papiers.',
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            toast({
                title: 'Lien copié !',
                description: 'Votre lien de parrainage a été copié dans le presse-papiers.',
            });
        }
    };

    const handleShareEmail = () => {
        const subject = 'Rejoignez Passerelle Jeunesse et profitez de 15€ de réduction !';
        const body = `Bonjour,\n\nJe vous recommande Passerelle Jeunesse, le service d'accompagnement sécurisé pour jeunes.\n\nInscrivez-vous avec mon code de parrainage ${userProfile?.referralCode} et profitez de 15€ de réduction sur votre première réservation !\n\nLien d'inscription : ${referralLink}\n\nÀ bientôt sur Passerelle Jeunesse !`;
        
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleShareWhatsApp = () => {
        const message = `Rejoignez Passerelle Jeunesse avec mon code de parrainage ${userProfile?.referralCode} et profitez de 15€ de réduction ! ${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShareSocial = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Rejoignez Passerelle Jeunesse',
                text: `Utilisez mon code de parrainage ${userProfile?.referralCode} pour 15€ de réduction !`,
                url: referralLink
            }).catch(() => {
                // Fallback si le partage échoue
                handleCopyLink();
            });
        } else {
            handleCopyLink();
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
        <div className="container max-w-5xl py-8 px-4">
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
                            <Users className="h-8 w-8" />
                            Programme de parrainage
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Parrainez vos proches et gagnez des récompenses
                        </p>
                    </div>
                </div>
            </div>

            {/* Carte du code de parrainage */}
            <Card className="mb-6 border-2 border-primary bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-6 w-6" />
                        Votre code de parrainage
                    </CardTitle>
                    <CardDescription>
                        Partagez ce code avec vos amis et famille
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Code de parrainage */}
                    <div className="flex items-center justify-center gap-4 p-6 bg-background rounded-lg border-2 border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Votre code</p>
                            <p className="text-4xl font-bold font-mono tracking-wider text-primary">
                                {userProfile?.referralCode || 'LOADING'}
                            </p>
                        </div>
                    </div>

                    {/* Boutons de partage */}
                    <div className="grid gap-3 md:grid-cols-2">
                        <Button
                            onClick={handleCopyCode}
                            variant="outline"
                            className="h-auto py-3"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                    Code copié !
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copier le code
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleCopyLink}
                            variant="outline"
                            className="h-auto py-3"
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Copier le lien d'inscription
                        </Button>

                        <Button
                            onClick={handleShareEmail}
                            variant="outline"
                            className="h-auto py-3"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Partager par email
                        </Button>

                        <Button
                            onClick={handleShareWhatsApp}
                            variant="outline"
                            className="h-auto py-3"
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Partager sur WhatsApp
                        </Button>
                    </div>

                    <Button
                        onClick={handleShareSocial}
                        className="w-full h-auto py-3"
                        size="lg"
                    >
                        <Share2 className="mr-2 h-5 w-5" />
                        Partager via...
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Récompenses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Vos récompenses
                        </CardTitle>
                        <CardDescription>
                            Ce que vous et vos filleuls recevez
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {REFERRAL_REWARDS.map((reward) => (
                            <div key={reward.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                <div className="p-2 rounded-full bg-primary/10">
                                    {reward.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant={reward.type === 'referrer' ? 'default' : 'secondary'}>
                                            {reward.type === 'referrer' ? 'Vous' : 'Votre filleul'}
                                        </Badge>
                                        <span className="font-bold text-primary">{reward.value}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                                </div>
                            </div>
                        ))}

                        <Alert className="mt-4">
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                Les récompenses sont créditées automatiquement après la première réservation 
                                complétée de votre filleul.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Statistiques */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Vos statistiques
                        </CardTitle>
                        <CardDescription>
                            Suivi de vos parrainages
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 rounded-lg border bg-card">
                                <p className="text-3xl font-bold text-primary">0</p>
                                <p className="text-sm text-muted-foreground mt-1">Filleuls inscrits</p>
                            </div>
                            <div className="text-center p-4 rounded-lg border bg-card">
                                <p className="text-3xl font-bold text-green-600">0€</p>
                                <p className="text-sm text-muted-foreground mt-1">Récompenses gagnées</p>
                            </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-900">Suivi en développement</AlertTitle>
                            <AlertDescription className="text-blue-800 text-sm">
                                Le système de suivi des filleuls sera bientôt disponible. 
                                Vous pourrez voir qui s'est inscrit avec votre code et vos récompenses en attente.
                            </AlertDescription>
                        </Alert>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Filleul le plus récent</h4>
                            <div className="text-center py-6 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Aucun filleul pour le moment</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Comment ça marche */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Comment ça marche ?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                                1
                            </div>
                            <h3 className="font-semibold mb-2">Partagez votre code</h3>
                            <p className="text-sm text-muted-foreground">
                                Envoyez votre code ou lien de parrainage à vos amis, famille ou collègues.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                                2
                            </div>
                            <h3 className="font-semibold mb-2">Ils s'inscrivent</h3>
                            <p className="text-sm text-muted-foreground">
                                Vos filleuls créent un compte en utilisant votre code et reçoivent 15€ de réduction.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                                3
                            </div>
                            <h3 className="font-semibold mb-2">Vous gagnez des récompenses</h3>
                            <p className="text-sm text-muted-foreground">
                                Après leur première réservation, recevez 20€ de réduction et 200 points de fidélité.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conditions */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Conditions du programme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p>Le code de parrainage doit être utilisé lors de l'inscription du nouveau parent</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p>Les récompenses sont créditées après la première réservation complétée du filleul</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p>Les réductions sont valables 6 mois après leur attribution</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p>Nombre illimité de filleuls - parrainez autant de personnes que vous le souhaitez</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p>Les codes promo obtenus par parrainage sont cumulables avec les points de fidélité</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p>Passerelle Jeunesse se réserve le droit de modifier ces conditions à tout moment</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
