/**
 * API Route - Programme de fidélité
 * POST /api/loyalty/redeem - Échanger des points contre une récompense
 * GET /api/loyalty/transactions - Historique des transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Vérification du token d'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const body = await request.json();
    const { action, rewardId, rewardTitle, pointsCost } = body;

    if (action !== 'redeem') {
      return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
    }

    if (!rewardTitle || !pointsCost || pointsCost <= 0) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier le solde de points
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const currentPoints = userData.parentProfile?.loyaltyPoints || 0;

    if (currentPoints < pointsCost) {
      return NextResponse.json({ error: 'Points insuffisants' }, { status: 400 });
    }

    // Déduire les points
    await adminDb.collection('users').doc(decodedToken.uid).update({
      'parentProfile.loyaltyPoints': currentPoints - pointsCost,
    });

    // Créer la transaction
    await adminDb.collection('loyaltyTransactions').add({
      userId: decodedToken.uid,
      type: 'redeemed',
      points: -pointsCost,
      description: `Échange: ${rewardTitle}`,
      reference: rewardId || 'reward',
      createdAt: new Date(),
    });

    // Générer un code promo
    const promoCode = `PJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    await adminDb.collection('loyaltyRedemptions').add({
      userId: decodedToken.uid,
      rewardId: rewardId || 'custom',
      rewardTitle,
      pointsSpent: pointsCost,
      promoCode,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 mois
    });

    return NextResponse.json({
      success: true,
      newBalance: currentPoints - pointsCost,
      promoCode,
      message: `${pointsCost} points échangés contre : ${rewardTitle}`,
    });
  } catch (error: any) {
    console.error('Erreur fidélité:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'transactions';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'redemptions') {
      const snapshot = await adminDb
        .collection('loyaltyRedemptions')
        .where('userId', '==', decodedToken.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const redemptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        expiresAt: doc.data().expiresAt?.toDate?.()?.toISOString() || null,
      }));

      return NextResponse.json({ redemptions });
    }

    const snapshot = await adminDb
      .collection('loyaltyTransactions')
      .where('userId', '==', decodedToken.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Erreur récupération fidélité:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
