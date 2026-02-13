/**
 * Service Firebase Storage
 * Gère l'upload, la suppression et la récupération d'images
 */

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    uploadBytesResumable,
    UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './firebase';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadProgress {
    progress: number;
    snapshot: UploadTaskSnapshot;
}

export type UploadCallback = (progress: UploadProgress) => void;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compresse une image avant l'upload
 */
export async function compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.8
): Promise<Blob> {
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

                // Calculer les nouvelles dimensions en gardant le ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
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
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Échec de la compression de l\'image'));
                        }
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('Échec du chargement de l\'image'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Échec de la lecture du fichier'));
        };
    });
}

/**
 * Valide qu'un fichier est une image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Format non supporté. Utilisez JPG, PNG ou WebP.',
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'L\'image est trop volumineuse. Taille maximum : 10MB.',
        };
    }

    return { valid: true };
}

// ============================================================================
// PROFILE PICTURES
// ============================================================================

/**
 * Upload une photo de profil pour un utilisateur
 */
export async function uploadProfilePicture(
    userId: string,
    file: File,
    onProgress?: UploadCallback
): Promise<string> {
    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Compresser l'image
    const compressedBlob = await compressImage(file);

    // Créer la référence
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);

    // Upload avec suivi de progression si callback fourni
    if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
            contentType: file.type,
        });

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress({ progress, snapshot });
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }

    // Upload simple sans suivi
    const snapshot = await uploadBytes(storageRef, compressedBlob, {
        contentType: file.type,
    });
    return getDownloadURL(snapshot.ref);
}

/**
 * Supprime une photo de profil
 */
export async function deleteProfilePicture(photoUrl: string): Promise<void> {
    try {
        const photoRef = ref(storage, photoUrl);
        await deleteObject(photoRef);
    } catch (error: any) {
        // Ignorer l'erreur si le fichier n'existe pas
        if (error.code !== 'storage/object-not-found') {
            throw error;
        }
    }
}

// ============================================================================
// YOUNGSTER PHOTOS
// ============================================================================

/**
 * Upload une photo pour un jeune
 */
export async function uploadYoungsterPhoto(
    userId: string,
    youngsterId: string,
    file: File,
    onProgress?: UploadCallback
): Promise<string> {
    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Compresser l'image
    const compressedBlob = await compressImage(file);

    // Créer la référence
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `youngster-photos/${userId}/${youngsterId}/${fileName}`);

    // Upload avec suivi de progression si callback fourni
    if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
            contentType: file.type,
        });

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress({ progress, snapshot });
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }

    // Upload simple sans suivi
    const snapshot = await uploadBytes(storageRef, compressedBlob, {
        contentType: file.type,
    });
    return getDownloadURL(snapshot.ref);
}

/**
 * Supprime une photo de jeune
 */
export async function deleteYoungsterPhoto(photoUrl: string): Promise<void> {
    try {
        const photoRef = ref(storage, photoUrl);
        await deleteObject(photoRef);
    } catch (error: any) {
        // Ignorer l'erreur si le fichier n'existe pas
        if (error.code !== 'storage/object-not-found') {
            throw error;
        }
    }
}

// ============================================================================
// DOCUMENTS
// ============================================================================

/**
 * Upload un document (PDF, image)
 */
export async function uploadDocument(
    userId: string,
    docType: string,
    file: File,
    onProgress?: UploadCallback
): Promise<string> {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Format non supporté. Utilisez PDF, JPG, PNG ou WebP.');
    }

    if (file.size > maxSize) {
        throw new Error('Le document est trop volumineux. Taille maximum : 10MB.');
    }

    // Créer la référence
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `documents/${userId}/${docType}/${fileName}`);

    // Upload avec suivi de progression si callback fourni
    if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
        });

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress({ progress, snapshot });
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }

    // Upload simple sans suivi
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    });
    return getDownloadURL(snapshot.ref);
}

/**
 * Supprime un document
 */
export async function deleteDocument(documentUrl: string): Promise<void> {
    try {
        const docRef = ref(storage, documentUrl);
        await deleteObject(docRef);
    } catch (error: any) {
        // Ignorer l'erreur si le fichier n'existe pas
        if (error.code !== 'storage/object-not-found') {
            throw error;
        }
    }
}
