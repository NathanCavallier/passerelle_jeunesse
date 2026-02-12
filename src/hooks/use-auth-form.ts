/**
 * Hook personnalisé pour les formulaires d'authentification
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signInWithGoogle, resetPassword, type SignUpData, type SignInData } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';

export function useAuthForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSignUp = async (data: SignUpData) => {
        setLoading(true);
        try {
            await signUp(data);
            toast({
                title: 'Compte créé avec succès !',
                description: 'Un email de vérification vous a été envoyé.',
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur lors de l\'inscription',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (data: SignInData) => {
        setLoading(true);
        try {
            await signIn(data);
            toast({
                title: 'Connexion réussie',
                description: 'Bienvenue sur Passerelle Jeunesse !',
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur de connexion',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            toast({
                title: 'Connexion réussie',
                description: 'Bienvenue sur Passerelle Jeunesse !',
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur de connexion',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (email: string) => {
        setLoading(true);
        try {
            await resetPassword(email);
            toast({
                title: 'Email envoyé',
                description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        handleSignUp,
        handleSignIn,
        handleGoogleSignIn,
        handlePasswordReset,
    };
}
