/**
 * Configuration pour les tests PWA
 * Permet de bypass les vérifications de rôle en développement
 */

'use client';

import { useMemo } from 'react';

// Mode test PWA - À DÉSACTIVER EN PRODUCTION
export const PWA_TEST_MODE = true;

// Pages où le mode test est actif (évite les conflits sur dashboard principal)
export const PWA_TEST_PAGES = [
  '/dashboard/accompanist',
  '/dashboard/accompanist/test',
  '/dashboard/accompanist/missions'
];

// Utilisateur test pour les fonctionnalités PWA
export const TEST_USER_CONFIG = {
  role: 'accompanist' as const,
  email: 'test.accompanist@passerelle-jeunesse.fr',
  name: 'Accompagnateur Test',
  isEmailVerified: true
};

/**
 * Hook pour surcharger l'authentification en mode test
 */
export function useTestAuth() {
  const isTestPage = typeof window !== 'undefined' && PWA_TEST_MODE
    ? PWA_TEST_PAGES.some(page => window.location.pathname.startsWith(page))
    : false;

  return useMemo(() => {
    if (!PWA_TEST_MODE || !isTestPage) return null;

    return {
      isAuthenticated: true,
      isAccompanist: true,
      isParent: false,
      isAdmin: false,
      user: {
        uid: 'test-accompanist-uid',
        email: TEST_USER_CONFIG.email,
        displayName: TEST_USER_CONFIG.name,
        emailVerified: TEST_USER_CONFIG.isEmailVerified
      },
      userProfile: {
        id: 'test-accompanist-uid',
        email: TEST_USER_CONFIG.email,
        role: TEST_USER_CONFIG.role,
        firstName: 'Test',
        lastName: 'Accompagnateur',
        status: 'active' as const,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }, [isTestPage]);
}