/**
 * Service de gestion du profil utilisateur
 * Upload de photos de profil et compression
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

/**
 * Compresse une image à une taille maximale
 */
export async function compressProfileImage(file: File, maxSizeMB: number = 1): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionner pour que la dimension maximale soit 800px
                const maxDim = 800;
                if (width > height && width > maxDim) {
                    height = (height * maxDim) / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width = (width * maxDim) / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Impossible de créer le contexte canvas'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Erreur lors de la compression'));
                            return;
                        }

                        // Vérifier la taille
                        if (blob.size > maxSizeMB * 1024 * 1024) {
                            // Si toujours trop grand, réduire la qualité
                            canvas.toBlob(
                                (reblob) => {
                                    if (!reblob) {
                                        reject(new Error('Erreur lors de la compression'));
                                        return;
                                    }
                                    resolve(reblob);
                                },
                                'image/jpeg',
                                0.7
                            );
                        } else {
                            resolve(blob);
                        }
                    },
                    'image/jpeg',
                    0.9
                );
            };
            img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
        };
        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    });
}

/**
 * Valide un fichier image
 */
export function validateProfileImage(file: File): string | null {
    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return 'Format non supporté. Utilisez JPG, PNG ou WebP.';
    }

    // Vérifier la taille (max 5MB avant compression)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return 'L\'image est trop volumineuse (max 5MB).';
    }

    return null;
}

/**
 * Upload une photo de profil vers Firebase Storage
 */
export async function uploadProfilePhoto(
    userId: string,
    file: File
): Promise<string> {
    try {
        // Valider le fichier
        const validationError = validateProfileImage(file);
        if (validationError) {
            throw new Error(validationError);
        }

        // Compresser l'image
        const compressedBlob = await compressProfileImage(file);

        // Créer la référence dans Storage
        const timestamp = Date.now();
        const storageRef = ref(getFirebaseStorage(), `profile-photos/${userId}/${timestamp}.jpg`);

        // Upload
        await uploadBytes(storageRef, compressedBlob, {
            contentType: 'image/jpeg',
        });

        // Récupérer l'URL de téléchargement
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error: any) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        throw new Error(error.message || 'Erreur lors de l\'upload de la photo');
    }
}

/**
 * Supprime une ancienne photo de profil
 */
export async function deleteProfilePhoto(photoURL: string): Promise<void> {
    try {
        // Extraire le chemin depuis l'URL
        const urlObj = new URL(photoURL);
        const pathMatch = urlObj.pathname.match(/profile-photos%2F(.+)/);

        if (!pathMatch) {
            console.warn('Impossible d\'extraire le chemin de la photo');
            return;
        }

        const path = decodeURIComponent(pathMatch[0].replace('%2F', '/'));
        const storageRef = ref(getFirebaseStorage(), path);

        await deleteObject(storageRef);
    } catch (error: any) {
        console.warn('Erreur lors de la suppression de l\'ancienne photo:', error);
        // Ne pas bloquer si la suppression échoue
    }
}

/**
 * Convertit un fichier en base64 pour prévisualisation
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
