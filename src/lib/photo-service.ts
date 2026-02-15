/**
 * Service de gestion des photos de mission
 * Gère l'upload, la compression et le stockage des photos de confirmation
 */

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface PhotoUploadOptions {
    bookingId: string;
    photoType: 'departure' | 'arrival' | 'incident' | 'other';
    file: File;
    onProgress?: (progress: number) => void;
}

export interface PhotoUploadResult {
    url: string;
    storagePath: string;
}

/**
 * Compresse une image avant upload
 */
async function compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
        }

        img.onload = () => {
            // Calculer les dimensions redimensionnées
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Redimensionner
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir en blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Échec de la compression'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Échec du chargement de l\'image'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Upload une photo de mission sur Firebase Storage
 */
export async function uploadMissionPhoto(
    options: PhotoUploadOptions
): Promise<PhotoUploadResult> {
    const { bookingId, photoType, file, onProgress } = options;

    try {
        // Vérifier la taille du fichier (max 10MB avant compression)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('La photo est trop volumineuse (max 10MB)');
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            throw new Error('Le fichier doit être une image');
        }

        // Compresser l'image
        onProgress?.(20);
        const compressedBlob = await compressImage(file);

        // Générer le chemin de stockage
        const timestamp = Date.now();
        const filename = `${timestamp}_${photoType}.jpg`;
        const storagePath = `mission-photos/${bookingId}/${filename}`;

        // Créer la référence Firebase Storage
        const storageRef = ref(storage, storagePath);

        // Upload le blob compressé
        onProgress?.(50);
        await uploadBytes(storageRef, compressedBlob, {
            contentType: 'image/jpeg',
            customMetadata: {
                bookingId,
                photoType,
                uploadedAt: new Date().toISOString(),
            },
        });

        onProgress?.(80);

        // Obtenir l'URL publique
        const downloadURL = await getDownloadURL(storageRef);

        onProgress?.(100);

        return {
            url: downloadURL,
            storagePath,
        };
    } catch (error) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        throw error;
    }
}

/**
 * Convert un fichier en base64 (pour prévisualisation)
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Échec de la conversion'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Valide les dimensions d'une image
 */
export function validateImageDimensions(file: File, maxWidth = 4000, maxHeight = 4000): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve(img.width <= maxWidth && img.height <= maxHeight);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
}
