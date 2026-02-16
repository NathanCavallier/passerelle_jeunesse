/**
 * Zone de saisie de messages
 * Support du texte, images, documents et localisation
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';
import { uploadMessageAttachment, validateFile } from '@/lib/upload-service';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  MapPin,
  Loader2,
  X
} from 'lucide-react';
import type { MessageAttachment } from '@/types/firestore';

interface MessageInputProps {
  onSend: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  userId: string;
  conversationId: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Tapez votre message...",
  userId,
  conversationId
}: MessageInputProps) {
  const { toast } = useToast();
  const { getCurrentPosition } = useLocation();
  
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  /**
   * Envoyer le message
   */
  const handleSend = useCallback(async () => {
    if ((!message.trim() && attachments.length === 0) || sending || disabled) {
      return;
    }

    setSending(true);
    try {
      await onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      
      // Réinitialiser après envoi réussi
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message"
      });
    } finally {
      setSending(false);
    }
  }, [message, attachments, onSend, sending, disabled, toast]);

  /**
   * Gestion de l'appui sur Entrée
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  /**
   * Upload d'un fichier réel via Firebase Storage
   */
  const uploadFile = useCallback(async (file: File): Promise<MessageAttachment> => {
    // Validation avant upload
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error!);
    }

    // Upload avec progression
    return uploadMessageAttachment(
      file,
      userId,
      conversationId,
      (progress) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      }
    );
  }, [userId, conversationId]);

  /**
   * Gestion de la sélection de fichiers
   */
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingAttachment(true);
    try {
      const file = files[0];
      
      const attachment = await uploadFile(file);
      setAttachments(prev => [...prev, attachment]);
      
      toast({
        title: "Fichier ajouté",
        description: `${file.name} a été ajouté au message`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: error.message || "Impossible d'ajouter le fichier"
      });
    } finally {
      setUploadingAttachment(false);
      // Nettoyer la progression
      setUploadProgress({});
    }
  }, [uploadFile, toast]);

  /**
   * Partage de la position actuelle
   */
  const handleShareLocation = useCallback(async () => {
    setUploadingAttachment(true);
    try {
      const position = await getCurrentPosition();
      
      // TODO: Géocoding inverse pour obtenir l'adresse
      const locationAttachment: MessageAttachment = {
        type: 'location',
        url: `geo:${position.latitude},${position.longitude}`,
        fileName: 'Position partagée'
      };

      setAttachments(prev => [...prev, locationAttachment]);
      
      toast({
        title: "Position ajoutée",
        description: "Votre position actuelle a été ajoutée au message"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de localisation",
        description: "Impossible d'obtenir votre position"
      });
    } finally {
      setUploadingAttachment(false);
    }
  }, [getCurrentPosition, toast]);

  /**
   * Supprimer une pièce jointe
   */
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Rendu d'un aperçu de pièce jointe
   */
  const renderAttachmentPreview = (attachment: MessageAttachment, index: number) => {
    return (
      <div key={index} className="relative group">
        <div className="flex items-center space-x-2 bg-muted p-2 rounded-md max-w-32">
          {attachment.type === 'image' ? (
            <>
              <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs truncate">Image</span>
            </>
          ) : attachment.type === 'location' ? (
            <>
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs truncate">Position</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs truncate">{attachment.fileName}</span>
            </>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeAttachment(index)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className="border-t bg-background p-4">
      {/* Aperçu des pièces jointes */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((attachment, index) => 
            renderAttachmentPreview(attachment, index)
          )}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="flex items-end space-x-2">
        {/* Menu des pièces jointes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={disabled || uploadingAttachment}
            >
              {uploadingAttachment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingAttachment}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAttachment}
            >
              <FileText className="h-4 w-4 mr-2" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleShareLocation}
              disabled={uploadingAttachment}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Partager ma position
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Zone de texte */}
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || sending}
            onKeyPress={handleKeyPress}
            className="min-h-[2.5rem] resize-none"
          />
        </div>

        {/* Bouton d'envoi */}
        <Button 
          onClick={handleSend}
          disabled={disabled || sending || (!message.trim() && attachments.length === 0)}
          size="sm"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Inputs cachés pour les fichiers */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="*/*"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}