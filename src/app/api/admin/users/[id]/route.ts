/**
 * API Route - Gestion des utilisateurs (admin)
 * PATCH /api/admin/users/[id]
 * 
 * Met à jour le statut d'un utilisateur (suspendre, activer, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Token d'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Vérifier le rôle admin
    const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { status, verifyDocument } = body;

    // Vérifier que l'utilisateur cible existe
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Changement de statut
    if (status) {
      updateData.status = status;

      // Si suspension, désactiver le compte Auth aussi
      if (status === 'suspended') {
        try {
          await adminAuth.updateUser(userId, { disabled: true });
        } catch (e) {
          console.warn('Impossible de désactiver le compte Auth:', e);
        }
      }

      // Si réactivation, réactiver le compte Auth
      if (status === 'active') {
        try {
          await adminAuth.updateUser(userId, { disabled: false });
        } catch (e) {
          console.warn('Impossible de réactiver le compte Auth:', e);
        }
      }
    }

    // Vérification de document
    if (verifyDocument) {
      const { documentType, verified } = verifyDocument;
      updateData[`accompanistProfile.documents.${documentType}.verified`] = verified;
      if (verified) {
        updateData[`accompanistProfile.documents.${documentType}.verifiedAt`] = FieldValue.serverTimestamp();
      } else {
        updateData[`accompanistProfile.documents.${documentType}.verifiedAt`] = null;
      }
    }

    await userRef.update(updateData);

    // Log d'audit
    await adminDb.collection('audit').add({
      action: status ? `user_${status}` : 'document_verified',
      actorId: decodedToken.uid,
      actorRole: 'admin',
      targetType: 'user',
      targetId: userId,
      details: { status, verifyDocument },
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour',
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
