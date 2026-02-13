'use client';

/**
 * Composant DocumentUpload
 * Permet de télécharger des documents (PDF, images)
 */

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    FileText, 
    Upload, 
    X, 
    File, 
    AlertCircle,
    CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
    onDocumentSelect: (file: File) => void;
    onDocumentRemove?: () => void;
    uploading?: boolean;
    uploadProgress?: number;
    disabled?: boolean;
    className?: string;
    accept?: string;
    maxSizeMB?: number;
    currentDocumentUrl?: string;
    currentDocumentName?: string;
    label?: string;
    description?: string;
}

export function DocumentUpload({
    onDocumentSelect,
    onDocumentRemove,
    uploading = false,
    uploadProgress = 0,
    disabled = false,
    className,
    accept = '.pdf,.jpg,.jpeg,.png,.webp',
    maxSizeMB = 10,
    currentDocumentUrl,
    currentDocumentName,
    label = 'Télécharger un document',
    description = 'PDF, JPG, PNG ou WebP (max. 10MB)',
}: DocumentUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Réinitialiser l'erreur
        setError('');

        // Vérifier la taille
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`Le fichier est trop volumineux. Taille maximum : ${maxSizeMB}MB.`);
            return;
        }

        // Vérifier le type
        const allowedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
        };
        
        if (!allowedTypes.includes(fileExtension) && !Object.values(mimeTypes).includes(file.type)) {
            setError('Format de fichier non supporté. Utilisez PDF, JPG, PNG ou WebP.');
            return;
        }

        setSelectedFile(file);
        onDocumentSelect(file);
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onDocumentRemove?.();
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const getFileIcon = (fileName?: string, mimeType?: string) => {
        if (!fileName && !mimeType) return <FileText className="h-8 w-8 text-neutral-400" />;
        
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf' || mimeType === 'application/pdf') {
            return <FileText className="h-8 w-8 text-red-500" />;
        }
        return <File className="h-8 w-8 text-blue-500" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const hasDocument = selectedFile || currentDocumentUrl;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Zone de téléchargement */}
            <div
                className={cn(
                    'relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all',
                    hasDocument 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50',
                    uploading && 'opacity-50 cursor-not-allowed',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && !uploading && 'cursor-pointer'
                )}
                onClick={!disabled && !uploading && !hasDocument ? handleClick : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || uploading}
                />

                {/* Affichage du document actuel/sélectionné */}
                {hasDocument ? (
                    <div className="flex items-start gap-4 w-full">
                        <div className="flex-shrink-0">
                            {getFileIcon(
                                selectedFile?.name || currentDocumentName,
                                selectedFile?.type
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {selectedFile?.name || currentDocumentName || 'Document'}
                            </p>
                            {selectedFile && (
                                <p className="text-xs text-neutral-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            )}
                            {currentDocumentUrl && !selectedFile && (
                                <a
                                    href={currentDocumentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Voir le document
                                </a>
                            )}
                        </div>
                        {!uploading && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="flex-shrink-0 h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        {uploading && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 animate-pulse" />
                        )}
                    </div>
                ) : (
                    <>
                        <Upload className="h-10 w-10 text-neutral-400 mb-2" />
                        <p className="text-sm font-medium text-neutral-700">{label}</p>
                        <p className="text-xs text-neutral-500 text-center">{description}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={handleClick}
                            disabled={disabled || uploading}
                        >
                            Parcourir
                        </Button>
                    </>
                )}
            </div>

            {/* Barre de progression */}
            {uploading && uploadProgress > 0 && (
                <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-neutral-500 text-center">
                        Téléchargement en cours... {Math.round(uploadProgress)}%
                    </p>
                </div>
            )}

            {/* Message d'erreur */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
