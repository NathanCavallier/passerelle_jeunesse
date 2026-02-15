'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateUserDocument } from '@/lib/firestore-service';
import {
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
} from '@/lib/auth-service';
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  fileToBase64,
} from '@/lib/profile-service';
import { Loader2, Upload, X, AlertCircle, Check } from 'lucide-react';
import type { Address } from '@/types/firestore';

export default function EditProfileForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // États du formulaire
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [address, setAddress] = useState<Address>(
    userProfile?.address || {
      street: '',
      postalCode: '',
      city: '',
      country: 'France',
    }
  );

  // États photo de profil
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(userProfile?.photoURL || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // États modification email
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  // États modification mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // États généraux
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ===========================================================================
  // GESTIONNAIRES DE PHOTO
  // ===========================================================================

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Prévisualisation
      const preview = await fileToBase64(file);
      setPhotoPreview(preview);
      setPhotoFile(file);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger l\'image',
      });
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(userProfile?.photoURL || null);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || !user) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      // Upload la nouvelle photo
      const photoURL = await uploadProfilePhoto(user.uid, photoFile);

      // Supprimer l'ancienne photo si elle existe
      if (userProfile?.photoURL) {
        await deleteProfilePhoto(userProfile.photoURL);
      }

      // Mettre à jour Auth et Firestore
      await updateUserProfile({ photoURL });
      await updateUserDocument(user.uid, { photoURL });

      setPhotoPreview(photoURL);
      setPhotoFile(null);

      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été mise à jour avec succès',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message || 'Impossible de mettre à jour la photo',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ===========================================================================
  // GESTIONNAIRE INFORMATIONS GÉNÉRALES
  // ===========================================================================

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Mettre à jour le displayName dans Auth
      const displayName = `${firstName} ${lastName}`;
      await updateUserProfile({ displayName });

      // Mettre à jour Firestore
      await updateUserDocument(user.uid, {
        firstName,
        lastName,
        phoneNumber,
        address,
      });

      setSuccess('Profil mis à jour avec succès');
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message || 'Erreur lors de la mise à jour',
      });
    } finally {
      setSaving(false);
    }
  };

  // ===========================================================================
  // GESTIONNAIRE CHANGEMENT EMAIL
  // ===========================================================================

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setChangingEmail(true);
    setError(null);
    setSuccess(null);

    try {
      if (!newEmail || !emailPassword) {
        throw new Error('Veuillez remplir tous les champs');
      }

      // Mettre à jour email (avec réauthentification)
      await updateUserEmail(newEmail, emailPassword);

      // Mettre à jour Firestore
      await updateUserDocument(user.uid, {
        email: newEmail,
        emailVerified: false,
      });

      setNewEmail('');
      setEmailPassword('');
      setSuccess('Email modifié. Vérifiez votre boîte mail pour confirmer.');
      toast({
        title: 'Email modifié',
        description: 'Un email de vérification a été envoyé à la nouvelle adresse',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement d\'email');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message || 'Erreur lors du changement d\'email',
      });
    } finally {
      setChangingEmail(false);
    }
  };

  // ===========================================================================
  // GESTIONNAIRE CHANGEMENT MOT DE PASSE
  // ===========================================================================

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Veuillez remplir tous les champs');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Mettre à jour mot de passe (avec réauthentification)
      await updateUserPassword(currentPassword, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Mot de passe modifié avec succès');
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été changé avec succès',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message || 'Erreur lors du changement de mot de passe',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Alertes globales */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Photo de profil */}
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>
            Votre photo apparaîtra sur votre profil et dans vos réservations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback className="text-2xl">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                disabled={uploadingPhoto}
              />
              <p className="text-sm text-muted-foreground">
                JPG, PNG ou WebP. Max 5MB.
              </p>
            </div>
          </div>

          {photoFile && (
            <div className="flex gap-2">
              <Button
                onClick={handleUploadPhoto}
                disabled={uploadingPhoto}
                className="flex-1"
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enregistrer la photo
                  </>
                )}
              </Button>
              <Button
                onClick={handleRemovePhoto}
                variant="outline"
                disabled={uploadingPhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Mettez à jour vos informations de contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="street">Adresse</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress({ ...address, postalCode: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Changement d'email */}
      <Card>
        <CardHeader>
          <CardTitle>Changer d'adresse email</CardTitle>
          <CardDescription>
            Email actuel : <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Nouvelle adresse email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouvelle@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailPassword">Mot de passe actuel</Label>
              <Input
                id="emailPassword"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Confirmer avec votre mot de passe"
              />
            </div>

            <Button type="submit" disabled={changingEmail} className="w-full">
              {changingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification en cours...
                </>
              ) : (
                'Changer l\'email'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Changement de mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle>Changer de mot de passe</CardTitle>
          <CardDescription>
            Le mot de passe doit contenir au moins 6 caractères
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={changingPassword} className="w-full">
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification en cours...
                </>
              ) : (
                'Changer le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
