/**
 * Service de messagerie temps réel
 * Gestion des conversations et messages entre parents et accompagnateurs
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Conversation,
  ConversationParticipant,
  ConversationSettings,
  ConversationStatus,
  Message,
  MessageStatus,
  MessageAttachment
} from '@/types/firestore';

// ============================================================================
// CONVERSATIONS
// ============================================================================

/**
 * Créer une nouvelle conversation
 */
export async function createConversation(
  bookingId: string,
  parentId: string,
  accompanistId: string,
  missionId?: string,
  customTitle?: string
): Promise<string> {
  try {
    const conversationData: Omit<Conversation, 'id'> = {
      bookingId,
      missionId,
      title: customTitle || `Mission ${bookingId.substring(0, 8)}`,
      status: 'active',
      participants: [
        {
          id: parentId,
          role: 'parent',
          name: 'Parent', // À récupérer du profil
          notificationsEnabled: true,
        },
        {
          id: accompanistId,
          role: 'accompanist',
          name: 'Accompagnateur', // À récupérer du profil
          notificationsEnabled: true,
        }
      ],
      settings: {
        muteNotifications: false,
        autoClose: false,
        allowAttachments: true,
      },
      messagesCount: 0,
      unreadCount: {
        [parentId]: 0,
        [accompanistId]: 0
      },
      lastReadBy: {},
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: parentId,
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Erreur création conversation:', error);
    throw new Error('Impossible de créer la conversation');
  }
}

/**
 * Récupérer une conversation par ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const docRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Conversation;
  } catch (error) {
    console.error('Erreur récupération conversation:', error);
    throw new Error('Impossible de récupérer la conversation');
  }
}

/**
 * Récupérer toutes les conversations d'un utilisateur
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    // Solution temporaire : requête simple puis filtre côté client
    // Une fois les index créés, on reviendra à la requête optimisée
    const conversationsQuery = query(
      collection(db, 'conversations'),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(conversationsQuery);

    // Filtrage côté client pour les participants
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Conversation))
      .filter(conv =>
        conv.participants?.some(p => p.id === userId)
      );
  } catch (error) {
    console.error('Erreur récupération conversations utilisateur:', error);
    return [];
  }
}

/**
 * Récupérer la conversation d'une mission
 */
export async function getConversationByBooking(bookingId: string): Promise<Conversation | null> {
  try {
    const conversationQuery = query(
      collection(db, 'conversations'),
      where('bookingId', '==', bookingId),
      limit(1)
    );

    const snapshot = await getDocs(conversationQuery);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Conversation;
  } catch (error) {
    console.error('Erreur récupération conversation par booking:', error);
    return null;
  }
}

/**
 * Mettre à jour le statut d'une conversation
 */
export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  userId: string
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'closed') {
      updates.closedAt = serverTimestamp();
      updates.closedBy = userId;
    }

    if (status === 'archived') {
      updates.archivedAt = serverTimestamp();
    }

    await updateDoc(conversationRef, updates);
  } catch (error) {
    console.error('Erreur mise à jour statut conversation:', error);
    throw new Error('Impossible de mettre à jour le statut');
  }
}

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Envoyer un message
 */
export async function sendMessage(
  conversationId: string,
  bookingId: string,
  senderId: string,
  receiverId: string,
  text: string,
  attachments?: MessageAttachment[],
  missionId?: string
): Promise<string> {
  try {
    const batch = writeBatch(db);

    // 1. Créer le message
    const messageData: Omit<Message, 'id'> = {
      missionId: missionId || '',
      bookingId,
      senderId,
      receiverId,
      text: text.trim(),
      attachments: attachments || [],
      status: 'sent',
      flagged: false,
      createdAt: serverTimestamp() as Timestamp,
    };

    const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    batch.set(messageRef, messageData);

    // 2. Mettre à jour la conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      messagesCount: increment(1),
      lastMessageId: messageRef.id,
      lastMessageText: text.length > 100 ? text.substring(0, 100) + '...' : text,
      lastMessageAt: serverTimestamp(),
      lastMessageBy: senderId,
      updatedAt: serverTimestamp(),
      [`unreadCount.${receiverId}`]: increment(1)
    });

    await batch.commit();
    return messageRef.id;
  } catch (error) {
    console.error('Erreur envoi message:', error);
    throw new Error('Impossible d\\envoyer le message');
  }
}

/**
 * Récupérer les messages d'une conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> {
  try {
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Message))
      .reverse(); // Plus ancien au plus récent pour l'affichage
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    return [];
  }
}

/**
 * Marquer des messages comme lus
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string,
  messageIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = serverTimestamp();

    // Marquer les messages comme lus
    for (const messageId of messageIds) {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      batch.update(messageRef, {
        status: 'read',
        readAt: now
      });
    }

    // Mettre à jour le compteur nnon lu dans la conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      [`unreadCount.${userId}`]: 0,
      [`lastReadBy.${userId}`]: now,
      updatedAt: now
    });

    await batch.commit();
  } catch (error) {
    console.error('Erreur marquage messages lus:', error);
    throw new Error('Impossible de marquer les messages comme lus');
  }
}

/**
 * Supprimer un message
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);

    // Vérifier que l'utilisateur est bien l'auteur
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) {
      throw new Error('Message introuvable');
    }

    const messageData = messageDoc.data() as Message;
    if (messageData.senderId !== userId) {
      throw new Error('Vous ne pouvez supprimer que vos propres messages');
    }

    // Marquer comme supprimé (ne pas supprimer pour l'historique)
    await updateDoc(messageRef, {
      text: '[Message supprimé]',
      flagged: true,
      flagReason: 'deleted_by_user'
    });
  } catch (error) {
    console.error('Erreur suppression message:', error);
    throw new Error('Impossible de supprimer le message');
  }
}

// ============================================================================
// LISTENERS TEMPS RÉEL
// ============================================================================

/**
 * Écouter les conversations d'un utilisateur en temps réel
 */
export function subscribeToUserConversations(
  userId: string,
  onConversationsUpdate: (conversations: Conversation[]) => void,
  onError: (error: Error) => void
) {
  try {
    // Solution temporaire : requête simple puis filtre côté client
    // Une fois les index créés, on reviendra à la requête optimisée
    const conversationsQuery = query(
      collection(db, 'conversations'),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const conversations = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Conversation))
          .filter(conv =>
            conv.participants?.some(p => p.id === userId)
          );
        onConversationsUpdate(conversations);
      },
      onError
    );
  } catch (error) {
    onError(error as Error);
    return () => { }; // Fonction de désabonnement vide
  }
}

/**
 * Écouter les messages d'une conversation en temps réel
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onMessagesUpdate: (messages: Message[]) => void,
  onError: (error: Error) => void,
  limitCount: number = 50
) {
  try {
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Message))
          .reverse(); // Plus ancien au plus récent
        onMessagesUpdate(messages);
      },
      onError
    );
  } catch (error) {
    onError(error as Error);
    return () => { }; // Fonction de désabonnement vide
  }
}