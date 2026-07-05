/**
 * Page publique des avis et témoignages
 * Accessible sans authentification
 */

'use client';

import PageShell from '@/components/page-shell';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Star,
    ThumbsUp,
    Users,
    MessageSquare,
    Shield,
    ArrowLeft,
    Quote,
    Loader2
} from 'lucide-react';
import { getPublicReviews, getReviewStats } from '@/lib/review-service';
import type { Review, ReviewCategories } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

export const metadata = {
  title: 'Avis - Passerelle Jeunesse',
  description: 'Avis et témoignages des familles sur les services d’accompagnement et de mobilité de Passerelle Jeunesse.',
};

export default function PublicReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<{
        totalReviews: number;
        averageRating: number;
        recommendationRate: number;
        ratingDistribution: Record<number, number>;
        categoryAverages: ReviewCategories;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [publicReviews, reviewStats] = await Promise.all([
                    getPublicReviews(50),
                    getReviewStats(),
                ]);
                setReviews(publicReviews);
                setStats(reviewStats);
            } catch (error) {
                console.error('Erreur chargement avis:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const categoryLabels: Record<string, string> = {
        punctuality: 'Ponctualité',
        communication: 'Communication',
        professionalism: 'Professionnalisme',
        youngsterSafety: 'Sécurité',
        youngsterComfort: 'Confort du jeune',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <PageShell>
          <div className="container max-w-6xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-8 w-8" />
                    Avis et témoignages
                </h1>
                <p className="text-muted-foreground mt-2">
                    Découvrez ce que les familles pensent de Passerelle Jeunesse
                </p>
            </div>

            {/* Statistiques globales */}
            {stats && stats.totalReviews > 0 && (
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    {/* Note globale */}
                    <Card className="border-2 border-primary/20">
                        <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-bold text-primary mb-2">
                                {stats.averageRating.toFixed(1)}
                            </p>
                            <StarDisplay rating={Math.round(stats.averageRating)} size="lg" />
                            <p className="text-sm text-muted-foreground mt-2">
                                Basé sur {stats.totalReviews} avis
                            </p>
                        </CardContent>
                    </Card>

                    {/* Distribution */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Distribution des notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = stats.ratingDistribution[rating] || 0;
                                const percentage = stats.totalReviews > 0
                                    ? (count / stats.totalReviews) * 100
                                    : 0;
                                return (
                                    <div key={rating} className="flex items-center gap-2 text-sm">
                                        <span className="w-3">{rating}</span>
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        <Progress value={percentage} className="h-2 flex-1" />
                                        <span className="w-8 text-right text-muted-foreground">{count}</span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Recommandation & catégories */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                Recommandation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600 mb-4">
                                {stats.recommendationRate.toFixed(0)}%
                            </p>
                            <Separator className="my-3" />
                            <div className="space-y-1.5">
                                {Object.entries(stats.categoryAverages).map(([key, avg]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{categoryLabels[key] || key}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{avg.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Confiance */}
            <Card className="mb-8 bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Shield className="h-10 w-10 text-primary" />
                            <div>
                                <h3 className="font-bold">Avis vérifiés</h3>
                                <p className="text-sm text-muted-foreground">
                                    Seuls les parents ayant réservé un accompagnement peuvent laisser un avis.
                                    Chaque avis est modéré par notre équipe.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="h-10 w-10 text-primary" />
                            <div>
                                <h3 className="font-bold">Transparence totale</h3>
                                <p className="text-sm text-muted-foreground">
                                    Tous les avis sont publiés sans modification, qu'ils soient positifs ou négatifs.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des avis */}
            {reviews.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Derniers avis</h2>
                    {reviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <StarDisplay rating={review.overallRating} size="md" />
                                            <Badge variant="outline">
                                                {review.overallRating}/5
                                            </Badge>
                                            {review.wouldRecommend && (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                                    Recommande
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {review.isAnonymous ? 'Parent anonyme' : (review.authorName || 'Parent')}
                                            {' • '}
                                            {review.createdAt && format(
                                                review.createdAt instanceof Date ? review.createdAt : (review.createdAt as any).toDate(),
                                                'dd MMMM yyyy',
                                                { locale: fr }
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {review.comment && (
                                    <div className="flex gap-2 mb-4">
                                        <Quote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                                        <p className="text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                )}

                                {/* Catégories */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {review.categories && Object.entries(review.categories).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                                            <span className="text-muted-foreground">{categoryLabels[key] || key}:</span>
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{value}/5</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Réponse accompagnateur */}
                                {review.response && (
                                    <>
                                        <Separator className="my-3" />
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <p className="text-xs font-semibold text-primary mb-1">
                                                Réponse de l'accompagnateur
                                            </p>
                                            <p className="text-sm">{review.response.text}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Aucun avis pour le moment</h3>
                        <p className="text-muted-foreground">
                            Les premiers témoignages apparaîtront ici dès que des familles auront évalué leur accompagnement.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* CTA */}
            <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="py-8 text-center">
                    <h3 className="text-xl font-bold mb-2">Rejoignez les familles satisfaites</h3>
                    <p className="text-muted-foreground mb-4">
                        Réservez un accompagnement sécurisé pour votre jeune dès aujourd'hui.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg">S'inscrire gratuitement</Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline">Voir les tarifs</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
