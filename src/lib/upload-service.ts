/**
 * Service d'upload pour les pièces jointes de messages
 * Gestion du stockage des images, documents et thumbnails
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import type { MessageAttachment } from '@/types/firestore';

// Configuration des types de fichiers autorisés
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadProgress {
  progress: number;
  task: any;
}

/**
 * Valider un fichier avant upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux (max 10 MB)'
    };
  }

  // Vérifier le type pour les images
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: 'L\\image est trop volumineuse (max 5 MB)'
      };
    }
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Format d\\image non supporté (JPEG, PNG, WebP, GIF uniquement)'
      };
    }
  }

  // Vérifier le type pour les documents
  if (!file.type.startsWith('image/') && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format de document non supporté'
    };
  }

  return { valid: true };
}

/**
 * Comprimer une image si nécessaire
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback sur le fichier original
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Créer un thumbnail pour une image
 */
export async function createThumbnail(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Seules les images peuvent avoir des thumbnails');
  }

  return compressImage(file, 300, 300, 0.7);
}

/**
 * Générer un nom de fichier unique
 */
export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${userId}/${timestamp}_${random}.${extension}`;
}

/**
 * Upload d'un fichier avec progression
 */
export async function uploadMessageAttachment(
  file: File,
  userId: string,
  conversationId: string,
  onProgress?: (progress: number) => void
): Promise<MessageAttachment> {
  // Validation
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isImage = file.type.startsWith('image/');
  let processedFile = file;
  let thumbnailURL: string | undefined;

  // Traitement spécial pour les images
  if (isImage) {
    // Compression de l'image principale
    processedFile = await compressImage(file);
    
    // Création et upload du thumbnail
    try {
      const thumbnail = await createThumbnail(file);
      const thumbnailPath = `messages/${conversationId}/thumbnails/${generateFileName(file.name, userId)}`;
      const thumbnailRef = ref(storage, thumbnailPath);
      
      await uploadBytes(thumbnailRef, thumbnail);
      thumbnailURL = await getDownloadURL(thumbnailRef);
    } catch (error) {
      console.warn('Erreur création thumbnail:', error);
      // Continuer sans thumbnail
    }
  }

  // Upload du fichier principal
  const filePath = `messages/${conversationId}/attachments/${generateFileName(file.name, userId)}`;
  const fileRef = ref(storage, filePath);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, processedFile);
    
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        console.error('Erreur upload:', error);
        reject(new Error('Échec de l\\upload du fichier'));
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          
          const attachment: MessageAttachment = {
            type: isImage ? 'image' : 'document',
            url,
            fileName: file.name,
            size: file.size,
            thumbnailURL
          };
          
          resolve(attachment);
        } catch (error) {
          reject(new Error('Impossible d\\obtenir l\\URL du fichier'));
        }
      }
    );
  });
}

/**
 * Supprimer un fichier uploadé
 */
export async function deleteMessageAttachment(attachment: MessageAttachment): Promise<void> {
  try {
    // Supprimer le fichier principal
    const fileRef = ref(storage, attachment.url);
    await deleteObject(fileRef);
    
    // Supprimer le thumbnail si présent
    if (attachment.thumbnailURL) {
      const thumbnailRef = ref(storage, attachment.thumbnailURL);
      await deleteObject(thumbnailRef).catch(console.warn);
    }
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    // Ne pas faire échouer l'opération pour une erreur de suppression
  }
}

/**
 * Upload multiple avec gestion des erreurs
 */
export async function uploadMultipleAttachments(
  files: File[],
  userId: string,
  conversationId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<MessageAttachment[]> {
  const attachments: MessageAttachment[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const attachment = await uploadMessageAttachment(
        files[i],
        userId,
        conversationId,
        (progress) => onProgress?.(i, progress)
      );
      attachments.push(attachment);
    } catch (error) {
      console.error(`Erreur upload fichier ${files[i].name}:`, error);
      errors.push(`${files[i].name}: ${error}`);
    }
  }

  if (errors.length > 0 && attachments.length === 0) {
    throw new Error(`Tous les uploads ont échoué:\\n${errors.join('\\n')}`);
  }

  if (errors.length > 0) {
    console.warn('Certains fichiers n\'ont pas pu être uploadés:', errors);
  }

  return attachments;
}