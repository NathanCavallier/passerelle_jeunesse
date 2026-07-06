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
import type {
  LoyaltyTier,
  LoyaltyTierConfig,
  LoyaltyTransaction,
  LoyaltyTransactionType,
  LoyaltyReward,
  LoyaltyRedemption,
  Referral,
  ReferralStatus,
  PromoCode,
  PromoCodeUsage,
} from '@/types/firestore';

// ============================================================================
// TIERS DE FIDÉLITÉ
// ============================================================================

export const LOYALTY_TIERS: LoyaltyTierConfig[] = [
  {
    tier: 'bronze',
    label: 'Bronze',
    minPoints: 0,
    color: '#CD7F32',
    benefits: ['Accès au programme de fidélité', '1 point par euro dépensé'],
    pointsMultiplier: 1,
  },
  {
    tier: 'silver',
    label: 'Argent',
    minPoints: 500,
    color: '#C0C0C0',
    benefits: ['1,5x points par euro', '5% de réduction permanente', 'Accès prioritaire aux créneaux'],
    pointsMultiplier: 1.5,
  },
  {
    tier: 'gold',
    label: 'Or',
    minPoints: 1500,
    color: '#FFD700',
    benefits: ['2x points par euro', '10% de réduction permanente', 'Support prioritaire', 'Missions prioritaires'],
    pointsMultiplier: 2,
  },
  {
    tier: 'platinum',
    label: 'Platine',
    minPoints: 5000,
    color: '#E5E4E2',
    benefits: ['3x points par euro', '15% de réduction permanente', 'Accompagnateur dédié', 'Annulation gratuite'],
    pointsMultiplier: 3,
  },
];

export function getUserTier(points: number): LoyaltyTierConfig {
  const sorted = [...LOYALTY_TIERS].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find(t => points >= t.minPoints) || LOYALTY_TIERS[0];
}

export function getNextTier(points: number): LoyaltyTierConfig | null {
  const currentTier = getUserTier(points);
  const idx = LOYALTY_TIERS.findIndex(t => t.tier === currentTier.tier);
  return idx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[idx + 1] : null;
}

