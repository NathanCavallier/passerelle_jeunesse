/**
 * Service d'authentification Firebase
 * Gère toutes les opérations d'authentification
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User as FirebaseUser,
    UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserDocument, getUserDocument } from './firestore-service';
import type { UserRole } from '@/types/firestore';

const googleProvider = new GoogleAuthProvider();

// ============================================================================
// TYPES
// ============================================================================

export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    address: {
        street: string;
        postalCode: string;
        city: string;
        country: string;
    };
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthError {
    code: string;
    message: string;
}

// ============================================================================
// INSCRIPTION
// ============================================================================

/**
 * Inscrit un nouvel utilisateur avec email et mot de passe
 */
export async function signUp(data: SignUpData): Promise<UserCredential> {
    try {
        // Créer le compte Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        // Mettre à jour le profil avec le nom
        await updateProfile(userCredential.user, {
            displayName: `${data.firstName} ${data.lastName}`,
        });

        // Créer le document utilisateur dans Firestore
        await createUserDocument(userCredential.user.uid, {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            role: data.role,
            address: data.address,
        });

        // Envoyer l'email de vérification
        await sendEmailVerification(userCredential.user);

        return userCredential;
    } catch (error: any) {
        throw handleAuthError(error);
    }
}

// ============================================================================
// CONNEXION
// ============================================================================

/**
 * Connecte un utilisateur avec email et mot de passe
 */
export async function signIn(data: SignInData): Promise<UserCredential> {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        // Mettre à jour le lastLoginAt dans Firestore
        // (sera géré par le service Firestore)

        return userCredential;
    } catch (error: any) {
        throw handleAuthError(error);
    }
}

/**
 * Connecte un utilisateur avec Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
    try {
        const userCredential = await signInWithPopup(auth, googleProvider);

        // Vérifier si c'est une première connexion
        const userDoc = await getUserDocument(userCredential.user.uid);

        // Si l'utilisateur n'existe pas dans Firestore, créer son profil
        if (!userDoc) {
            const nameParts = userCredential.user.displayName?.split(' ') || ['', ''];
            await createUserDocument(userCredential.user.uid, {
                email: userCredential.user.email || '',
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' '),
                phoneNumber: userCredential.user.phoneNumber || '',
                role: 'parent', // Par défaut, les inscriptions Google sont des parents
                address: {
                    street: '',
                    postalCode: '',
                    city: '',
                    country: 'France',
                },
            });
        }

        return userCredential;
    } catch (error: any) {
        throw handleAuthError(error);
    }
}

// ============================================================================
// DÉCONNEXION
// ============================================================================

/**
 * Déconnecte l'utilisateur actuel
 */
export async function logout(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw handleAuthError(error);
    }
}

// ============================================================================
// RÉINITIALISATION MOT DE PASSE
// ============================================================================

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email, {
            url: `${window.location.origin}/login`,
            handleCodeInApp: false,
        });
    } catch (error: any) {
        throw handleAuthError(error);
    }
}

// ============================================================================
// VÉRIFICATION EMAIL
// ============================================================================

/**
 * Renvoie l'email de vérification
 */
export async function resendVerificationEmail(): Promise<void> {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Aucun utilisateur connecté');
        }

        if (user.emailVerified) {
            throw new Error('Email déjà vérifié');
        }

        await sendEmailVerification(user);
    } catch (error: any) {
        throw handleAuthError(error);
    }
}

// ============================================================================
// OBSERVATEUR D'ÉTAT
// ============================================================================

/**
 * Écoute les changements d'état d'authentification
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export function getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
}

/**
 * Vérifie si un utilisateur est connecté
 */
export function isAuthenticated(): boolean {
    return auth.currentUser !== null;
}

/**
 * Récupère le token ID de l'utilisateur actuel
 */
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        return null;
    }
}

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

/**
 * Convertit les erreurs Firebase en messages lisibles
 */
function handleAuthError(error: any): AuthError {
    const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/operation-not-allowed': 'Opération non autorisée.',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
        'auth/user-disabled': 'Ce compte a été désactivé.',
        'auth/user-not-found': 'Aucun compte ne correspond à cette adresse email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
        'auth/popup-closed-by-user': 'Connexion annulée.',
        'auth/cancelled-popup-request': 'Connexion annulée.',
        'auth/popup-blocked': 'Pop-up bloquée. Autorisez les pop-ups pour ce site.',
        'auth/requires-recent-login': 'Veuillez vous reconnecter pour effectuer cette action.',
    };

    return {
        code: error.code || 'unknown',
        message: errorMessages[error.code] || error.message || 'Une erreur est survenue.',
    };
}

export { auth };
