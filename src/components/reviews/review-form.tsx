'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { submitReview, type SubmitReviewData } from '@/lib/review-service';
import { addLoyaltyPoints, POINTS_RULES } from '@/lib/loyalty-service';
import type { ReviewCategories } from '@/types/firestore';

interface ReviewFormProps {
  bookingId: string;
  missionId: string;
  authorId: string;
  authorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORY_LABELS: Record<keyof ReviewCategories, string> = {
  punctuality: 'Ponctualité',
  communication: 'Communication',
  professionalism: 'Professionnalisme',
  youngsterSafety: 'Sécurité des jeunes',
  youngsterComfort: 'Confort des jeunes',
};

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none transition-transform hover:scale-110"
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export { StarRating };

export default function ReviewForm({
  bookingId,
  missionId,
  authorId,
  authorName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState<ReviewCategories>({
    punctuality: 0,
    communication: 0,
    professionalism: 0,
    youngsterSafety: 0,
    youngsterComfort: 0,
  });
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const allCategoriesRated = Object.values(categories).every((v) => v > 0);
  const canSubmit = rating > 0 && allCategoriesRated;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await submitReview({
        bookingId,
        missionId,
        authorId,
        authorName,
        rating,
        categories,
        comment: comment.trim(),
        wouldRecommend,
        isAnonymous,
      });

      // Bonus fidélité pour l'avis
      try {
        await addLoyaltyPoints(
          authorId,
          POINTS_RULES.REVIEW_BONUS,
          'review_submitted',
          `Avis soumis pour la réservation ${bookingId}`,
          bookingId
        );
      } catch {
        // Silently fail for loyalty points (non-critical)
      }

      toast({
        title: 'Avis soumis ! 🎉',
        description: `Merci pour votre avis ! +${POINTS_RULES.REVIEW_BONUS} points de fidélité`,
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de soumettre l\'avis.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Évaluer la mission
        </CardTitle>
        <CardDescription>
          Votre avis nous aide à améliorer nos services. +{POINTS_RULES.REVIEW_BONUS} points bonus !
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Note globale */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Note globale</Label>
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="text-lg font-bold text-yellow-600">{rating}/5</span>
            )}
          </div>
        </div>

        {/* Notes par catégorie */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Notes détaillées</Label>
          {(Object.keys(CATEGORY_LABELS) as (keyof ReviewCategories)[]).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{CATEGORY_LABELS[key]}</span>
              <StarRating
                value={categories[key]}
                onChange={(v) => setCategories((prev) => ({ ...prev, [key]: v }))}
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Commentaire */}
        <div className="space-y-2">
          <Label htmlFor="comment">Commentaire (facultatif)</Label>
          <Textarea
            id="comment"
            placeholder="Partagez votre expérience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="recommend">Je recommande ce service</Label>
            <Switch
              id="recommend"
              checked={wouldRecommend}
              onCheckedChange={setWouldRecommend}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous">Publier anonymement</Label>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Plus tard
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? 'Envoi...' : 'Soumettre mon avis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
