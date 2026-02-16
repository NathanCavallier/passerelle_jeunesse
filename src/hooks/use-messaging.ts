/**
 * Hook de messagerie temps réel
 * Interface React pour la gestion des conversations et messages
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  createConversation,
  getConversation,
  getUserConversations,
  getConversationByBooking,
  updateConversationStatus,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  deleteMessage,
  subscribeToUserConversations,
  subscribeToConversationMessages
} from '@/lib/messaging-service';
import type { 
  Conversation, 
  Message, 
  MessageAttachment,
  ConversationStatus 
} from '@/types/firestore';

export interface UseMessagingOptions {
  autoMarkAsRead?: boolean;
  messageLimit?: number;
}

export interface UseMessagingReturn {
  // État
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  
  // Actions conversations
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (bookingId: string, accompanistId: string, missionId?: string) => Promise<string | null>;
  closeConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  
  // Actions messages
  sendNewMessage: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  deleteMessageById: (messageId: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  
  // Compteurs
  getTotalUnreadCount: () => number;
  getConversationUnreadCount: (conversationId: string) => number;
  
  // Utilitaires
  refreshConversations: () => Promise<void>;
  clearError: () => void;
}

export function useMessaging(options: UseMessagingOptions = {}): UseMessagingReturn {
  const { user } = useAuth();
  const { 
    autoMarkAsRead = true, 
    messageLimit = 50 
  } = options;

  // État principal
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs pour les listeners
  const conversationsUnsubscribe = useRef<(() => void) | null>(null);
  const messagesUnsubscribe = useRef<(() => void) | null>(null);

  /**
   * Gestion d'erreur
   */
  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
  }, []);

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Charger les conversations de l'utilisateur avec listener temps réel
   */
  const loadUserConversations = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Nettoyer l'ancien listener
      if (conversationsUnsubscribe.current) {
        conversationsUnsubscribe.current();
      }

      // Configurer le nouveau listener
      conversationsUnsubscribe.current = subscribeToUserConversations(
        user.uid,
        (updatedConversations) => {
          setConversations(updatedConversations);
          setLoading(false);
        },
        (error) => handleError(error, 'Erreur lors du chargement des conversations')
      );
    } catch (error) {
      handleError(error, 'Impossible de charger les conversations');
    }
  }, [user?.uid, handleError]);

  /**
   * Sélectionner une conversation et charger ses messages
   */
  const selectConversation = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    setLoading(true);
    try {
      // Récupérer les détails de la conversation
      const conversation = await getConversation(conversationId);
      if (!conversation) {
        throw new Error('Conversation introuvable');
      }

      setCurrentConversation(conversation);

      // Nettoyer l'ancien listener de messages
      if (messagesUnsubscribe.current) {
        messagesUnsubscribe.current();
      }

      // Configurer le listener des messages
      messagesUnsubscribe.current = subscribeToConversationMessages(
        conversationId,
        (updatedMessages) => {
          setMessages(updatedMessages);
          
          // Auto-marquer comme lu si activé
          if (autoMarkAsRead && user?.uid && updatedMessages.length > 0) {
            const unreadMessages = updatedMessages.filter(
              msg => msg.receiverId === user.uid && msg.status !== 'read'
            );
            if (unreadMessages.length > 0) {
              markAsRead(unreadMessages.map(msg => msg.id));
            }
          }
          
          setLoading(false);
        },
        (error) => handleError(error, 'Erreur lors du chargement des messages'),
        messageLimit
      );
    } catch (error) {
      handleError(error, 'Impossible de sélectionner la conversation');
    }
  }, [autoMarkAsRead, user?.uid, messageLimit, handleError]);

  /**
   * Créer une nouvelle conversation
   */
  const createNewConversation = useCallback(async (
    bookingId: string, 
    accompanistId: string, 
    missionId?: string
  ): Promise<string | null> => {
    if (!user?.uid) {
      setError('Utilisateur non connecté');
      return null;
    }

    setSending(true);
    try {
      // Vérifier si une conversation existe déjà
      const existingConversation = await getConversationByBooking(bookingId);
      if (existingConversation) {
        await selectConversation(existingConversation.id);
        return existingConversation.id;
      }

      // Créer une nouvelle conversation
      const conversationId = await createConversation(
        bookingId,
        user.uid,
        accompanistId,
        missionId
      );

      // Sélectionner la nouvelle conversation
      await selectConversation(conversationId);
      return conversationId;
    } catch (error) {
      handleError(error, 'Impossible de créer la conversation');
      return null;
    } finally {
      setSending(false);
    }
  }, [user?.uid, selectConversation, handleError]);

  /**
   * Envoyer un message
   */
  const sendNewMessage = useCallback(async (
    text: string, 
    attachments?: MessageAttachment[]
  ) => {
    if (!user?.uid || !currentConversation) {
      setError('Utilisateur ou conversation non sélectionnée');
      return;
    }

    if (!text.trim() && (!attachments || attachments.length === 0)) {
      setError('Le message ne peut pas être vide');
      return;
    }

    setSending(true);
    try {
      // Trouver le destinataire (l'autre participant)
      const receiver = currentConversation.participants.find(
        p => p.id !== user.uid
      );

      if (!receiver) {
        throw new Error('Destinataire introuvable');
      }

      await sendMessage(
        currentConversation.id,
        currentConversation.bookingId,
        user.uid,
        receiver.id,
        text,
        attachments,
        currentConversation.missionId
      );

      clearError();
    } catch (error) {
      handleError(error, 'Impossible d\\envoyer le message');
    } finally {
      setSending(false);
    }
  }, [user?.uid, currentConversation, handleError, clearError]);

  /**
   * Marquer des messages comme lus
   */
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user?.uid || !currentConversation || messageIds.length === 0) return;

    try {
      await markMessagesAsRead(currentConversation.id, user.uid, messageIds);
    } catch (error) {
      // Échec silencieux pour ne pas gêner l'UX
      console.warn('Impossible de marquer les messages comme lus:', error);
    }
  }, [user?.uid, currentConversation]);

  /**
   * Supprimer un message
   */
  const deleteMessageById = useCallback(async (messageId: string) => {
    if (!currentConversation) return;

    try {
      await deleteMessage(currentConversation.id, messageId, user?.uid || '');
      clearError();
    } catch (error) {
      handleError(error, 'Impossible de supprimer le message');
    }
  }, [currentConversation, user?.uid, handleError, clearError]);

  /**
   * Fermer une conversation
   */
  const closeConversation = useCallback(async (conversationId: string) => {
    if (!user?.uid) return;

    try {
      await updateConversationStatus(conversationId, 'closed', user.uid);
      clearError();
    } catch (error) {
      handleError(error, 'Impossible de fermer la conversation');
    }
  }, [user?.uid, handleError, clearError]);

  /**
   * Archiver une conversation
   */
  const archiveConversation = useCallback(async (conversationId: string) => {
    if (!user?.uid) return;

    try {
      await updateConversationStatus(conversationId, 'archived', user.uid);
      clearError();
    } catch (error) {
      handleError(error, 'Impossible d\\archiver la conversation');
    }
  }, [user?.uid, handleError, clearError]);

  /**
   * Récupérer le nombre total de messages non lus
   */
  const getTotalUnreadCount = useCallback((): number => {
    if (!user?.uid) return 0;
    
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[user.uid] || 0);
    }, 0);
  }, [conversations, user?.uid]);

  /**
   * Récupérer le nombre de messages non lus d'une conversation
   */
  const getConversationUnreadCount = useCallback((conversationId: string): number => {
    if (!user?.uid) return 0;
    
    const conversation = conversations.find(conv => conv.id === conversationId);
    return conversation?.unreadCount[user.uid] || 0;
  }, [conversations, user?.uid]);

  /**
   * Rafraîchir les conversations
   */
  const refreshConversations = useCallback(async () => {
    await loadUserConversations();
  }, [loadUserConversations]);

  // Charger les conversations au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserConversations();
    }

    // Nettoyage au démontage
    return () => {
      if (conversationsUnsubscribe.current) {
        conversationsUnsubscribe.current();
      }
      if (messagesUnsubscribe.current) {
        messagesUnsubscribe.current();
      }
    };
  }, [user?.uid, loadUserConversations]);

  return {
    // État
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    error,
    
    // Actions conversations
    selectConversation,
    createNewConversation,
    closeConversation,
    archiveConversation,
    
    // Actions messages
    sendNewMessage,
    deleteMessageById,
    markAsRead,
    
    // Compteurs
    getTotalUnreadCount,
    getConversationUnreadCount,
    
    // Utilitaires
    refreshConversations,
    clearError
  };
}