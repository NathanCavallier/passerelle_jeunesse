'use client';

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { Review, ReviewCategories, ReviewStatus } from '@/types/firestore';

// ============================================================================
// REVIEW SUBMISSION
// ============================================================================

export interface SubmitReviewData {
  bookingId: string;
  missionId: string;
  authorId: string;
  authorName: string;
  rating: number;
  categories: ReviewCategories;
  comment?: string;
  wouldRecommend: boolean;
  isAnonymous: boolean;
}

export async function submitReview(data: SubmitReviewData): Promise<string> {
  // Vérifier qu'un avis n'existe pas déjà pour cette réservation
  const existingQuery = query(
    collection(getFirebaseDb(), 'reviews'),
    where('bookingId', '==', data.bookingId),
    where('authorId', '==', data.authorId)
  );
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    throw new Error('Vous avez déjà laissé un avis pour cette réservation.');
  }

  // Calculer la note globale (moyenne des catégories)
  const categoryValues = Object.values(data.categories);
  const overallRating = categoryValues.reduce((a, b) => a + b, 0) / categoryValues.length;

  const reviewData = {
    bookingId: data.bookingId,
    missionId: data.missionId,
    authorId: data.authorId,
    authorName: data.isAnonymous ? 'Anonyme' : data.authorName,
    rating: data.rating,
    categories: data.categories,
    overallRating: Math.round(overallRating * 10) / 10,
    comment: data.comment || '',
    wouldRecommend: data.wouldRecommend,
    status: 'approved' as ReviewStatus, // Auto-approuvé par défaut
    isPublic: true,
    isAnonymous: data.isAnonymous,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(getFirebaseDb(), 'reviews'), reviewData);

  // Mettre à jour le booking pour indiquer qu'un avis a été laissé
  const bookingRef = doc(getFirebaseDb(), 'bookings', data.bookingId);
  await updateDoc(bookingRef, {
    hasReview: true,
    reviewId: docRef.id,
    updatedAt: serverTimestamp(),
  });

  // Mettre à jour la note moyenne de l'accompagnateur
  await updateAccompanistRating(data.bookingId);

  return docRef.id;
}

// ============================================================================
// RATING CALCULATION
// ============================================================================

