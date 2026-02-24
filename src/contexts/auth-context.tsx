/**
 * Context d'authentification React
 * Fournit l'état d'authentification à toute l'application
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getCurrentUser } from '@/lib/auth-service';
import { getUserDocument, updateLastLogin } from '@/lib/firestore-service';
import { useTestAuth, PWA_TEST_MODE } from '@/lib/test-config';
import type { User } from '@/types/firestore';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isParent: boolean;
  isAccompanist: boolean;
  isAdmin: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAuthenticated: false,
  isEmailVerified: false,
  isParent: false,
  isAccompanist: false,
  isAdmin: false,
});

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mode test PWA
  const testAuth = useTestAuth();

  useEffect(() => {
    // Si mode test activé, utiliser les données de test
    if (PWA_TEST_MODE && testAuth) {
      setUser(testAuth.user as any);
      setUserProfile(testAuth.userProfile as any);
      setLoading(false);
      return;
    }

    // Écouter les changements d'authentification normale
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Récupérer le profil Firestore
          const profile = await getUserDocument(firebaseUser.uid);
          setUserProfile(profile);

          // Mettre à jour le dernier login
          await updateLastLogin(firebaseUser.uid);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, [testAuth]);

  const value: AuthContextType = useMemo(() => ({
    user,
    userProfile,
    loading,
    isAuthenticated: user !== null,
    isEmailVerified: user?.emailVerified ?? false,
    isParent: userProfile?.role === 'parent',
    isAccompanist: userProfile?.role === 'accompanist',
    isAdmin: userProfile?.role === 'admin',
  }), [user, userProfile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook pour accéder au contexte d'authentification
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
}
