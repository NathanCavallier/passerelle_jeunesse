/**
 * API Route - Soumission d'avis
 * POST /api/reviews
 * 
 * Soumettre un avis après une mission complétée
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
    const {
      bookingId,
      accompagnistId,
      accompagnistName,
      overallRating,
      categories,
      comment,
      wouldRecommend,
      isAnonymous,
    } = body;

    // Validations
    if (!bookingId || !accompagnistId || !overallRating) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json({ error: 'Note invalide' }, { status: 400 });
    }

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const bookingDoc = await adminDb.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    const bookingData = bookingDoc.data()!;
    if (bookingData.parentId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Non autorisé pour cette réservation' }, { status: 403 });
    }

    if (bookingData.status !== 'completed') {
      return NextResponse.json({ error: 'Seules les missions complétées peuvent être évaluées' }, { status: 400 });
    }

    // Vérifier s'il n'existe pas déjà un avis pour cette réservation
    const existingReview = await adminDb
      .collection('reviews')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json({ error: 'Un avis existe déjà pour cette réservation' }, { status: 409 });
    }

    // Récupérer les infos du parent
    const parentDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const parentData = parentDoc.data();
    const parentName = parentData?.parentProfile?.firstName 
      ? `${parentData.parentProfile.firstName} ${parentData.parentProfile.lastName?.charAt(0) || ''}.`
      : 'Parent';

    // Créer l'avis
    const reviewRef = await adminDb.collection('reviews').add({
      bookingId,
      parentId: decodedToken.uid,
      parentName: isAnonymous ? 'Anonyme' : parentName,
      accompagnistId,
      accompagnistName: accompagnistName || '',
      overallRating,
      categories: categories || {},
      comment: comment || '',
      wouldRecommend: wouldRecommend ?? true,
      isAnonymous: isAnonymous || false,
      status: 'pending',
      isPublic: !isAnonymous,
      createdAt: new Date(),
    });

    // Bonus fidélité pour l'avis
    if (parentData?.parentProfile) {
      const currentPoints = parentData.parentProfile.loyaltyPoints || 0;
      await adminDb.collection('users').doc(decodedToken.uid).update({
        'parentProfile.loyaltyPoints': currentPoints + 50,
      });

      await adminDb.collection('loyaltyTransactions').add({
        userId: decodedToken.uid,
        type: 'earned',
        points: 50,
        description: 'Bonus avis déposé',
        reference: reviewRef.id,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      reviewId: reviewRef.id,
      message: 'Avis soumis avec succès (+50 points fidélité)',
    });
  } catch (error: any) {
    console.error('Erreur soumission avis:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews - Récupérer les avis publics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const accompagnistId = searchParams.get('accompagnistId');

    let query = adminDb
      .collection('reviews')
      .where('status', '==', 'approved')
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(Math.min(limit, 50));

    if (accompagnistId) {
      query = adminDb
        .collection('reviews')
        .where('accompagnistId', '==', accompagnistId)
        .where('status', '==', 'approved')
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(Math.min(limit, 50));
    }

    const snapshot = await query.get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Erreur récupération avis:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