async function updateAccompanistRating(bookingId: string): Promise<void> {
  // Récupérer le booking pour trouver l'accompagnateur
  const bookingSnap = await getDoc(doc(getFirebaseDb(), 'bookings', bookingId));
  if (!bookingSnap.exists()) return;

  const booking = bookingSnap.data();
  const accompanistId = booking.accompanistId;
  if (!accompanistId) return;

  // Récupérer tous les avis pour cet accompagnateur
  const bookingsQuery = query(
    collection(getFirebaseDb(), 'bookings'),
    where('accompanistId', '==', accompanistId),
    where('hasReview', '==', true)
  );
  const bookingsSnap = await getDocs(bookingsQuery);
  const bookingIds = bookingsSnap.docs.map(d => d.id);
  if (bookingIds.length === 0) return;

  // Récupérer tous les avis approuvés
  const reviewsQuery = query(
    collection(getFirebaseDb(), 'reviews'),
    where('status', '==', 'approved')
  );
  const reviewsSnap = await getDocs(reviewsQuery);
  const relevantReviews = reviewsSnap.docs.filter(d => bookingIds.includes(d.data().bookingId));

  if (relevantReviews.length === 0) return;

  const totalRating = relevantReviews.reduce((sum, d) => sum + d.data().overallRating, 0);
  const averageRating = Math.round((totalRating / relevantReviews.length) * 10) / 10;
  const totalMissions = relevantReviews.length;

  // Mettre à jour le profil accompagnateur
  const userRef = doc(getFirebaseDb(), 'users', accompanistId);
  await updateDoc(userRef, {
    'accompanistProfile.rating': averageRating,
    'accompanistProfile.totalMissions': totalMissions,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// REVIEW QUERIES
// ============================================================================

export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  const q = query(
    collection(getFirebaseDb(), 'reviews'),
    where('bookingId', '==', bookingId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Review;
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const q = query(
    collection(getFirebaseDb(), 'reviews'),
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
}

export async function getPublicReviews(limitCount: number = 20): Promise<Review[]> {
  const q = query(
    collection(getFirebaseDb(), 'reviews'),
    where('status', '==', 'approved'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
}

export async function getReviewStats(): Promise<{
  totalReviews: number;
  averageRating: number;
  recommendationRate: number;
  ratingDistribution: Record<number, number>;
  categoryAverages: ReviewCategories;
}> {
  const q = query(
    collection(getFirebaseDb(), 'reviews'),
    where('status', '==', 'approved')
  );
  const snap = await getDocs(q);
  const reviews = snap.docs.map(d => d.data());

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      recommendationRate: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {
        punctuality: 0,
        communication: 0,
        professionalism: 0,
        youngsterSafety: 0,
        youngsterComfort: 0,
      },
    };
  }

  const totalRating = reviews.reduce((s, r) => s + (r.overallRating || 0), 0);
  const recommenders = reviews.filter(r => r.wouldRecommend).length;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const rounded = Math.round(r.overallRating || 0);
    const key = Math.min(5, Math.max(1, rounded));
    distribution[key] = (distribution[key] || 0) + 1;
  });

  const catKeys: (keyof ReviewCategories)[] = [
    'punctuality', 'communication', 'professionalism', 'youngsterSafety', 'youngsterComfort'
  ];
  const categoryAverages = {} as ReviewCategories;
  catKeys.forEach(key => {
    const total = reviews.reduce((s, r) => s + (r.categories?.[key] || 0), 0);
    categoryAverages[key] = Math.round((total / reviews.length) * 10) / 10;
  });

  return {
    totalReviews: reviews.length,
    averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
    recommendationRate: Math.round((recommenders / reviews.length) * 100),
    ratingDistribution: distribution,
    categoryAverages,
  };
}

// ============================================================================
// REAL-TIME LISTENERS
// ============================================================================

export function onPublicReviewsSnapshot(
  callback: (reviews: Review[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), 'reviews'),
    where('status', '==', 'approved'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    callback(reviews);
  });
}

// ============================================================================
// MODERATION (Admin)
// ============================================================================

export async function moderateReview(
  reviewId: string,
  action: 'approved' | 'rejected' | 'hidden',
  moderatorId: string,
  notes?: string
): Promise<void> {
  const reviewRef = doc(getFirebaseDb(), 'reviews', reviewId);
  await updateDoc(reviewRef, {
    status: action,
    moderatedBy: moderatorId,
    moderatedAt: serverTimestamp(),
    moderationNotes: notes || '',
    isPublic: action === 'approved',
    updatedAt: serverTimestamp(),
  });
}

export function onAllReviewsSnapshot(
  callback: (reviews: Review[]) => void
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    callback(reviews);
  });
}

// ============================================================================
// REVIEW RESPONSE (Accompanist)
// ============================================================================

export async function respondToReview(
  reviewId: string,
  text: string,
  respondedBy: string
): Promise<void> {
  const reviewRef = doc(getFirebaseDb(), 'reviews', reviewId);
  await updateDoc(reviewRef, {
    response: {
      text,
      respondedAt: Timestamp.now(),
      respondedBy,
    },
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// PENDING REVIEW CHECK
// ============================================================================

export async function getPendingReviewBookings(userId: string): Promise<string[]> {
  // Récupérer les bookings complétés sans avis
  const bookingsQuery = query(
    collection(getFirebaseDb(), 'bookings'),
    where('userId', '==', userId),
    where('status', '==', 'completed'),
  );
  const bookingsSnap = await getDocs(bookingsQuery);

  const pendingBookingIds: string[] = [];
  for (const bookingDoc of bookingsSnap.docs) {
    const data = bookingDoc.data();
    if (!data.hasReview) {
      pendingBookingIds.push(bookingDoc.id);
    }
  }

  return pendingBookingIds;
}
