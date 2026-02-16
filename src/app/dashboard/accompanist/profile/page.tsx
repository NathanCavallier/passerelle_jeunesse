/**
 * Page de profil de l'accompagnateur
 * Gestion des informations personnelles et des disponibilités
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  User,
  Clock,
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  Badge as BadgeIcon,
  FileText,
  Save,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AccompanistProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && !isAccompanist) {
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, isAccompanist, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implémenter la sauvegarde du profil
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès."
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder vos modifications."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !isAuthenticated || !isAccompanist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const accompanistProfile = userProfile?.accompanistProfile;
  const weekDays = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/accompanist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
              <p className="text-gray-600 mt-1">
                Gérez vos informations personnelles et disponibilités
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>Sauvegarde...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personnel
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Disponibilités
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex items-center gap-2">
              <BadgeIcon className="h-4 w-4" />
              Qualifications
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations personnelles */}
          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Vos données de base utilisées pour votre profil public
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prénom</Label>
                      <Input 
                        value={userProfile?.firstName || ''} 
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Input 
                        value={userProfile?.lastName || ''} 
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={userProfile?.email || ''} 
                      disabled={true}
                    />
                  </div>
                  
                  <div>
                    <Label>Téléphone</Label>
                    <Input 
                      value={userProfile?.phoneNumber || ''} 
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label>Biographie</Label>
                    <Textarea 
                      value={accompanistProfile?.biography || ''} 
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Présentez-vous aux familles..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos statistiques</CardTitle>
                  <CardDescription>
                    Performance et historique de vos missions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {accompanistProfile?.totalMissions || 0}
                      </p>
                      <p className="text-sm text-gray-600">Missions terminées</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {accompanistProfile?.rating?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Note moyenne</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {accompanistProfile?.totalEarnings?.toFixed(0) || 0}€
                    </p>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Expérience</Label>
                    <Textarea 
                      value={accompanistProfile?.experience || ''} 
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Décrivez votre expérience dans l'accompagnement..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Disponibilités */}
          <TabsContent value="availability">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Disponibilités hebdomadaires */}
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilités hebdomadaires</CardTitle>
                  <CardDescription>
                    Définissez vos créneaux horaires par jour de la semaine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weekDays.map((day) => {
                    const dayAvailability = accompanistProfile?.availability?.[day.key as keyof typeof accompanistProfile.availability] || [];
                    
                    return (
                      <div key={day.key} className="space-y-2">
                        <Label className="font-medium">{day.label}</Label>
                        <div className="space-y-2">
                          {dayAvailability.length > 0 ? (
                            dayAvailability.map((slot, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input 
                                  type="time" 
                                  value={slot.start} 
                                  disabled={!isEditing}
                                  className="w-32"
                                />
                                <span>→</span>
                                <Input 
                                  type="time" 
                                  value={slot.end} 
                                  disabled={!isEditing}
                                  className="w-32"
                                />
                                {isEditing && (
                                  <Button variant="outline" size="sm">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              Non disponible ce jour
                            </p>
                          )}
                          
                          {isEditing && (
                            <Button variant="outline" size="sm" className="w-full">
                              + Ajouter un créneau
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Paramètres de service */}
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de service</CardTitle>
                  <CardDescription>
                    Configuration de vos capacités d'accompagnement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nombre maximum de jeunes</Label>
                    <Input 
                      type="number"
                      min="1"
                      max="10"
                      value={accompanistProfile?.maxYoungsters || 1} 
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Combien de jeunes pouvez-vous accompagner simultanément ?
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="longDistance"
                      checked={accompanistProfile?.longDistanceAvailable || false}
                      disabled={!isEditing}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="longDistance">
                      Disponible pour les missions longue distance
                    </Label>
                  </div>

                  <div>
                    <Label>Zones d'intervention</Label>
                    <div className="space-y-2">
                      {accompanistProfile?.zones?.map((zone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={zone} 
                            disabled={!isEditing}
                          />
                          {isEditing && (
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500 italic">
                          Aucune zone définie
                        </p>
                      )}
                      
                      {isEditing && (
                        <Button variant="outline" size="sm" className="w-full">
                          + Ajouter une zone
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Qualifications */}
          <TabsContent value="qualifications">
            <Card>
              <CardHeader>
                <CardTitle>Certifications et formations</CardTitle>
                <CardDescription>
                  Vos qualifications professionnelles et formations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Certifications</Label>
                  <div className="space-y-2">
                    {accompanistProfile?.certifications?.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={cert} 
                          disabled={!isEditing}
                          placeholder="Nom de la certification"
                        />
                        {isEditing && (
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500 italic">
                        Aucune certification ajoutée
                      </p>
                    )}
                    
                    {isEditing && (
                      <Button variant="outline" size="sm" className="w-full">
                        + Ajouter une certification
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents obligatoires</CardTitle>
                <CardDescription>
                  Statut de vérification de vos documents administratifs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Casier judiciaire */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Casier judiciaire</h4>
                      {accompanistProfile?.documents?.criminalRecord?.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Non vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Extrait de casier judiciaire vierge requis
                    </p>
                  </div>

                  {/* Assurance */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Assurance RC</h4>
                      {accompanistProfile?.documents?.insurance?.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Non vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Assurance responsabilité civile professionnelle
                    </p>
                  </div>

                  {/* Carte d'identité */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Pièce d'identité</h4>
                      {accompanistProfile?.documents?.idCard?.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Non vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Carte d'identité ou passeport valide
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Information :</strong> Les documents doivent être vérifiés par l'administration 
                    avant que vous puissiez accepter des missions. Contactez le support si vous avez 
                    des questions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}