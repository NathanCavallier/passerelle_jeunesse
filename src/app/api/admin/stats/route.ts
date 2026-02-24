/**
 * API Route - Statistiques admin
 * GET /api/admin/stats
 * 
 * Retourne les statistiques globales de la plateforme (server-side via Admin SDK)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
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

    // Récupérer les stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [usersSnap, bookingsSnap, monthBookingsSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('bookings').get(),
      adminDb.collection('bookings').where('createdAt', '>=', startOfMonth).get(),
    ]);

    const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const parents = users.filter((u: any) => u.role === 'parent');
    const accompanists = users.filter((u: any) => u.role === 'accompanist');
    const activeAccompanists = accompanists.filter((u: any) => u.status === 'active');
    const completedBookings = bookings.filter((b: any) => b.status === 'completed');
    const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled');
    const pendingBookings = bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed');

    const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.pricing?.total || 0), 0);
    const revenueThisMonth = monthBookingsSnap.docs
      .map((d) => d.data())
      .filter((b: any) => b.status === 'completed' || b.status === 'paid')
      .reduce((sum: number, b: any) => sum + (b.pricing?.total || 0), 0);

    const ratings = accompanists
      .filter((a: any) => a.accompanistProfile?.rating > 0)
      .map((a: any) => a.accompanistProfile.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length
      : 0;

    return NextResponse.json({
      totalUsers: users.length,
      totalParents: parents.length,
      totalAccompanists: accompanists.length,
      totalBookings: bookings.length,
      bookingsThisMonth: monthBookingsSnap.size,
      completedMissions: completedBookings.length,
      cancelledBookings: cancelledBookings.length,
      pendingBookings: pendingBookings.length,
      totalRevenue,
      revenueThisMonth,
      averageRating,
      activeAccompanists: activeAccompanists.length,
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
