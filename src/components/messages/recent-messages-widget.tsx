/**
 * Widget des messages récents pour le dashboard
 * Aperçu des conversations avec messages non lus
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessaging } from '@/hooks/use-messaging';
import { useAuth } from '@/contexts/auth-context';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, ArrowRight, MessageCircle } from 'lucide-react';

export function RecentMessagesWidget() {
  const { user } = useAuth();
  const { conversations, getTotalUnreadCount } = useMessaging({ 
    autoMarkAsRead: false,
    messageLimit: 20 
  });

  if (!user) return null;

  // Filtrer les conversations avec des messages non lus ou récents
  const recentConversations = conversations
    .filter(conv => 
      (conv.unreadCount[user.uid] || 0) > 0 || // Messages non lus
      (conv.lastMessageAt && 
       new Date().getTime() - conv.lastMessageAt.toDate().getTime() < 7 * 24 * 60 * 60 * 1000) // Messages dans les 7 derniers jours
    )
    .slice(0, 3); // Limiter à 3 conversations

  const totalUnread = getTotalUnreadCount();

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
    return format(date, 'dd/MM', { locale: fr });
  };

  /**
   * Obtenir l'autre participant
   */
  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user.uid);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            {totalUnread > 0 && (
              <Badge variant="default" className="h-5">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/messages" className="flex items-center gap-1">
              Tout voir
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Conversations récentes avec vos accompagnateurs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {recentConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun message récent
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Les conversations apparaîtront avec vos missions
            </p>
          </div>
        ) : (
          <>
            {recentConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = conversation.unreadCount[user.uid] || 0;
              
              return (
                <Link 
                  key={conversation.id}
                  href="/dashboard/messages"
                  className="block"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback className="bg-primary/10">
                        {otherParticipant?.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {conversation.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageDate(conversation.lastMessageAt.toDate())}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <Badge variant="default" className="h-4 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {otherParticipant?.role === 'accompanist' ? '👨‍💼' : '👨‍👩‍👧‍👦'}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessageText || 'Nouvelle conversation'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Résumé plus de messages */}
            {conversations.length > 3 && (
              <div className="pt-2 border-t">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/dashboard/messages" className="flex items-center justify-center gap-2">
                    <span>
                      {conversations.length - 3} conversation{conversations.length - 3 > 1 ? 's' : ''} de plus
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}