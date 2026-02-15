/**
 * Composant PhotoCapture
 * Interface pour capturer ou sélectionner une photo de confirmation de mission
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadMissionPhoto, fileToBase64 } from '@/lib/photo-service';
import Image from 'next/image';

interface PhotoCaptureProps {
  bookingId: string;
  photoType: 'departure' | 'arrival' | 'incident' | 'other';
  onPhotoUploaded: (photoURL: string) => void;
  disabled?: boolean;
}

export function PhotoCapture({
  bookingId,
  photoType,
  onPhotoUploaded,
  disabled = false,
}: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoTypeLabels = {
    departure: 'Photo de départ',
    arrival: 'Photo d\'arrivée',
    incident: 'Photo d\'incident',
    other: 'Autre photo',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      // Créer un aperçu
      const base64 = await fileToBase64(file);
      setPreview(base64);
      setUploadedURL(null);
    } catch (err) {
      setError('Impossible de charger l\'image');
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !preview) return;

    const file = fileInputRef.current.files[0];
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await uploadMissionPhoto({
        bookingId,
        photoType,
        file,
        onProgress: setUploadProgress,
      });

      setUploadedURL(result.url);
      onPhotoUploaded(result.url);
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de l\'upload'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setUploadedURL(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">
              {photoTypeLabels[photoType]}
            </h3>
            {uploadedURL && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>

          {/* Zone de prévisualisation ou upload réussi */}
          {uploadedURL ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                <Image
                  src={uploadedURL}
                  alt="Photo uploadée"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Photo envoyée avec succès</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
                className="w-full"
              >
                Prendre une nouvelle photo
              </Button>
            </div>
          ) : preview ? (
            <div className="space-y-3">
              {/* Prévisualisation */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                <Image
                  src={preview}
                  alt="Aperçu photo"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={handleReset}
                  disabled={uploading}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                  aria-label="Supprimer l'aperçu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Barre de progression */}
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-center text-muted-foreground">
                    Upload en cours... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={uploading || disabled}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || disabled}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
              />

              {/* Boutons de capture */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  disabled={disabled}
                  className="h-24 flex flex-col gap-2"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Prendre photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={disabled}
                  className="h-24 flex flex-col gap-2"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Choisir fichier</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
