/**
 * Service de génération de PDF
 * Génère des devis et des factures professionnels
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration de la société
const COMPANY_INFO = {
    name: 'Passerelle Jeunesse',
    address: 'Metz, France',
    phone: '+33 (0)6 19 22 62 94',
    email: 'contact@passerellejeunesse.fr',
    website: 'https://www.passerellejeunesse.fr',
    siret: 'XXX XXX XXX XXXXX', // À compléter
    tva: 'FR XX XXX XXX XXX', // À compléter
};

/**
 * Convertit une date Firestore en objet Date
 */
function toDate(timestamp: any): Date {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000);
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return new Date();
}

/**
 * Formate un montant en euros
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

/**
 * Ajoute l'en-tête du document (logo + informations société)
 */
function addHeader(doc: jsPDF, documentType: 'DEVIS' | 'FACTURE', documentNumber: string) {
    // Logo (placeholder - à remplacer par votre logo)
    doc.setFillColor(59, 130, 246); // Bleu
    doc.circle(20, 20, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PJ', 17, 23);

    // Informations société
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_INFO.name, 35, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_INFO.address, 35, 26);
    doc.text(`Tel: ${COMPANY_INFO.phone}`, 35, 31);
    doc.text(COMPANY_INFO.email, 35, 36);

    // Type de document
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(documentType, 150, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${documentNumber}`, 150, 32);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
}

/**
 * Ajoute les informations client
 */
function addClientInfo(doc: jsPDF, booking: Booking, parentName: string, parentEmail: string) {
    const yStart = 55;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT', 20, yStart);

    doc.setFont('helvetica', 'normal');
    doc.text(parentName, 20, yStart + 6);
    doc.text(parentEmail, 20, yStart + 12);

    // Date
    doc.setFont('helvetica', 'bold');
    doc.text('DATE', 150, yStart);

    doc.setFont('helvetica', 'normal');
    const createdDate = format(toDate(booking.createdAt), 'dd MMMM yyyy', { locale: fr });
    doc.text(createdDate, 150, yStart + 6);

    // Date de la prestation
    doc.setFont('helvetica', 'bold');
    doc.text('PRESTATION', 150, yStart + 15);

    doc.setFont('helvetica', 'normal');
    const scheduledDate = format(toDate(booking.scheduledFor), 'dd MMMM yyyy à HH:mm', { locale: fr });
    doc.text(scheduledDate, 150, yStart + 21);
}

/**
 * Ajoute les détails de la prestation
 */
function addServiceDetails(doc: jsPDF, booking: Booking, yStart: number) {
    const serviceTypeLabel = booking.serviceType === 'local' ? 'Accompagnement local' : 'Accompagnement longue distance';

    const tableData: any[] = [
        ['Service', serviceTypeLabel],
        ['Trajet', `${booking.trip.departure.address} → ${booking.trip.arrival.address}`],
        ['Nombre de jeunes', booking.youngsters.length.toString()],
    ];

    // Ajouter les noms des jeunes
    if (booking.youngsters.length > 0) {
        const youngstersNames = booking.youngsters.map(y => y.firstName).join(', ');
        tableData.push(['Jeunes accompagnés', youngstersNames]);
    }

    autoTable(doc, {
        startY: yStart,
        head: [['DÉTAILS DE LA PRESTATION', '']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [59, 130, 246],
            fontSize: 11,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 10,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 110 },
        },
    });

    return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Ajoute le tableau des prix
 */
function addPricingTable(doc: jsPDF, booking: Booking, yStart: number) {
    const rows: any[] = [
        ['Prix de base', '', formatCurrency(booking.pricing.basePrice)],
    ];

    // Supplément jeunes
    if (booking.pricing.youngstersSuplement > 0) {
        rows.push([
            'Supplément jeunes additionnels',
            '',
            formatCurrency(booking.pricing.youngstersSuplement),
        ]);
    }

    // Supplément distance
    if (booking.pricing.distanceSupplement && booking.pricing.distanceSupplement > 0) {
        rows.push([
            'Supplément distance',
            '',
            formatCurrency(booking.pricing.distanceSupplement),
        ]);
    }

    // Supplément urgence
    if (booking.pricing.urgencySupplement && booking.pricing.urgencySupplement > 0) {
        rows.push([
            'Supplément urgence',
            '',
            formatCurrency(booking.pricing.urgencySupplement),
        ]);
    }

    // Réductions
    if (booking.pricing.discounts && booking.pricing.discounts.length > 0) {
        booking.pricing.discounts.forEach(discount => {
            const discountLabel =
                discount.type === 'fratrie'
                    ? 'Réduction fratrie'
                    : discount.type === 'promo_code'
                        ? `Code promo${discount.code ? ` (${discount.code})` : ''}`
                        : discount.type === 'first_booking'
                            ? 'Première réservation'
                            : 'Réduction';
            rows.push([discountLabel, '', `-${formatCurrency(discount.amount)}`]);
        });
    }

    // Sous-total
    rows.push(['', 'Sous-total', formatCurrency(booking.pricing.subtotal)]);

    // TVA
    if (booking.pricing.taxes > 0) {
        rows.push(['', 'TVA (20%)', formatCurrency(booking.pricing.taxes)]);
    }

    autoTable(doc, {
        startY: yStart,
        body: rows,
        theme: 'plain',
        styles: {
            fontSize: 10,
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
            2: { cellWidth: 40, halign: 'right' },
        },
    });

    // Total
    const totalY = (doc as any).lastAutoTable.finalY + 2;
    doc.setFillColor(59, 130, 246);
    doc.rect(20, totalY, 170, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 75, totalY + 7);
    doc.text(formatCurrency(booking.pricing.total), 180, totalY + 7, { align: 'right' });

    doc.setTextColor(0, 0, 0);

    return totalY + 15;
}

/**
 * Ajoute les modalités de paiement
 */
function addPaymentTerms(doc: jsPDF, booking: Booking, yStart: number) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MODALITÉS DE PAIEMENT', 20, yStart);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const deposit = formatCurrency(booking.pricing.deposit);
    const balance = formatCurrency(booking.pricing.balance);

    const paymentText = [
        `• Acompte de 30% : ${deposit} - Payable à la réservation`,
        `• Solde : ${balance} - Payable avant la prestation`,
        '',
        'Paiement sécurisé par carte bancaire via Stripe.',
    ];

    let currentY = yStart + 6;
    paymentText.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 5;
    });

    return currentY + 5;
}

/**
 * Ajoute les conditions générales
 */
function addTermsAndConditions(doc: jsPDF, yStart: number) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);

    const terms = [
        'Conditions générales :',
        '• Annulation gratuite jusqu\'à 48h avant la prestation',
        '• L\'annulation entre 24h et 48h entraîne la perte de l\'acompte',
        '• L\'annulation moins de 24h avant entraîne la facturation de 100% du montant',
        '• Une assurance responsabilité civile est incluse dans nos prestations',
    ];

    let currentY = yStart;
    terms.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 4;
    });

    // Footer
    doc.setFontSize(7);
    currentY = 285;
    doc.text(
        `${COMPANY_INFO.name} - ${COMPANY_INFO.address} - SIRET: ${COMPANY_INFO.siret} - TVA: ${COMPANY_INFO.tva}`,
        105,
        currentY,
        { align: 'center' }
    );

    doc.setTextColor(0, 0, 0);
}

/**
 * Génère un numéro de document unique
 */
function generateDocumentNumber(type: 'quote' | 'invoice', bookingId: string): string {
    const prefix = type === 'quote' ? 'DEV' : 'FACT';
    const year = new Date().getFullYear();
    const shortId = bookingId.substring(0, 8).toUpperCase();
    return `${prefix}-${year}-${shortId}`;
}

/**
 * Génère un devis PDF pour une réservation
 */
export function generateQuotePDF(
    booking: Booking,
    parentName: string,
    parentEmail: string
): jsPDF {
    const doc = new jsPDF();

    const documentNumber = generateDocumentNumber('quote', booking.id);

    // En-tête
    addHeader(doc, 'DEVIS', documentNumber);

    // Informations client
    addClientInfo(doc, booking, parentName, parentEmail);

    // Détails de la prestation
    let currentY = addServiceDetails(doc, booking, 95);

    // Tableau des prix
    currentY = addPricingTable(doc, booking, currentY);

    // Modalités de paiement
    currentY = addPaymentTerms(doc, booking, currentY);

    // Conditions générales
    addTermsAndConditions(doc, currentY + 5);

    return doc;
}

/**
 * Génère une facture PDF pour une réservation
 */
export function generateInvoicePDF(
    booking: Booking,
    parentName: string,
    parentEmail: string,
    paidDate?: Date
): jsPDF {
    const doc = new jsPDF();

    const documentNumber = generateDocumentNumber('invoice', booking.id);

    // En-tête
    addHeader(doc, 'FACTURE', documentNumber);

    // Informations client
    addClientInfo(doc, booking, parentName, parentEmail);

    // Détails de la prestation
    let currentY = addServiceDetails(doc, booking, 95);

    // Tableau des prix
    currentY = addPricingTable(doc, booking, currentY);

    // Informations de paiement
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE PAIEMENT', 20, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const paymentInfo: string[] = [];

    if (booking.pricing.depositPaid) {
        paymentInfo.push(`✓ Acompte payé : ${formatCurrency(booking.pricing.deposit)}`);
    }

    if (booking.pricing.balancePaid) {
        paymentInfo.push(`✓ Solde payé : ${formatCurrency(booking.pricing.balance)}`);
    }

    if (paidDate) {
        paymentInfo.push(`Date de paiement : ${format(paidDate, 'dd MMMM yyyy', { locale: fr })}`);
    }

    paymentInfo.push('Mode de paiement : Carte bancaire (Stripe)');

    if (booking.pricing.depositPaid && booking.pricing.balancePaid) {
        doc.setFillColor(34, 197, 94); // Vert
        doc.rect(20, currentY + 4, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ FACTURE ACQUITTÉE', 105, currentY + 9, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        currentY += 14;
    }

    doc.setFont('helvetica', 'normal');
    paymentInfo.forEach(line => {
        doc.text(line, 20, currentY + 6);
        currentY += 5;
    });

    // Conditions générales
    addTermsAndConditions(doc, currentY + 10);

    return doc;
}

/**
 * Télécharge un PDF
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
    doc.save(filename);
}

/**
 * Convertit un PDF en Blob pour upload Firebase Storage
 */
export function pdfToBlob(doc: jsPDF): Blob {
    return doc.output('blob');
}
