/**
 * Liste des conversations
 * Affiche toutes les conversations de l'utilisateur avec aperçu du dernier message
 */

'use client';

import { useState } from 'react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  Search,
  MoreVertical,
  Archive,
  Trash2,
  Settings,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Conversation } from '@/types/firestore';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onArchive: (conversationId: string) => void;
  onClose: (conversationId: string) => void;
  loading?: boolean;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onArchive,
  onClose,
  loading = false,
  currentUserId
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrer les conversations selon le terme de recherche
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessageText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  /**
   * Formatage de la date du dernier message
   */
  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Hier';
    }
    if (differenceInDays(new Date(), date) <= 7) {
      return format(date, 'EEEE', { locale: fr });
    }
    return format(date, 'dd/MM', { locale: fr });
  };

  /**
   * Obtenir l'autre participant (pas l'utilisateur actuel)
   */
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUserId);
  };

  /**
   * Affichage du statut de lecture du dernier message
   */
  const renderMessageStatus = (conversation: Conversation) => {
    if (conversation.lastMessageBy === currentUserId) {
      // Message envoyé par l'utilisateur actuel
      return (
        <div className="flex items-center text-xs text-muted-foreground">
          <CheckCheck className="h-3 w-3 mr-1" />
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header avec recherche */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = conversation.unreadCount[currentUserId] || 0;
              const isSelected = selectedId === conversation.id;
              
              return (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all hover:bg-accent/50 ${
                    isSelected ? 'ring-2 ring-primary bg-accent/30' : ''
                  }`}
                  onClick={() => onSelect(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback className="bg-primary/10">
                            {otherParticipant?.name?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant?.role === 'accompanist' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>

                      {/* Contenu de la conversation */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">
                            {conversation.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {conversation.lastMessageAt && (
                              <span>
                                {formatMessageDate(conversation.lastMessageAt.toDate())}
                              </span>
                            )}
                            {renderMessageStatus(conversation)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-xs text-muted-foreground">
                              {otherParticipant?.role === 'accompanist' ? '👨‍💼' : '👨‍👩‍👧‍👦'}
                            </span>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessageText || 'Aucun message'}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            {/* Badge de messages non lus */}
                            {unreadCount > 0 && (
                              <Badge variant="default" className="h-5 min-w-5 text-xs">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                            
                            {/* Statut de la conversation */}
                            {conversation.status === 'closed' && (
                              <Badge variant="secondary" className="text-xs">
                                Fermée
                              </Badge>
                            )}
                            
                            {/* Menu des actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive(conversation.id);
                                  }}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archiver
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClose(conversation.id);
                                  }}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Fermer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}