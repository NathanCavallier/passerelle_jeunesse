'use client';

/**
 * Composant PaymentButton - Bouton de paiement Stripe
 * Redirige vers Stripe Checkout pour effectuer un paiement
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { getStripe, isStripeConfigured } from '@/lib/stripe-client';
import { useAuth } from '@/contexts/auth-context';

interface PaymentButtonProps {
    bookingId: string;
    amount: number;
    paymentType: 'deposit' | 'balance';
    disabled?: boolean;
    className?: string;
}

export function PaymentButton({
    bookingId,
    amount,
    paymentType,
    disabled = false,
    className,
}: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    const handlePayment = async () => {
        if (!isStripeConfigured()) {
            setError('Stripe n\'est pas configuré. Veuillez contacter l\'administrateur.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Créer une session Stripe Checkout
            const response = await fetch('/api/payments/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId,
                    paymentType,
                    customerEmail: user?.email,
                    customerName: user?.displayName,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la création du paiement');
            }

            const { url } = await response.json();

            if (!url) {
                throw new Error('URL de paiement non disponible');
            }

            // Rediriger vers Stripe Checkout
            window.location.href = url;
        } catch (err: any) {
            console.error('Erreur paiement:', err);
            setError(err.message || 'Une erreur est survenue lors du paiement');
            setLoading(false);
        }
    };

    const buttonText = paymentType === 'deposit' 
        ? `Payer l'acompte (${amount.toFixed(2)} €)` 
        : `Payer le solde (${amount.toFixed(2)} €)`;

    return (
        <div className="space-y-3">
            <Button
                onClick={handlePayment}
                disabled={disabled || loading || !isStripeConfigured()}
                className={className}
                size="lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Redirection vers Stripe...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        {buttonText}
                    </>
                )}
            </Button>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!isStripeConfigured() && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Le système de paiement n'est pas encore configuré. 
                        Les paiements seront bientôt disponibles.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