export function getProgressToNextTier(points: number): number {
  const current = getUserTier(points);
  const next = getNextTier(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ============================================================================
// POINTS MANAGEMENT
// ============================================================================

export const POINTS_RULES = {
  PER_EURO: 1,
  REVIEW_BONUS: 50,
  REFERRAL_REFERRER: 200,
  REFERRAL_REFEREE: 100,
  WELCOME_BONUS: 50,
  FIRST_BOOKING: 100,
};

export async function addLoyaltyPoints(
  userId: string,
  points: number,
  type: LoyaltyTransactionType,
  description: string,
  referenceId?: string
): Promise<void> {
  const db = await getFirebaseDb();
  // Récupérer le solde actuel
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Utilisateur non trouvé');

  const currentPoints = userSnap.data()?.parentProfile?.loyaltyPoints || 0;
  const newBalance = currentPoints + points;

  // Enregistrer la transaction
  await addDoc(collection(db, 'loyaltyTransactions'), {
    userId,
    type,
    points,
    description,
    referenceId: referenceId || '',
    balanceAfter: newBalance,
    createdAt: serverTimestamp(),
  });

  // Mettre à jour le solde
  await updateDoc(userRef, {
    'parentProfile.loyaltyPoints': increment(points),
    updatedAt: serverTimestamp(),
  });
}

export async function deductLoyaltyPoints(
  userId: string,
  points: number,
  description: string,
  referenceId?: string
): Promise<void> {
  const db = await getFirebaseDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Utilisateur non trouvé');

  const currentPoints = userSnap.data()?.parentProfile?.loyaltyPoints || 0;
  if (currentPoints < points) {
    throw new Error('Points insuffisants');
  }

  await addLoyaltyPoints(userId, -points, 'reward_redeemed', description, referenceId);
}

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

export async function getLoyaltyTransactions(
  userId: string,
  limitCount: number = 50
): Promise<LoyaltyTransaction[]> {
  const db = await getFirebaseDb();
  const q = query(
    collection(db, 'loyaltyTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoyaltyTransaction));
}

export function onLoyaltyTransactionsSnapshot(
  userId: string,
  callback: (transactions: LoyaltyTransaction[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'loyaltyTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as LoyaltyTransaction)));
  });
}

// ============================================================================
// REWARDS CATALOG
// ============================================================================

export async function getActiveRewards(): Promise<LoyaltyReward[]> {
  const db = await getFirebaseDb();
  const q = query(
    collection(db, 'loyaltyRewards'),
    where('active', '==', true),
    orderBy('pointsCost', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoyaltyReward));
}

export async function redeemReward(
  userId: string,
  rewardId: string
): Promise<string> {
  const db = await getFirebaseDb();
  const rewardRef = doc(db, 'loyaltyRewards', rewardId);
  const rewardSnap = await getDoc(rewardRef);
  if (!rewardSnap.exists()) throw new Error('Récompense non trouvée');

  const reward = rewardSnap.data() as LoyaltyReward;
  if (!reward.active) throw new Error('Récompense non disponible');
  if (reward.totalAvailable && reward.totalRedeemed >= reward.totalAvailable) {
    throw new Error('Récompense épuisée');
  }

  // Vérifier les points
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const currentPoints = userSnap.data()?.parentProfile?.loyaltyPoints || 0;
  if (currentPoints < reward.pointsCost) {
    throw new Error(`Points insuffisants (${currentPoints}/${reward.pointsCost})`);
  }

  // Générer un code unique
  const code = `PJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Créer la rédemption
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 3); // Expire dans 3 mois

  const redemptionRef = await addDoc(collection(db, 'loyaltyRedemptions'), {
    userId,
    rewardId,
    rewardName: reward.name,
    pointsSpent: reward.pointsCost,
    status: 'pending',
    code,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp(),
  });

  // Déduire les points
  await deductLoyaltyPoints(
    userId,
    reward.pointsCost,
    `Récompense: ${reward.name}`,
    redemptionRef.id
  );

  // Incrémenter le compteur
  await updateDoc(rewardRef, {
    totalRedeemed: increment(1),
    updatedAt: serverTimestamp(),
  });

  return code;
}

export async function getUserRedemptions(userId: string): Promise<LoyaltyRedemption[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'loyaltyRedemptions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoyaltyRedemption));
}

// ============================================================================
// REFERRAL PROGRAM
// ============================================================================

export async function createReferral(
  referrerId: string,
  referrerName: string,
  referrerEmail: string,
  refereeEmail: string,
  referralCode: string
): Promise<string> {
  // Vérifier que le parrain ne se parraine pas lui-même
  if (referrerEmail === refereeEmail) {
    throw new Error('Vous ne pouvez pas vous parrainer vous-même.');
  }

  // Vérifier qu'un parrainage n'existe pas déjà
  const db = getFirebaseDb();
  const existingQuery = query(
    collection(db, 'referrals'),
    where('referrerId', '==', referrerId),
    where('refereeEmail', '==', refereeEmail)
  );
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    throw new Error('Un parrainage existe déjà pour cet email.');
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6); // Expire dans 6 mois

  const docRef = await addDoc(collection(db, 'referrals'), {
    referrerId,
    referrerName,
    referrerEmail,
    refereeEmail,
    referralCode,
    status: 'pending' as ReferralStatus,
    invitedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return docRef.id;
}

export async function getUserReferrals(userId: string): Promise<Referral[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'referrals'),
    where('referrerId', '==', userId),
    orderBy('invitedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral));
}

export async function getReferralStats(userId: string): Promise<{
  totalInvited: number;
  registered: number;
  completed: number;
  totalPointsEarned: number;
}> {
  const referrals = await getUserReferrals(userId);
  return {
    totalInvited: referrals.length,
    registered: referrals.filter(r => ['registered', 'first_booking', 'completed'].includes(r.status)).length,
    completed: referrals.filter(r => r.status === 'completed').length,
    totalPointsEarned: referrals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.referrerReward || 0), 0),
  };
}

export function onReferralsSnapshot(
  userId: string,
  callback: (referrals: Referral[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'referrals'),
    where('referrerId', '==', userId),
    orderBy('invitedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral)));
  });
}

// ============================================================================
// PROMO CODES
// ============================================================================

export async function validatePromoCode(
  code: string,
  userId: string,
  bookingAmount: number
): Promise<{ valid: boolean; discount: number; promoCode?: PromoCode; error?: string }> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'promoCodes'),
    where('code', '==', code.toUpperCase()),
    where('active', '==', true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return { valid: false, discount: 0, error: 'Code promo invalide' };

  const promoCode = { id: snap.docs[0].id, ...snap.docs[0].data() } as PromoCode;

  // Vérifier la validité temporelle
  const now = Timestamp.now();
  if (promoCode.validFrom > now) return { valid: false, discount: 0, error: 'Code promo pas encore actif' };
  if (promoCode.validUntil < now) return { valid: false, discount: 0, error: 'Code promo expiré' };

  // Vérifier les limites d'utilisation
  if (promoCode.currentUses >= promoCode.maxUses) {
    return { valid: false, discount: 0, error: 'Code promo épuisé' };
  }

  // Vérifier la limite par utilisateur
  const usageQuery = query(
    collection(db, 'promoCodeUsages'),
    where('promoCodeId', '==', promoCode.id),
    where('userId', '==', userId)
  );
  const usageSnap = await getDocs(usageQuery);
  if (usageSnap.size >= promoCode.perUserLimit) {
    return { valid: false, discount: 0, error: 'Vous avez déjà utilisé ce code promo' };
  }

  // Vérifier le montant minimum
  if (promoCode.minBookingAmount && bookingAmount < promoCode.minBookingAmount) {
    return { valid: false, discount: 0, error: `Montant minimum requis : ${promoCode.minBookingAmount}€` };
  }

  // Calculer la réduction
  let discount = 0;
  if (promoCode.type === 'percentage') {
    discount = (bookingAmount * promoCode.value) / 100;
    if (promoCode.maxDiscount) {
      discount = Math.min(discount, promoCode.maxDiscount);
    }
  } else if (promoCode.type === 'fixed_amount') {
    discount = Math.min(promoCode.value, bookingAmount);
  } else if (promoCode.type === 'loyalty_points') {
    discount = 0; // Les points sont crédités après
  }

  return { valid: true, discount: Math.round(discount * 100) / 100, promoCode };
}

export async function applyPromoCode(
  promoCodeId: string,
  code: string,
  userId: string,
  bookingId: string,
  discountAmount: number
): Promise<void> {
  const db = getFirebaseDb();
  // Enregistrer l'utilisation
  await addDoc(collection(db, 'promoCodeUsages'), {
    promoCodeId,
    code,
    userId,
    bookingId,
    discountAmount,
    usedAt: serverTimestamp(),
  });

  // Incrémenter le compteur
  const promoRef = doc(db, 'promoCodes', promoCodeId);
  await updateDoc(promoRef, {
    currentUses: increment(1),
    updatedAt: serverTimestamp(),
  });
}
