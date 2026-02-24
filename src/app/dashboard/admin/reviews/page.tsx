/**
 * Page de modération des avis (Admin)
 * Validation, rejet, signalement des avis utilisateurs
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    Check,
    X,
    Eye,
    AlertTriangle,
    MessageSquare,
    Loader2,
    Shield,
    Clock,
    Ban,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { onAllReviewsSnapshot, moderateReview, respondToReview } from '@/lib/review-service';
import type { Review, ReviewStatus } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

const statusConfig: Record<ReviewStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<any> }> = {
    pending: { label: 'En attente', variant: 'secondary', icon: Clock },
    approved: { label: 'Approuvé', variant: 'default', icon: Check },
    rejected: { label: 'Rejeté', variant: 'destructive', icon: Ban },
    hidden: { label: 'Masqué', variant: 'outline', icon: AlertTriangle },
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [actionDialog, setActionDialog] = useState<{ review: Review; action: 'approve' | 'reject' | 'hide' } | null>(null);
    const [moderationNote, setModerationNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const unsubscribe = onAllReviewsSnapshot((allReviews) => {
            setReviews(allReviews);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredReviews = reviews.filter((review) => {
        if (activeTab === 'all') return true;
        return review.status === activeTab;
    });

    const counts = {
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
        hidden: reviews.filter(r => r.status === 'hidden').length,
        all: reviews.length,
    };

    const handleModeration = async () => {
        if (!actionDialog) return;
        setProcessing(true);

        try {
            const statusMap: Record<string, ReviewStatus> = {
                approve: 'approved',
                reject: 'rejected',
                hide: 'hidden',
            };
            
            await moderateReview(
                actionDialog.review.id!,
                statusMap[actionDialog.action] as 'approved' | 'rejected' | 'hidden',
                user?.uid || 'admin',
                moderationNote || undefined
            );

            toast({
                title: 'Avis modéré',
                description: `L'avis a été ${actionDialog.action === 'approve' ? 'approuvé' : actionDialog.action === 'reject' ? 'rejeté' : 'masqué'}.`,
            });
            setActionDialog(null);
            setModerationNote('');
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de modérer cet avis.',
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = date instanceof Date ? date : date.toDate();
        return format(d, 'dd MMM yyyy à HH:mm', { locale: fr });
    };

    const categoryLabels: Record<string, string> = {
        punctuality: 'Ponctualité',
        communication: 'Communication',
        professionalism: 'Professionnalisme',
        youngsterSafety: 'Sécurité',
        youngsterComfort: 'Confort du jeune',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Modération des avis
                </h1>
                <p className="text-muted-foreground">
                    Validez, rejetez ou signalez les avis des utilisateurs
                </p>
            </div>

            {/* Statistiques */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">{counts.all}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200">
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
                        <p className="text-xs text-muted-foreground">En attente</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200">
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
                        <p className="text-xs text-muted-foreground">Approuvés</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200">
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
                        <p className="text-xs text-muted-foreground">Rejetés</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-200">
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{counts.hidden}</p>
                        <p className="text-xs text-muted-foreground">Masqués</p>
                    </CardContent>
                </Card>
            </div>

            {/* Onglets */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="pending">
                        En attente {counts.pending > 0 && `(${counts.pending})`}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approuvés</TabsTrigger>
                    <TabsTrigger value="rejected">Rejetés</TabsTrigger>
                    <TabsTrigger value="hidden">Masqués</TabsTrigger>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    {filteredReviews.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">Aucun avis dans cette catégorie</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredReviews.map((review) => {
                                const config = statusConfig[review.status];
                                const StatusIcon = config.icon;
                                return (
                                    <Card key={review.id} className="hover:shadow-sm transition-shadow">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <StarDisplay rating={review.overallRating} />
                                                        <Badge variant={config.variant}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {config.label}
                                                        </Badge>
                                                        {review.wouldRecommend && (
                                                            <Badge variant="outline" className="text-green-600">
                                                                <ThumbsUp className="h-3 w-3 mr-1" />
                                                                Recommande
                                                            </Badge>
                                                        )}
                                                        {review.isAnonymous && (
                                                            <Badge variant="outline" className="text-muted-foreground">
                                                                Anonyme
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-1">
                                                        Par <span className="font-medium">{review.authorName || 'Parent'}</span>
                                                        {' • '}
                                                        {formatDate(review.createdAt)}
                                                    </p>

                                                    {review.comment && (
                                                        <p className="text-sm mt-2 line-clamp-2">{review.comment}</p>
                                                    )}

                                                    {/* Catégories résumées */}
                                                    {review.categories && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {Object.entries(review.categories).map(([key, val]) => (
                                                                <span key={key} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                                                    {categoryLabels[key]}: {val}/5
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-1 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setSelectedReview(review)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {review.status !== 'approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-green-600"
                                                            onClick={() => setActionDialog({ review, action: 'approve' })}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {review.status !== 'rejected' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600"
                                                            onClick={() => setActionDialog({ review, action: 'reject' })}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {review.status !== 'hidden' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-orange-600"
                                                            onClick={() => setActionDialog({ review, action: 'hide' })}
                                                        >
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialog détail */}
            <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Détail de l'avis</DialogTitle>
                        <DialogDescription>
                            Avis de {selectedReview?.authorName || 'Parent'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <StarDisplay rating={selectedReview.overallRating} />
                                <span className="font-bold">{selectedReview.overallRating}/5</span>
                            </div>

                            {selectedReview.comment && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Commentaire :</p>
                                    <p className="text-sm bg-muted p-3 rounded-lg">{selectedReview.comment}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium mb-2">Notes par catégorie :</p>
                                <div className="space-y-1">
                                    {selectedReview.categories && Object.entries(selectedReview.categories).map(([key, val]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{categoryLabels[key]}</span>
                                            <div className="flex items-center gap-1">
                                                <StarDisplay rating={val} />
                                                <span className="font-medium w-6 text-right">{val}/5</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Recommande :</span>
                                    <span className="ml-2 font-medium">{selectedReview.wouldRecommend ? 'Oui' : 'Non'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Anonyme :</span>
                                    <span className="ml-2 font-medium">{selectedReview.isAnonymous ? 'Oui' : 'Non'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Date :</span>
                                    <span className="ml-2 font-medium">{formatDate(selectedReview.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Statut :</span>
                                    <Badge className="ml-2" variant={statusConfig[selectedReview.status].variant}>
                                        {statusConfig[selectedReview.status].label}
                                    </Badge>
                                </div>
                            </div>

                            {selectedReview.response && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-blue-700 mb-1">Réponse accompagnateur :</p>
                                    <p className="text-sm">{selectedReview.response.text}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        {selectedReview?.status !== 'approved' && (
                            <Button
                                variant="default"
                                onClick={() => { setSelectedReview(null); setActionDialog({ review: selectedReview!, action: 'approve' }); }}
                            >
                                <Check className="h-4 w-4 mr-1" /> Approuver
                            </Button>
                        )}
                        {selectedReview?.status !== 'rejected' && (
                            <Button
                                variant="destructive"
                                onClick={() => { setSelectedReview(null); setActionDialog({ review: selectedReview!, action: 'reject' }); }}
                            >
                                <X className="h-4 w-4 mr-1" /> Rejeter
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog action de modération */}
            <Dialog open={!!actionDialog} onOpenChange={(open) => { if (!open) { setActionDialog(null); setModerationNote(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog?.action === 'approve' && 'Approuver cet avis'}
                            {actionDialog?.action === 'reject' && 'Rejeter cet avis'}
                            {actionDialog?.action === 'hide' && 'Masquer cet avis'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog?.action === 'approve' && "L'avis sera visible publiquement sur la page des témoignages."}
                            {actionDialog?.action === 'reject' && "L'avis ne sera pas publié. Le parent ne sera pas notifié."}
                            {actionDialog?.action === 'hide' && "L'avis sera masqué et ne sera plus visible publiquement."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Note de modération (optionnel)</label>
                            <Textarea
                                value={moderationNote}
                                onChange={(e) => setModerationNote(e.target.value)}
                                placeholder="Raison de la décision..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setActionDialog(null); setModerationNote(''); }}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleModeration}
                            disabled={processing}
                            variant={actionDialog?.action === 'reject' ? 'destructive' : 'default'}
                        >
                            {processing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
