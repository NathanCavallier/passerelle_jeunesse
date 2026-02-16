/**
 * Bulle de message individuel
 * Affichage d'un message avec support des pièces jointes et actions
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Trash2,
  Download,
  MapPin,
  FileText,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import type { Message, MessageAttachment, ConversationParticipant } from '@/types/firestore';

interface MessageBubbleProps {
  message: Message;
  sender: ConversationParticipant;
  isCurrentUser: boolean;
  isLastMessage?: boolean;
  onDelete?: (messageId: string) => void;
  canDelete?: boolean;
}

export function MessageBubble({
  message,
  sender,
  isCurrentUser,
  isLastMessage = false,
  onDelete,
  canDelete = false
}: MessageBubbleProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<MessageAttachment | null>(null);

  /**
   * Formater l'heure du message
   */
  const formatMessageTime = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm', { locale: fr });
  };

  /**
   * Icone de statut du message
   */
  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  /**
   * Rendu d'une pièce jointe
   */
  const renderAttachment = (attachment: MessageAttachment, index: number) => {
    const handleAttachmentClick = () => {
      if (attachment.type === 'image') {
        setSelectedAttachment(attachment);
      } else {
        // Télécharger ou ouvrir le fichier
        window.open(attachment.url, '_blank');
      }
    };

    switch (attachment.type) {
      case 'image':
        return (
          <div
            key={index}
            className="relative max-w-64 cursor-pointer rounded-lg overflow-hidden group"
            onClick={handleAttachmentClick}
          >
            <img 
              src={attachment.thumbnailURL || attachment.url}
              alt={attachment.fileName || 'Image'}
              className="w-full h-auto max-h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );

      case 'document':
        return (
          <div
            key={index}
            className="flex items-center space-x-2 bg-muted p-3 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors max-w-64"
            onClick={handleAttachmentClick}
          >
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {attachment.fileName || 'Document'}
              </p>
              {attachment.size && (
                <p className="text-xs text-muted-foreground">
                  {(attachment.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
        );

      case 'location':
        return (
          <div
            key={index}
            className="flex items-center space-x-2 bg-primary/10 p-3 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors max-w-64"
            onClick={handleAttachmentClick}
          >
            <MapPin className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Position partagée</p>
              <p className="text-xs text-muted-foreground">
                Appuyer pour voir sur la carte
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className={`flex items-end space-x-2 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar (seulement pour les autres utilisateurs) */}
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender.avatar} />
            <AvatarFallback className="text-xs bg-primary/10">
              {sender.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Contenu du message */}
        <div className={`max-w-sm lg:max-w-md ${isCurrentUser ? '' : 'ml-2'}`}>
          {/* Bulle de message */}
          <div className={`relative group ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted'
          } rounded-2xl px-4 py-2 ${
            message.text ? 'mb-1' : ''
          }`}>
            {/* Texte du message */}
            {message.text && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.flagged && message.flagReason === 'deleted_by_user' 
                  ? message.text
                  : message.text
                }
              </p>
            )}

            {/* Menu d'actions */}
            {canDelete && !message.flagged && (
              <div className={`absolute top-1 ${isCurrentUser ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-current hover:bg-white/10"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Pièces jointes */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`space-y-2 ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
              {message.attachments.map((attachment, index) => (
                renderAttachment(attachment, index)
              ))}
            </div>
          )}

          {/* Position partagée */}
          {message.location && (
            <div 
              className={`mt-2 ${isCurrentUser ? 'flex justify-end' : ''}`}
              onClick={() => {
                // Ouvrir dans Google Maps ou Apple Maps
                const { lat, lng } = message.location!;
                const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                window.open(mapsUrl, '_blank');
              }}
            >
              <div className="flex items-center space-x-2 bg-primary/10 p-3 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors max-w-64">
                <MapPin className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Position partagée</p>
                  {message.location.address && (
                    <p className="text-xs text-muted-foreground truncate">
                      {message.location.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informations temporelles et statut */}
          <div className={`flex items-center space-x-1 mt-1 text-xs text-muted-foreground ${
            isCurrentUser ? 'justify-end' : ''
          }`}>
            <span>{formatMessageTime(message.createdAt)}</span>
            {renderStatusIcon()}
          </div>
        </div>
      </div>

      {/* Dialog pour les images en plein écran */}
      <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedAttachment?.fileName || 'Image'}
            </DialogTitle>
          </DialogHeader>
          {selectedAttachment?.type === 'image' && (
            <div className="flex justify-center">
              <img 
                src={selectedAttachment.url}
                alt={selectedAttachment.fileName || 'Image'}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}