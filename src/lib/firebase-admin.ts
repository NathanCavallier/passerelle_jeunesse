/**
 * Firebase Admin SDK Configuration
 * Pour les API routes Next.js (server-side)
 */

import * as admin from 'firebase-admin';

// Initialiser Firebase Admin
if (!admin.apps.length) {
    try {
        // En production, utiliser les credentials de la variable d'environnement
        if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
            const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
            admin.initializeApp({
                credential: admin.credential.cert(credentials),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else if (
            process.env.FIREBASE_ADMIN_PROJECT_ID &&
            process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
            process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ) {
            // Alternative : credentials séparés
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else {
            // En développement : utiliser Application Default Credentials (gcloud)
            // Ou initialiser sans credentials (mode développement local)
            console.warn('⚠️ Firebase Admin SDK initialisé sans credentials');
            console.warn('Les opérations Firestore peuvent échouer sans credentials valides');
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }
        console.log('✅ Firebase Admin SDK initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation Firebase Admin:', error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
