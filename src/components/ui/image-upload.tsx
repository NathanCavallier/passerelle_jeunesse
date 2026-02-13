/**
 * Composant d'upload d'image avec preview
 */

'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
  disabled?: boolean;
  className?: string;
  variant?: 'avatar' | 'card';
  fallbackText?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onImageSelect,
  onImageRemove,
  uploading = false,
  uploadProgress = 0,
  disabled = false,
  className,
  variant = 'avatar',
  fallbackText = '?',
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Format non supporté',
        description: 'Veuillez utiliser un fichier JPG, PNG ou WebP.',
      });
      return;
    }

    // Vérifier la taille du fichier (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille maximum est de 10MB.',
      });
      return;
    }

    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notifier le parent
    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentImageUrl;

  if (variant === 'avatar') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={displayUrl || undefined} alt="Photo" />
            <AvatarFallback className="text-3xl">
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>

          {displayUrl && !uploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {uploading && (
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Upload en cours... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {!uploading && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            {displayUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  // Variant 'card'
  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary',
          displayUrl && 'border-solid'
        )}
        onClick={!disabled && !uploading ? handleClick : undefined}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!uploading && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-12 w-12" />
            <p className="text-sm font-medium">Cliquez pour ajouter une photo</p>
            <p className="text-xs">JPG, PNG ou WebP (max 10MB)</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-center text-sm text-muted-foreground">
            Upload en cours... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}
