'use client';

/**
 * Page de gestion des documents d'un jeune
 * /dashboard/youngsters/[id]/documents
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Timestamp } from 'firebase/firestore';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
    ArrowLeft, 
    Plus, 
    FileText, 
    Download, 
    Trash2,
    AlertCircle,
    Calendar,
    File as FileIcon,
} from 'lucide-react';
import type { Youngster, YoungsterDocument, DocumentType } from '@/types/firestore';
import { getYoungster } from '@/lib/firestore-service';
import { addYoungsterDocument, deleteYoungsterDocument } from '@/lib/firestore-service';
import { uploadDocument, deleteDocument } from '@/lib/storage-service';

interface PageProps {
    params: {
        id: string;
    };
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'id_card', label: 'Carte d\'identité' },
    { value: 'birth_certificate', label: 'Acte de naissance' },
    { value: 'health_certificate', label: 'Certificat médical' },
    { value: 'vaccination_record', label: 'Carnet de vaccination' },
    { value: 'parental_authorization', label: 'Autorisation parentale' },
    { value: 'insurance', label: 'Assurance' },
    { value: 'other', label: 'Autre' },
];

export default function YoungsterDocumentsPage({ params }: PageProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [youngster, setYoungster] = useState<Youngster | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newDocument, setNewDocument] = useState({
        type: 'other' as DocumentType,
        name: '',
        notes: '',
        expiresAt: '',
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        loadYoungster();
    }, [user, params.id]);

    const loadYoungster = async () => {
        try {
            setLoading(true);
            const data = await getYoungster(user!.uid, params.id);
            if (!data) {
                toast({
                    title: 'Erreur',
                    description: 'Jeune introuvable',
                    variant: 'destructive',
                });
                router.push('/dashboard/youngsters');
                return;
            }
            // Initialiser documents si undefined
            if (!data.documents) {
                data.documents = [];
            }
            setYoungster(data);
        } catch (error: any) {
            console.error('Erreur lors du chargement:', error);
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddDocument = async () => {
        if (!selectedFile || !youngster) return;

        try {
            setUploading(true);

            // Upload le fichier sur Firebase Storage
            const documentUrl = await uploadDocument(
                user!.uid,
                newDocument.type,
                selectedFile,
                ({ progress }) => setUploadProgress(progress)
            );

            // Créer le document dans Firestore
            const documentData: Omit<YoungsterDocument, 'id'> = {
                type: newDocument.type,
                name: newDocument.name || selectedFile.name,
                url: documentUrl,
                mimeType: selectedFile.type,
                size: selectedFile.size,
                uploadedAt: Timestamp.now(),
                notes: newDocument.notes || undefined,
                expiresAt: newDocument.expiresAt ? Timestamp.fromDate(new Date(newDocument.expiresAt)) : undefined,
            };

            await addYoungsterDocument(user!.uid, youngster.id, documentData);

            toast({
                title: 'Succès',
                description: 'Document ajouté avec succès',
            });

            // Réinitialiser le formulaire
            setShowAddDialog(false);
            setSelectedFile(null);
            setUploadProgress(0);
            setNewDocument({
                type: 'other',
                name: '',
                notes: '',
                expiresAt: '',
            });

            // Recharger les données
            loadYoungster();
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout du document:', error);
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (document: YoungsterDocument) => {
        if (!youngster) return;

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            return;
        }

        try {
            // Supprimer le fichier de Storage
            await deleteDocument(document.url);

            // Supprimer de Firestore
            await deleteYoungsterDocument(user!.uid, youngster.id, document);

            toast({
                title: 'Succès',
                description: 'Document supprimé avec succès',
            });

            // Recharger les données
            loadYoungster();
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const formatDate = (timestamp: Timestamp): string => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getDocumentTypeLabel = (type: DocumentType): string => {
        return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
    };

    const isExpired = (expiresAt?: Timestamp): boolean => {
        if (!expiresAt) return false;
        return expiresAt.toDate() < new Date();
    };

    const isExpiringSoon = (expiresAt?: Timestamp): boolean => {
        if (!expiresAt) return false;
        const daysUntilExpiry = Math.floor(
            (expiresAt.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    if (loading) {
        return (
            <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }

    if (!youngster) {
        return null;
    }

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard/youngsters')}
                        className="mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux jeunes
                    </Button>
                    <h1 className="text-3xl font-bold">
                        Documents de {youngster.firstName} {youngster.lastName}
                    </h1>
                    <p className="text-neutral-600">
                        Gérez les documents officiels et certificats
                    </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un document
                </Button>
            </div>

            {/* Alerte de confidentialité */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Les documents sont stockés de manière sécurisée et confidentielle. 
                    Seuls vous et les accompagnateurs assignés peuvent y accéder.
                </AlertDescription>
            </Alert>

            {/* Liste des documents */}
            {youngster.documents && youngster.documents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {youngster.documents.map((document) => (
                        <Card key={document.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <FileIcon className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">
                                                {document.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {getDocumentTypeLabel(document.type)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {document.expiresAt && (
                                        <Badge
                                            variant={
                                                isExpired(document.expiresAt)
                                                    ? 'destructive'
                                                    : isExpiringSoon(document.expiresAt)
                                                    ? 'outline'
                                                    : 'secondary'
                                            }
                                        >
                                            {isExpired(document.expiresAt)
                                                ? 'Expiré'
                                                : isExpiringSoon(document.expiresAt)
                                                ? 'Expire bientôt'
                                                : 'Valide'}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm text-neutral-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>Ajouté le {formatDate(document.uploadedAt)}</span>
                                    </div>
                                    {document.expiresAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>Expire le {formatDate(document.expiresAt)}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-xs text-neutral-500">
                                            {formatFileSize(document.size)}
                                        </span>
                                    </div>
                                </div>

                                {document.notes && (
                                    <p className="text-sm text-neutral-600 border-l-2 border-neutral-200 pl-3">
                                        {document.notes}
                                    </p>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="flex-1"
                                    >
                                        <a
                                            href={document.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Télécharger
                                        </a>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteDocument(document)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-16 w-16 text-neutral-300 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            Aucun document
                        </h3>
                        <p className="text-neutral-600 text-center mb-6 max-w-md">
                            Ajoutez des documents officiels comme des certificats médicaux, 
                            des autorisations ou des pièces d&apos;identité.
                        </p>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un premier document
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Dialog d'ajout de document */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajouter un document</DialogTitle>
                        <DialogDescription>
                            Téléchargez un document officiel (PDF, JPG, PNG ou WebP)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Type de document */}
                        <div className="space-y-2">
                            <Label>Type de document *</Label>
                            <Select
                                value={newDocument.type}
                                onValueChange={(value) =>
                                    setNewDocument({ ...newDocument, type: value as DocumentType })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Upload */}
                        <div className="space-y-2">
                            <Label>Fichier *</Label>
                            <DocumentUpload
                                onDocumentSelect={(file) => {
                                    setSelectedFile(file);
                                    if (!newDocument.name) {
                                        setNewDocument({ ...newDocument, name: file.name });
                                    }
                                }}
                                onDocumentRemove={() => setSelectedFile(null)}
                                uploading={uploading}
                                uploadProgress={uploadProgress}
                            />
                        </div>

                        {/* Nom du document */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom du document</Label>
                            <Input
                                id="name"
                                value={newDocument.name}
                                onChange={(e) =>
                                    setNewDocument({ ...newDocument, name: e.target.value })
                                }
                                placeholder="Ex: Certificat médical 2024"
                            />
                        </div>

                        {/* Date d'expiration */}
                        <div className="space-y-2">
                            <Label htmlFor="expiresAt">Date d&apos;expiration (optionnel)</Label>
                            <Input
                                id="expiresAt"
                                type="date"
                                value={newDocument.expiresAt}
                                onChange={(e) =>
                                    setNewDocument({ ...newDocument, expiresAt: e.target.value })
                                }
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optionnel)</Label>
                            <Textarea
                                id="notes"
                                value={newDocument.notes}
                                onChange={(e) =>
                                    setNewDocument({ ...newDocument, notes: e.target.value })
                                }
                                placeholder="Ajoutez des notes ou informations complémentaires..."
                                rows={3}
                            />
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddDialog(false)}
                                disabled={uploading}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleAddDocument}
                                disabled={!selectedFile || uploading}
                                className="flex-1"
                            >
                                {uploading ? 'Téléchargement...' : 'Ajouter le document'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
