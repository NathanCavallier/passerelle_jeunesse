/**
 * Interface principale de chat
 * Assemble la liste des conversations et la zone de chat
 */

'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConversationList } from './conversation-list';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessaging } from '@/hooks/use-messaging';
import { useAuth } from '@/contexts/auth-context';
import { 
  ArrowLeft,
  MessageCircle,
  Info,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Archive,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  onBack?: () => void;
  selectedBookingId?: string; // Pour ouvrir directement une conversation liée à une mission
}

export function ChatInterface({ onBack, selectedBookingId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    error,
    selectConversation,
    createNewConversation,
    closeConversation,
    archiveConversation,
    sendNewMessage,
    deleteMessageById,
    getTotalUnreadCount,
    clearError
  } = useMessaging({ autoMarkAsRead: true, messageLimit: 50 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll vers le bas quand de nouveaux messages arrivent
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Ouvrir automatiquement une conversation si bookingId fourni
   */
  useEffect(() => {
    if (selectedBookingId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.bookingId === selectedBookingId);
      if (conversation) {
        selectConversation(conversation.id);
      }
    }
  }, [selectedBookingId, conversations, selectConversation]);

  if (!user) {
    return (
      <Alert className="m-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour accéder à la messagerie.
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Obtenir l'autre participant de la conversation actuelle
   */
  const getOtherParticipant = () => {
    if (!currentConversation) return null;
    return currentConversation.participants.find(p => p.id !== user.uid);
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Liste des conversations (sidebar sur desktop, plein écran sur mobile sans conversation) */}
      <div className={`${
        currentConversation ? 'hidden lg:flex' : 'flex'
      } lg:w-80 xl:w-96 flex-col border-r bg-muted/30`}>
        {/* Header de la liste */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-lg font-semibold">Messages</h2>
              {getTotalUnreadCount() > 0 && (
                <Badge variant="default">
                  {getTotalUnreadCount()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Liste des conversations */}
        <ConversationList
          conversations={conversations}
          selectedId={currentConversation?.id}
          onSelect={(conversation) => selectConversation(conversation.id)}
          onArchive={archiveConversation}
          onClose={closeConversation}
          loading={loading && conversations.length === 0}
          currentUserId={user.uid}
        />
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Header de la conversation */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Bouton retour mobile */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="lg:hidden"
                    onClick={() => selectConversation('')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  {/* Infos participant */}
                  <div>
                    <h3 className="font-semibold">{currentConversation.title}</h3>
                    {otherParticipant && (
                      <p className="text-sm text-muted-foreground">
                        {otherParticipant.role === 'accompanist' ? '👨‍💼 Accompagnateur' : '👨‍👩‍👧‍👦 Parent'} • 
                        {otherParticipant.name}
                      </p>
                    )}
                  </div>

                  {/* Statut conversation */}
                  {currentConversation.status !== 'active' && (
                    <Badge variant="secondary">
                      {currentConversation.status === 'closed' ? 'Fermée' : 'Archivée'}
                    </Badge>
                  )}
                </div>

                {/* Actions conversation */}
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => archiveConversation(currentConversation.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archiver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => closeConversation(currentConversation.id)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Fermer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Chargement des messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Aucun message dans cette conversation.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Commencez en envoyant un message !
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const sender = currentConversation.participants.find(
                      p => p.id === message.senderId
                    );
                    const isCurrentUser = message.senderId === user.uid;
                    const isLastMessage = index === messages.length - 1;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        sender={sender!}
                        isCurrentUser={isCurrentUser}
                        isLastMessage={isLastMessage}
                        onDelete={deleteMessageById}
                        canDelete={isCurrentUser}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}

              {/* Affichage d'erreur */}
              {error && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    {error}
                    <Button variant="ghost" size="sm" onClick={clearError}>
                      Fermer
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Zone de saisie */}
            {currentConversation.status === 'active' ? (
              <MessageInput
                onSend={sendNewMessage}
                disabled={sending}
                placeholder="Tapez votre message..."
                userId={user.uid}
                conversationId={currentConversation.id}
              />
            ) : (
              <div className="p-4 border-t bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Cette conversation est {currentConversation.status === 'closed' ? 'fermée' : 'archivée'}. 
                  Vous ne pouvez plus envoyer de messages.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Écran d'accueil sans conversation sélectionnée */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground mb-6">
                Choisissez une conversation dans la liste pour commencer à échanger avec votre accompagnateur ou parent.
              </p>
              {conversations.length === 0 && !loading && (
                <div className="mt-8">
                  <h4 className="font-medium mb-3">Aucune conversation</h4>
                  <p className="text-sm text-muted-foreground">
                    Les conversations apparaîtront automatiquement lors de vos réservations de missions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}