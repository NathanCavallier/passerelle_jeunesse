/**
 * API Route - Attribution accompagnateur (admin)
 * POST /api/admin/bookings/[id]/assign
 *
 * Assigne un accompagnateur à une réservation via Admin SDK
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const params = typeof context.params?.then === 'function' ? await context.params : context.params;
    const bookingId = params.id;

    // Vérification du token
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
    const { accompanistId } = body;

    if (!accompanistId) {
      return NextResponse.json(
        { error: 'accompanistId requis' },
        { status: 400 }
      );
    }

    // Vérifier que le booking existe
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'accompagnateur existe et est actif
    const accDoc = await adminDb.collection('users').doc(accompanistId).get();
    if (!accDoc.exists || accDoc.data()?.role !== 'accompanist') {
      return NextResponse.json(
        { error: 'Accompagnateur invalide' },
        { status: 400 }
      );
    }

    // Assigner l'accompagnateur
    await bookingRef.update({
      accompanistId,
      status: 'assigned',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log d'audit
    await adminDb.collection('audit').add({
      action: 'booking_assigned',
      actorId: decodedToken.uid,
      actorRole: 'admin',
      targetType: 'booking',
      targetId: bookingId,
      details: { accompanistId },
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Accompagnateur assigné avec succès',
    });
  } catch (error) {
    console.error('Erreur assignation:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
