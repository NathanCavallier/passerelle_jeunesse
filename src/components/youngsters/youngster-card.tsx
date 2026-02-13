/**
 * Composant de carte pour afficher un jeune
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { deleteYoungster } from '@/lib/firestore-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AddYoungsterForm from './add-youngster-form';
import { 
  User, 
  Calendar, 
  School, 
  Heart, 
  Phone, 
  Trash2, 
  Edit,
  AlertCircle,
  CheckCircle2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface YoungsterCardProps {
  youngster: any;
  parentId: string;
  onUpdate: () => void;
}

export default function YoungsterCard({ youngster, parentId, onUpdate }: YoungsterCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateAge = (birthDate: any) => {
    const today = new Date();
    const birth = birthDate.toDate ? birthDate.toDate() : new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteYoungster(parentId, youngster.id);
      toast({
        title: 'Profil supprimé',
        description: `Le profil de ${youngster.firstName} a été supprimé.`,
      });
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
      });
    } finally {
      setLoading(false);
    }
  };

  const genderLabel = {
    male: 'Garçon',
    female: 'Fille',
    other: 'Autre'
  }[youngster.gender as string] || youngster.gender;

  const age = calculateAge(youngster.dateOfBirth);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={youngster.photoUrl || undefined} alt={`${youngster.firstName} ${youngster.lastName}`} />
            <AvatarFallback className="text-lg">
              {youngster.firstName[0]}{youngster.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-1 items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {youngster.firstName} {youngster.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {age} ans • {genderLabel}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <AddYoungsterForm youngster={youngster} onSuccess={onUpdate} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Le profil de {youngster.firstName} sera définitivement supprimé.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scolarité */}
        {(youngster.schoolName || youngster.schoolLevel) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <School className="h-4 w-4" />
              Scolarité
            </div>
            <div className="text-sm text-muted-foreground">
              {youngster.schoolName && <div>{youngster.schoolName}</div>}
              {youngster.schoolLevel && <div>Niveau : {youngster.schoolLevel}</div>}
            </div>
          </div>
        )}

        {/* Informations médicales */}
        {youngster.healthInfo && (
          youngster.healthInfo.allergies || 
          youngster.healthInfo.medicalConditions || 
          youngster.healthInfo.medications || 
          youngster.healthInfo.dietaryRestrictions
        ) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Heart className="h-4 w-4 text-red-500" />
                Informations médicales
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {youngster.healthInfo.allergies && (
                  <div>
                    <span className="font-medium">Allergies :</span> {youngster.healthInfo.allergies}
                  </div>
                )}
                {youngster.healthInfo.medicalConditions && (
                  <div>
                    <span className="font-medium">Conditions :</span> {youngster.healthInfo.medicalConditions}
                  </div>
                )}
                {youngster.healthInfo.medications && (
                  <div>
                    <span className="font-medium">Médicaments :</span> {youngster.healthInfo.medications}
                  </div>
                )}
                {youngster.healthInfo.dietaryRestrictions && (
                  <div>
                    <span className="font-medium">Régime :</span> {youngster.healthInfo.dietaryRestrictions}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Contact d'urgence */}
        {youngster.emergencyContact && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4" />
                Contact d'urgence
              </div>
              <div className="text-sm text-muted-foreground">
                <div>{youngster.emergencyContact.name}</div>
                <div>{youngster.emergencyContact.phoneNumber}</div>
                <div className="text-xs">{youngster.emergencyContact.relationship}</div>
              </div>
            </div>
          </>
        )}

        {/* Autorisations */}
        {youngster.authorizations && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-semibold">Autorisations</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={youngster.authorizations.photos ? 'default' : 'secondary'}>
                  {youngster.authorizations.photos ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertCircle className="mr-1 h-3 w-3" />
                  )}
                  Photos
                </Badge>
                <Badge variant={youngster.authorizations.medicalCare ? 'default' : 'secondary'}>
                  {youngster.authorizations.medicalCare ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertCircle className="mr-1 h-3 w-3" />
                  )}
                  Soins médicaux
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {youngster.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-semibold">Notes</div>
              <div className="text-sm text-muted-foreground">{youngster.notes}</div>
            </div>
          </>
        )}

        {/* Documents */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </div>
            <Badge variant="secondary">
              {youngster.documents?.length || 0} fichier{(youngster.documents?.length || 0) > 1 ? 's' : ''}
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/dashboard/youngsters/${youngster.id}/documents`}>
              Gérer les documents
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Trajets effectués : {youngster.totalTrips || 0}</div>
          <div className="text-xs">
            Ajouté le {format(youngster.createdAt.toDate(), 'dd MMM yyyy', { locale: fr })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
