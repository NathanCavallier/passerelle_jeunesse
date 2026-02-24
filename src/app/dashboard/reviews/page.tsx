'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MessageSquare, ThumbsUp, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useAuth } from '@/contexts/auth-context';
import { StarRating } from '@/components/reviews/review-form';
import ReviewForm from '@/components/reviews/review-form';
import { getUserReviews, getPendingReviewBookings, getReviewByBookingId } from '@/lib/review-service';
import type { Review } from '@/types/firestore';

function toSafeDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'outline' },
  approved: { label: 'Approuvé', variant: 'default' },
  rejected: { label: 'Rejeté', variant: 'destructive' },
  hidden: { label: 'Masqué', variant: 'secondary' },
};

const CATEGORY_LABELS: Record<string, string> = {
  punctuality: 'Ponctualité',
  communication: 'Communication',
  professionalism: 'Professionnalisme',
  youngsterSafety: 'Sécurité',
  youngsterComfort: 'Confort',
};

export default function ReviewsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingBookingIds, setPendingBookingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [userReviews, pending] = await Promise.all([
          getUserReviews(user.uid),
          getPendingReviewBookings(user.uid),
        ]);
        setReviews(userReviews);
        setPendingBookingIds(pending);
      } catch (error) {
        console.error('Erreur chargement avis:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (authLoading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length) * 10) / 10
    : 0;

  const handleReviewSuccess = async () => {
    setShowReviewForm(false);
    setSelectedBookingId(null);
    if (user) {
      const [userReviews, pending] = await Promise.all([
        getUserReviews(user.uid),
        getPendingReviewBookings(user.uid),
      ]);
      setReviews(userReviews);
      setPendingBookingIds(pending);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mes avis</h1>
            <p className="text-muted-foreground">
              Gérez vos évaluations de missions
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-background">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600">{averageRating}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Note moyenne donnée</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-primary">{reviews.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Avis soumis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-600">{pendingBookingIds.length}</p>
              <p className="text-sm text-muted-foreground mt-1">En attente d&apos;évaluation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter(r => r.wouldRecommend).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Recommandations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={pendingBookingIds.length > 0 ? 'pending' : 'submitted'}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              À évaluer {pendingBookingIds.length > 0 && (
                <Badge className="ml-2 bg-orange-500">{pendingBookingIds.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Mes avis ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Missions à évaluer */}
          <TabsContent value="pending">
            {pendingBookingIds.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <ThumbsUp className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-semibold">Tout est à jour !</p>
                  <p className="text-muted-foreground">Vous n&apos;avez aucune mission à évaluer.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingBookingIds.map((bookingId) => (
                  <Card key={bookingId} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Réservation #{bookingId.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Mission terminée — en attente d&apos;évaluation
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedBookingId(bookingId);
                          setShowReviewForm(true);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Évaluer
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Avis soumis */}
          <TabsContent value="submitted">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">Aucun avis soumis</p>
                  <p className="text-muted-foreground">
                    Vos avis apparaîtront ici après avoir évalué une mission.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedReview(review)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <StarRating value={Math.round(review.overallRating)} size="sm" />
                            <span className="font-semibold text-yellow-600">
                              {review.overallRating}/5
                            </span>
                            <Badge variant={STATUS_BADGES[review.status]?.variant || 'outline'}>
                              {STATUS_BADGES[review.status]?.label || review.status}
                            </Badge>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {review.comment}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(toSafeDate(review.createdAt), 'dd MMMM yyyy', { locale: fr })}
                            {review.isAnonymous && ' · Anonyme'}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {review.response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-1">
                            Réponse de l&apos;accompagnateur
                          </p>
                          <p className="text-sm text-blue-900">{review.response.text}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Lien vers avis publics */}
        <div className="mt-8 text-center">
          <Link href="/avis">
            <Button variant="outline" className="gap-2">
              <Star className="h-4 w-4" />
              Voir tous les avis publics
            </Button>
          </Link>
        </div>
      </main>
      <Footer />

      {/* Dialog détail avis */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Détail de l&apos;avis
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StarRating value={Math.round(selectedReview.overallRating)} size="md" />
                <span className="text-xl font-bold text-yellow-600">
                  {selectedReview.overallRating}/5
                </span>
              </div>

              <div className="space-y-2">
                {Object.entries(selectedReview.categories || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {CATEGORY_LABELS[key] || key}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating value={val as number} size="sm" />
                      <span className="font-medium w-6 text-right">{val as number}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedReview.comment && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedReview.comment}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {selectedReview.wouldRecommend ? 'Recommande' : 'Ne recommande pas'}
                </span>
                <span>
                  {format(toSafeDate(selectedReview.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </span>
              </div>

              {selectedReview.response && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Réponse de l&apos;accompagnateur
                  </p>
                  <p className="text-sm text-blue-900">{selectedReview.response.text}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {format(toSafeDate(selectedReview.response.respondedAt), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog formulaire avis */}
      <Dialog open={showReviewForm} onOpenChange={() => setShowReviewForm(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Évaluer la mission</DialogTitle>
          </DialogHeader>
          {selectedBookingId && user && userProfile && (
            <ReviewForm
              bookingId={selectedBookingId}
              missionId={selectedBookingId}
              authorId={user.uid}
              authorName={`${userProfile.firstName} ${userProfile.lastName}`}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
