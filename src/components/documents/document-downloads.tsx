'use client';

/**
 * Composant pour télécharger le devis et la facture d'une réservation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';
import { generateQuotePDF, generateInvoicePDF, downloadPDF } from '@/lib/pdf-service';
import type { Booking } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';

interface DocumentDownloadsProps {
    booking: Booking;
    parentName: string;
    parentEmail: string;
}

export function DocumentDownloads({ booking, parentName, parentEmail }: DocumentDownloadsProps) {
    const [generatingQuote, setGeneratingQuote] = useState(false);
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const { toast } = useToast();

    const handleDownloadQuote = () => {
        try {
            setGeneratingQuote(true);
            const pdf = generateQuotePDF(booking, parentName, parentEmail);
            const fileName = `Devis_${booking.id.substring(0, 8)}_${new Date().getFullYear()}.pdf`;
            downloadPDF(pdf, fileName);
            
            toast({
                title: 'Devis téléchargé',
                description: 'Le devis a été généré avec succès.',
            });
        } catch (error) {
            console.error('Erreur génération devis:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de générer le devis.',
            });
        } finally {
            setGeneratingQuote(false);
        }
    };

    const handleDownloadInvoice = () => {
        try {
            setGeneratingInvoice(true);
            const pdf = generateInvoicePDF(booking, parentName, parentEmail);
            const fileName = `Facture_${booking.id.substring(0, 8)}_${new Date().getFullYear()}.pdf`;
            downloadPDF(pdf, fileName);
            
            toast({
                title: 'Facture téléchargée',
                description: 'La facture a été générée avec succès.',
            });
        } catch (error) {
            console.error('Erreur génération facture:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de générer la facture.',
            });
        } finally {
            setGeneratingInvoice(false);
        }
    };

    // On peut télécharger une facture seulement si au moins un paiement a été effectué
    const canDownloadInvoice = booking.pricing.depositPaid || booking.pricing.balancePaid;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                </CardTitle>
                <CardDescription>
                    Téléchargez vos documents en PDF
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleDownloadQuote}
                    disabled={generatingQuote}
                >
                    {generatingQuote ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Télécharger le devis
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleDownloadInvoice}
                    disabled={generatingInvoice || !canDownloadInvoice}
                >
                    {generatingInvoice ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Télécharger la facture
                </Button>

                {!canDownloadInvoice && (
                    <p className="text-xs text-neutral-500">
                        La facture sera disponible après le premier paiement
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
