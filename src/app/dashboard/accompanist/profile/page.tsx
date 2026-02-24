/**
 * Page de profil de l'accompagnateur
 * Gestion des informations personnelles, disponibilités et documents
 */

'use client';

import { useEffect, useRef, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  updateAccompanistPersonalInfo,
  updateWeeklyAvailability,
  updateServiceSettings,
  addCertification,
  removeCertification,
  updateZones,
  addUnavailability,
  removeUnavailability,
  getUnavailabilities,
  type UnavailabilityPeriod,
} from '@/lib/accompanist-service';
import type { WeeklyAvailability } from '@/types/firestore';
import {
  ArrowLeft,
  User,
  Clock,
  MapPin,
  Badge as BadgeIcon,
  FileText,
  Save,
  Edit,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  CalendarOff,
} from 'lucide-react';

export default function AccompanistProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [biography, setBiography] = useState('');
  const [experience, setExperience] = useState('');

  // Availability
  const [availability, setAvailability] = useState<WeeklyAvailability>({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: [],
  });

  // Service settings
  const [maxYoungsters, setMaxYoungsters] = useState(1);
  const [longDistanceAvailable, setLongDistanceAvailable] = useState(false);
  const [zones, setZones] = useState<string[]>([]);
  const [newZone, setNewZone] = useState('');

  // Certifications
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState('');

  // Unavailabilities
  const [unavailabilities, setUnavailabilities] = useState<UnavailabilityPeriod[]>([]);
  const [newUnavailStart, setNewUnavailStart] = useState('');
  const [newUnavailEnd, setNewUnavailEnd] = useState('');
  const [newUnavailReason, setNewUnavailReason] = useState('');
  const [loadingUnavail, setLoadingUnavail] = useState(false);

  // Initialize form from profile (once)
  const profileInitialized = useRef(false);
  useEffect(() => {
    if (userProfile && !profileInitialized.current) {
      profileInitialized.current = true;
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setBiography(userProfile.accompanistProfile?.biography || '');
      setExperience(userProfile.accompanistProfile?.experience || '');
      setMaxYoungsters(userProfile.accompanistProfile?.maxYoungsters || 1);
      setLongDistanceAvailable(userProfile.accompanistProfile?.longDistanceAvailable || false);
      setZones(userProfile.accompanistProfile?.zones || []);
      setCertifications(userProfile.accompanistProfile?.certifications || []);
      if (userProfile.accompanistProfile?.availability) {
        setAvailability(userProfile.accompanistProfile.availability);
      }
    }
  }, [userProfile]);

  // Load unavailabilities
  useEffect(() => {
    if (user?.uid) {
      getUnavailabilities(user.uid).then(setUnavailabilities).catch(console.error);
    }
  }, [user?.uid]);

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
    if (!user) return;
    setIsSaving(true);
    try {
      await updateAccompanistPersonalInfo(user.uid, {
        firstName, lastName, phoneNumber, biography, experience,
      });
      await updateWeeklyAvailability(user.uid, availability);
      await updateServiceSettings(user.uid, { maxYoungsters, longDistanceAvailable });
      await updateZones(user.uid, zones);

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été sauvegardées avec succès.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos modifications.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlot = (day: keyof WeeklyAvailability) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: '08:00', end: '18:00' }],
    }));
  };

  const handleRemoveSlot = (day: keyof WeeklyAvailability, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSlotChange = (
    day: keyof WeeklyAvailability,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((slot: any, i: number) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const handleAddZone = () => {
    if (newZone.trim()) {
      setZones((prev) => [...prev, newZone.trim()]);
      setNewZone('');
    }
  };

  const handleRemoveZone = (index: number) => {
    setZones((prev) => prev.filter((_: string, i: number) => i !== index));
  };

  const handleAddCertification = async () => {
    if (!newCertification.trim() || !user) return;
    try {
      await addCertification(user.uid, newCertification.trim());
      setCertifications((prev) => [...prev, newCertification.trim()]);
      setNewCertification('');
      toast({ title: 'Certification ajoutée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter la certification." });
    }
  };

  const handleRemoveCertification = async (cert: string) => {
    if (!user) return;
    try {
      await removeCertification(user.uid, cert);
      setCertifications((prev) => prev.filter((c) => c !== cert));
      toast({ title: 'Certification supprimée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la certification.' });
    }
  };

  const handleAddUnavailability = async () => {
    if (!newUnavailStart || !newUnavailEnd || !user) return;
    setLoadingUnavail(true);
    try {
      const id = await addUnavailability(user.uid, {
        startDate: newUnavailStart,
        endDate: newUnavailEnd,
        reason: newUnavailReason,
      });
      setUnavailabilities((prev) => [
        ...prev,
        { id, startDate: newUnavailStart, endDate: newUnavailEnd, reason: newUnavailReason } as UnavailabilityPeriod,
      ]);
      setNewUnavailStart('');
      setNewUnavailEnd('');
      setNewUnavailReason('');
      toast({ title: 'Indisponibilité ajoutée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter l'indisponibilité." });
    } finally {
      setLoadingUnavail(false);
    }
  };

  const handleRemoveUnavailability = async (unavailId: string) => {
    if (!user) return;
    try {
      await removeUnavailability(user.uid, unavailId);
      setUnavailabilities((prev) => prev.filter((u) => u.id !== unavailId));
      toast({ title: 'Indisponibilité supprimée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'indisponibilité." });
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
  const weekDays: { key: keyof WeeklyAvailability; label: string }[] = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
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
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personnel</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Disponibilités</span>
            </TabsTrigger>
            <TabsTrigger value="unavailabilities" className="flex items-center gap-2">
              <CalendarOff className="h-4 w-4" />
              <span className="hidden sm:inline">Indisponibilités</span>
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex items-center gap-2">
              <BadgeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Qualifications</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations personnelles */}
          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Vos données de base utilisées pour votre profil public</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prénom</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={userProfile?.email || ''} disabled={true} />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label>Biographie</Label>
                    <Textarea value={biography} onChange={(e) => setBiography(e.target.value)} disabled={!isEditing} rows={4} placeholder="Présentez-vous aux familles..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vos statistiques</CardTitle>
                  <CardDescription>Performance et historique de vos missions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{accompanistProfile?.totalMissions || 0}</p>
                      <p className="text-sm text-gray-600">Missions terminées</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{accompanistProfile?.rating?.toFixed(1) || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Note moyenne</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{accompanistProfile?.totalEarnings?.toFixed(0) || 0}€</p>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Expérience</Label>
                    <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} disabled={!isEditing} rows={3} placeholder="Décrivez votre expérience dans l'accompagnement..." />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Disponibilités */}
          <TabsContent value="availability">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilités hebdomadaires</CardTitle>
                  <CardDescription>Définissez vos créneaux horaires par jour de la semaine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weekDays.map((day) => {
                    const daySlots = availability[day.key] || [];
                    return (
                      <div key={day.key} className="space-y-2">
                        <Label className="font-medium">{day.label}</Label>
                        <div className="space-y-2">
                          {daySlots.length > 0 ? (
                            daySlots.map((slot: any, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input type="time" value={slot.start} onChange={(e) => handleSlotChange(day.key, index, 'start', e.target.value)} disabled={!isEditing} className="w-32" />
                                <span>→</span>
                                <Input type="time" value={slot.end} onChange={(e) => handleSlotChange(day.key, index, 'end', e.target.value)} disabled={!isEditing} className="w-32" />
                                {isEditing && (
                                  <Button variant="outline" size="sm" onClick={() => handleRemoveSlot(day.key, index)}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">Non disponible ce jour</p>
                          )}
                          {isEditing && (
                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddSlot(day.key)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un créneau
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de service</CardTitle>
                  <CardDescription>Configuration de vos capacités d&apos;accompagnement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nombre maximum de jeunes</Label>
                    <Input type="number" min="1" max="10" value={maxYoungsters} onChange={(e) => setMaxYoungsters(parseInt(e.target.value) || 1)} disabled={!isEditing} />
                    <p className="text-xs text-gray-500 mt-1">Combien de jeunes pouvez-vous accompagner simultanément ?</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="longDistance">Disponible pour les missions longue distance</Label>
                    <Switch id="longDistance" checked={longDistanceAvailable} onCheckedChange={setLongDistanceAvailable} disabled={!isEditing} />
                  </div>

                  <div>
                    <Label>Zones d&apos;intervention</Label>
                    <div className="space-y-2">
                      {zones.map((zone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex-1 justify-start py-2 px-3">
                            <MapPin className="h-3 w-3 mr-2" />
                            {zone}
                          </Badge>
                          {isEditing && (
                            <Button variant="outline" size="sm" onClick={() => handleRemoveZone(index)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {zones.length === 0 && <p className="text-sm text-gray-500 italic">Aucune zone définie</p>}
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <Input placeholder="Ex: Metz et environs" value={newZone} onChange={(e) => setNewZone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddZone())} />
                          <Button variant="outline" size="sm" onClick={handleAddZone}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Indisponibilités */}
          <TabsContent value="unavailabilities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarOff className="h-5 w-5" />
                  Périodes d&apos;indisponibilité
                </CardTitle>
                <CardDescription>Déclarez vos congés, absences ou périodes où vous ne pouvez pas réaliser de missions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h4 className="font-medium">Ajouter une indisponibilité</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <Input type="date" value={newUnavailStart} onChange={(e) => setNewUnavailStart(e.target.value)} />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input type="date" value={newUnavailEnd} onChange={(e) => setNewUnavailEnd(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Raison (optionnel)</Label>
                    <Input placeholder="Vacances, rendez-vous personnel..." value={newUnavailReason} onChange={(e) => setNewUnavailReason(e.target.value)} />
                  </div>
                  <Button onClick={handleAddUnavailability} disabled={loadingUnavail || !newUnavailStart || !newUnavailEnd}>
                    {loadingUnavail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {unavailabilities.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarOff className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucune indisponibilité déclarée</p>
                    </div>
                  ) : (
                    unavailabilities.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CalendarOff className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{u.startDate} → {u.endDate}</p>
                            {u.reason && <p className="text-sm text-gray-500">{u.reason}</p>}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveUnavailability(u.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Qualifications */}
          <TabsContent value="qualifications">
            <Card>
              <CardHeader>
                <CardTitle>Certifications et formations</CardTitle>
                <CardDescription>Vos qualifications professionnelles et formations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex-1 justify-start py-2 px-3">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {cert}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveCertification(cert)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {certifications.length === 0 && <p className="text-sm text-gray-500 italic">Aucune certification ajoutée</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Nom de la certification (ex: PSC1, BAFA...)" value={newCertification} onChange={(e) => setNewCertification(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())} />
                  <Button variant="outline" onClick={handleAddCertification}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents obligatoires</CardTitle>
                <CardDescription>Statut de vérification de vos documents administratifs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Casier judiciaire</h4>
                      {accompanistProfile?.documents?.criminalRecord?.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Vérifié</Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Non vérifié</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Extrait de casier judiciaire vierge requis</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Assurance RC</h4>
                      {accompanistProfile?.documents?.insurance?.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Vérifié</Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Non vérifié</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Assurance responsabilité civile professionnelle</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Pièce d&apos;identité</h4>
                      {accompanistProfile?.documents?.idCard?.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Vérifié</Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Non vérifié</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Carte d&apos;identité ou passeport valide</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Information :</strong> Les documents doivent être vérifiés par l&apos;administration avant que vous puissiez accepter des missions. Contactez le support si vous avez des questions.
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
