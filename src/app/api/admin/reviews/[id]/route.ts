/**
 * API Route - Modération des avis (Admin)
 * PUT /api/admin/reviews/[id]
 * 
 * Modérer un avis (approuver, rejeter, signaler) via Admin SDK
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Vérification du token d'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Vérifier le rôle admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { status, moderationNote } = body;

    if (!['approved', 'rejected', 'flagged'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    // Vérifier que l'avis existe
    const reviewRef = adminDb.collection('reviews').doc(id);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists) {
      return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
    }

    // Mettre à jour l'avis
    await reviewRef.update({
      status,
      moderationNote: moderationNote || null,
      moderatedAt: new Date(),
      moderatedBy: decodedToken.uid,
    });

    // Si approuvé et public, recalculer le rating de l'accompagnateur
    const reviewData = reviewDoc.data()!;
    if (status === 'approved' && reviewData.accompagnistId) {
      const approvedReviewsSnap = await adminDb
        .collection('reviews')
        .where('accompagnistId', '==', reviewData.accompagnistId)
        .where('status', '==', 'approved')
        .get();

      const allRatings = approvedReviewsSnap.docs.map(d => d.data().overallRating);
      // Inclure la review en cours si elle vient d'être approuvée
      if (!allRatings.includes(reviewData.overallRating)) {
        allRatings.push(reviewData.overallRating);
      }

      const averageRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

      // Mettre à jour le rating de l'accompagnateur
      const accompagnistUserDoc = await adminDb
        .collection('users')
        .where('accompagnistProfile.userId', '==', reviewData.accompagnistId)
        .limit(1)
        .get();

      if (!accompagnistUserDoc.empty) {
        await accompagnistUserDoc.docs[0].ref.update({
          'accompagnistProfile.rating': Math.round(averageRating * 10) / 10,
          'accompagnistProfile.totalReviews': allRatings.length,
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Avis ${status === 'approved' ? 'approuvé' : status === 'rejected' ? 'rejeté' : 'signalé'}` 
    });
  } catch (error: any) {
    console.error('Erreur modération avis:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
