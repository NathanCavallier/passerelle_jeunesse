/**
 * Formulaire d'ajout/édition d'un jeune
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { createYoungster, updateYoungster } from '@/lib/firestore-service';
import { uploadYoungsterPhoto, deleteYoungsterPhoto } from '@/lib/storage-service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUpload from '@/components/ui/image-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarIcon, Loader2, Plus, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  dateOfBirth: z.date({ required_error: 'La date de naissance est obligatoire' }),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Veuillez sélectionner un genre' }),
  schoolName: z.string().optional(),
  schoolLevel: z.string().optional(),
  
  // Informations médicales
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  
  // Contact d'urgence
  emergencyContactName: z.string().min(2, 'Le nom du contact d\'urgence est obligatoire'),
  emergencyContactPhone: z.string().min(10, 'Le numéro doit contenir au moins 10 chiffres'),
  emergencyContactRelationship: z.string().min(2, 'La relation est obligatoire'),
  
  // Autorisations
  photoAuthorization: z.boolean().default(false),
  medicalAuthorization: z.boolean().default(false),
  
  // Notes
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddYoungsterFormProps {
  onSuccess?: () => void;
  youngster?: any; // Pour l'édition
}

export default function AddYoungsterForm({ onSuccess, youngster }: AddYoungsterFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: youngster ? {
      firstName: youngster.firstName,
      lastName: youngster.lastName,
      dateOfBirth: youngster.dateOfBirth?.toDate(),
      gender: youngster.gender,
      schoolName: youngster.schoolName || '',
      schoolLevel: youngster.schoolLevel || '',
      allergies: youngster.healthInfo?.allergies || '',
      medicalConditions: youngster.healthInfo?.medicalConditions || '',
      medications: youngster.healthInfo?.medications || '',
      dietaryRestrictions: youngster.healthInfo?.dietaryRestrictions || '',
      emergencyContactName: youngster.emergencyContact?.name || '',
      emergencyContactPhone: youngster.emergencyContact?.phoneNumber || '',
      emergencyContactRelationship: youngster.emergencyContact?.relationship || '',
      photoAuthorization: youngster.authorizations?.photos || false,
      medicalAuthorization: youngster.authorizations?.medicalCare || false,
      notes: youngster.notes || '',
    } : {
      firstName: '',
      lastName: '',
      schoolName: '',
      schoolLevel: '',
      allergies: '',
      medicalConditions: '',
      medications: '',
      dietaryRestrictions: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      photoAuthorization: false,
      medicalAuthorization: false,
      notes: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour effectuer cette action',
      });
      return;
    }

    setLoading(true);

    try {
      let photoUrl = youngster?.photoUrl || null;

      // Upload de la photo si un nouveau fichier est sélectionné
      if (photoFile) {
        setUploadingPhoto(true);
        try {
          // Supprimer l'ancienne photo si elle existe
          if (youngster?.photoUrl) {
            await deleteYoungsterPhoto(youngster.photoUrl);
          }

          // Upload la nouvelle photo avec progression
          const newPhotoUrl = await uploadYoungsterPhoto(
            user.uid,
            youngster?.id || 'temp',
            photoFile,
            ({ progress }) => {
              setUploadProgress(progress);
            }
          );
          photoUrl = newPhotoUrl;
        } catch (photoError) {
          console.error('Erreur upload photo:', photoError);
          toast({
            variant: 'destructive',
            title: 'Erreur photo',
            description: 'L\'upload de la photo a échoué. Le profil sera créé sans photo.',
          });
        } finally {
          setUploadingPhoto(false);
        }
      }

      const youngsterData = {
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        schoolName: values.schoolName || null,
        schoolLevel: values.schoolLevel || null,
        photoUrl,
        healthInfo: {
          allergies: values.allergies || null,
          medicalConditions: values.medicalConditions || null,
          medications: values.medications || null,
          dietaryRestrictions: values.dietaryRestrictions || null,
        },
        emergencyContact: {
          name: values.emergencyContactName,
          phoneNumber: values.emergencyContactPhone,
          relationship: values.emergencyContactRelationship,
        },
        authorizations: {
          photos: values.photoAuthorization,
          medicalCare: values.medicalAuthorization,
        },
        notes: values.notes || null,
      };

      if (youngster) {
        // Mise à jour
        await updateYoungster(user.uid, youngster.id, youngsterData);
        toast({
          title: 'Profil modifié',
          description: `Le profil de ${values.firstName} a été mis à jour avec succès.`,
        });
      } else {
        // Création
        const newYoungsterId = await createYoungster(user.uid, youngsterData);
        
        // Si une photo a été uploadée avec un ID temporaire, la déplacer
        if (photoFile && photoUrl) {
          try {
            const finalPhotoUrl = await uploadYoungsterPhoto(
              user.uid,
              newYoungsterId,
              photoFile
            );
            await updateYoungster(user.uid, newYoungsterId, { photoUrl: finalPhotoUrl });
          } catch (error) {
            console.error('Erreur finale photo:', error);
          }
        }
        
        toast({
          title: 'Jeune ajouté',
          description: `Le profil de ${values.firstName} a été créé avec succès.`,
        });
      }

      form.reset();
      setPhotoFile(null);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {youngster ? 'Modifier' : 'Ajouter un jeune'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{youngster ? 'Modifier le profil' : 'Ajouter un jeune'}</DialogTitle>
          <DialogDescription>
            {youngster 
              ? 'Modifiez les informations du jeune. Toutes les informations sont sécurisées et confidentielles.'
              : 'Remplissez les informations du jeune à ajouter. Toutes les informations sont sécurisées et confidentielles.'}
          </DialogDescription>
        </DialogHeader>

        {/* Upload de photo */}
        <div className="flex justify-center py-4">
          <ImageUpload
            currentImageUrl={youngster?.photoUrl}
            onImageSelect={(file) => setPhotoFile(file)}
            onImageRemove={() => setPhotoFile(null)}
            uploading={uploadingPhoto}
            uploadProgress={uploadProgress}
            disabled={loading}
            variant="avatar"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations générales</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de naissance *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd MMMM yyyy', { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Garçon</SelectItem>
                          <SelectItem value="female">Fille</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>École</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'école" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau scolaire</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CE2, 6ème..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Informations médicales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations médicales</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Listez les allergies connues..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions médicales</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Conditions médicales particulières..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médicaments</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Médicaments pris régulièrement..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restrictions alimentaires</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Régime alimentaire particulier..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact d'urgence */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact d'urgence</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input placeholder="06 00 00 00 00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mère, Père..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Autorisations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Autorisations</h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="photoAuthorization"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Autorisation de prise de photos</FormLabel>
                        <FormDescription>
                          J'autorise la prise de photos de mon enfant lors des missions
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalAuthorization"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Autorisation de soins médicaux d'urgence</FormLabel>
                        <FormDescription>
                          J'autorise les soins médicaux d'urgence si nécessaire
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes additionnelles</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informations complémentaires importantes..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Toute information utile pour assurer un accompagnement optimal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {youngster ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
