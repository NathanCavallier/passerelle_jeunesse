/**
 * Page de détail d'une mission - Phase 5 complète
 * Infos jeunes enrichies, checklist, QR code, incidents, rapport de mission
 */

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MissionTimeline } from '@/components/mission/mission-timeline';
import { PhotoCapture } from '@/components/mission/photo-capture';
import { LocationTracker } from '@/components/mission/location-tracker';
import { GPSNavigation } from '@/components/mission/gps-navigation';
import { getFirebaseDb } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe, getDoc } from 'firebase/firestore';
import {
  submitMissionReport,
  reportIncident,
  initMissionChecklist,
  updateChecklistItem,
  getMissionChecklist,
  generateHandoverQRData,
  validateHandoverQR,
} from '@/lib/accompanist-service';
import type { Booking, MissionStatus, BehaviourRating, IncidentType, IncidentSeverity, Youngster } from '@/types/firestore';
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Navigation,
  Phone,
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle,
  Loader2,
  User,
  Heart,
  Shield,
  BookOpen,
  QrCode,
  ClipboardList,
  FileText,
  CheckSquare,
  Square,
  Star,
  Stethoscope,
  Pill,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  checkedAt?: unknown;
}

export default function AccompanistMissionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  // Détails jeunes complets
  const [youngstersDetails, setYoungstersDetails] = useState<Record<string, Youngster>>({});

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  // QR Code
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [scanInput, setScanInput] = useState('');
  const [validatingQR, setValidatingQR] = useState(false);

  // Incident
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentType, setIncidentType] = useState<IncidentType>('other');
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>('low');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [incidents, setIncidents] = useState<Array<{ type: IncidentType; severity: IncidentSeverity; description: string; reportedAt: Date }>>([]);

  // Rapport de mission
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportBehaviour, setReportBehaviour] = useState<BehaviourRating>('good');
  const [reportCooperation, setReportCooperation] = useState<BehaviourRating>('good');
  const [reportNotes, setReportNotes] = useState('');
  const [reportRecommendations, setReportRecommendations] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Active tab for mobile
  const [activeSection, setActiveSection] = useState<string>('details');

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

  // Écouter cette mission en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user || !isAccompanist || !id) return;

    setLoadingBooking(true);

    const bookingRef = doc(getFirebaseDb(), 'bookings', id);
    const unsubscribe: Unsubscribe = onSnapshot(
      bookingRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.accompanistId !== user.uid) {
            toast({ variant: 'destructive', title: 'Accès non autorisé', description: 'Cette mission ne vous est pas assignée.' });
            router.push('/dashboard/accompanist/missions');
            return;
          }

          const bookingData = {
            id: docSnap.id,
            ...data,
            scheduledFor: data.scheduledFor?.toDate?.() || data.scheduledFor,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as Booking;

          setBooking(bookingData);
          setLoadingBooking(false);
        } else {
          toast({ variant: 'destructive', title: 'Mission introuvable' });
          router.push('/dashboard/accompanist/missions');
        }
      },
      (error) => {
        console.error('Erreur chargement mission:', error);
        setLoadingBooking(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user, isAccompanist, id, router, toast]);

  // Charger détails complets des jeunes
  useEffect(() => {
    if (!booking?.youngstersIds?.length) return;

    const loadYoungsters = async () => {
      const details: Record<string, Youngster> = {};
      for (const yId of booking.youngstersIds) {
        try {
          const yDoc = await getDoc(doc(getFirebaseDb(), 'youngsters', yId));
          if (yDoc.exists()) {
            details[yId] = { id: yDoc.id, ...yDoc.data() } as Youngster;
          }
        } catch (e) {
          console.error('Erreur chargement jeune:', yId, e);
        }
      }
      setYoungstersDetails(details);
    };

    loadYoungsters();
  }, [booking?.youngstersIds]);

  // Charger la checklist
  useEffect(() => {
    if (!id) return;
    setLoadingChecklist(true);
    getMissionChecklist(id)
      .then((items) => setChecklist(items as ChecklistItem[]))
      .catch(console.error)
      .finally(() => setLoadingChecklist(false));
  }, [id]);

  const updateMissionStatus = async (newStatus: MissionStatus, photoURL?: string) => {
    if (!booking || !user) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          status: newStatus,
          notes: statusNotes.trim() || undefined,
          photoURL: photoURL || undefined,
        }),
      });
      if (!response.ok) throw new Error('Erreur de mise à jour');
      toast({ title: 'Statut mis à jour', description: `Mission: ${newStatus}` });
      setStatusNotes('');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Initialiser la checklist par défaut
  const handleInitChecklist = async () => {
    if (!id || !user) return;
    try {
      await initMissionChecklist(id);
      const items = await getMissionChecklist(id);
      setChecklist(items as ChecklistItem[]);
      toast({ title: 'Checklist initialisée' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'initialiser la checklist." });
    }
  };

  // Cocher/décocher un item de checklist
  const handleToggleChecklistItem = async (itemId: string, checked: boolean) => {
    if (!id) return;
    try {
      await updateChecklistItem(id, itemId, !checked);
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: !checked } : item
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Générer QR code
  const handleGenerateQR = () => {
    if (!booking || !user) return;
    const data = generateHandoverQRData(booking.id, user.uid);
    setQrData(data);
    setShowQR(true);
  };

  // Valider QR code
  const handleValidateQR = async () => {
    if (!scanInput.trim()) return;
    setValidatingQR(true);
    try {
      const result = await validateHandoverQR(scanInput, user!.uid);
      if (result.valid) {
        toast({ title: 'QR Code valide ✅', description: `Mission ${result.bookingId} confirmée` });
      } else {
        toast({ variant: 'destructive', title: 'QR Code invalide' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur de validation' });
    } finally {
      setValidatingQR(false);
      setScanInput('');
    }
  };

  // Signaler un incident
  const handleSubmitIncident = async () => {
    if (!booking || !user || !incidentDescription.trim()) return;
    setSubmittingIncident(true);
    try {
      await reportIncident(booking.id, {
        type: incidentType,
        severity: incidentSeverity,
        description: incidentDescription,
      });
      setIncidents((prev) => [
        ...prev,
        { type: incidentType, severity: incidentSeverity, description: incidentDescription, reportedAt: new Date() },
      ]);
      setIncidentDescription('');
      setShowIncidentForm(false);
      toast({ title: 'Incident signalé', description: "L'incident a été enregistré." });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de signaler l'incident." });
    } finally {
      setSubmittingIncident(false);
    }
  };

  // Soumettre le rapport de mission
  const handleSubmitReport = async () => {
    if (!booking || !user) return;
    setSubmittingReport(true);
    try {
      await submitMissionReport(booking.id, {
        behaviour: reportBehaviour,
        cooperation: reportCooperation,
        generalNotes: reportNotes,
        recommendations: reportRecommendations || undefined,
      });
      setShowReportForm(false);
      toast({ title: 'Rapport soumis ✅', description: 'Merci pour votre retour sur cette mission.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de soumettre le rapport.' });
    } finally {
      setSubmittingReport(false);
    }
  };

  const getStatusActions = (currentStatus?: string) => {
    const status = currentStatus || 'scheduled';
    const nextActions: Record<string, { status: MissionStatus; label: string; variant: 'default' | 'secondary' | 'destructive' }[]> = {
      scheduled: [{ status: 'en_route_to_pickup', label: 'En route vers le point de départ', variant: 'default' }],
      en_route_to_pickup: [{ status: 'waiting_at_pickup', label: 'Arrivé au point de départ', variant: 'default' }],
      waiting_at_pickup: [{ status: 'picked_up', label: 'Jeune pris en charge', variant: 'default' }],
      picked_up: [{ status: 'in_transit', label: 'En route vers la destination', variant: 'default' }],
      in_transit: [{ status: 'arriving_soon', label: 'Arrivé à destination', variant: 'default' }],
      arriving_soon: [{ status: 'delivered', label: 'Jeune déposé', variant: 'default' }],
      delivered: [{ status: 'completed', label: 'Mission terminée', variant: 'secondary' }],
    };
    return nextActions[status] || [];
  };

  const behaviourOptions: { value: BehaviourRating; label: string; emoji: string }[] = [
    { value: 'excellent', label: 'Excellent', emoji: '⭐' },
    { value: 'good', label: 'Bien', emoji: '👍' },
    { value: 'average', label: 'Moyen', emoji: '😐' },
    { value: 'difficult', label: 'Difficile', emoji: '⚠️' },
  ];

  const incidentTypes: { value: IncidentType; label: string }[] = [
    { value: 'delay', label: '⏰ Retard' },
    { value: 'health', label: '🏥 Santé' },
    { value: 'behaviour', label: '⚠️ Comportement' },
    { value: 'transport', label: '🚌 Transport' },
    { value: 'other', label: '📋 Autre' },
  ];

  if (loading || loadingBooking || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatus = booking.missionTracking?.currentStatus || 'scheduled';
  const statusActions = getStatusActions(currentStatus);
  const isCompleted = currentStatus === 'completed' || booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/accompanist/missions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Mission #{id.slice(0, 8)}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{booking.status}</Badge>
              <Badge variant="secondary" className="capitalize">{currentStatus.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        </div>

        {/* Navigation sections mobile */}
        <div className="flex flex-wrap gap-2 mb-6 lg:hidden">
          {[
            { id: 'details', label: 'Détails' },
            { id: 'youngsters', label: 'Jeunes' },
            { id: 'checklist', label: 'Checklist' },
            { id: 'actions', label: 'Actions' },
            { id: 'report', label: 'Rapport' },
          ].map((s) => (
            <Button
              key={s.id}
              variant={activeSection === s.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">

            {/* Trajet & Navigation */}
            <Card className={activeSection !== 'details' ? 'hidden lg:block' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Trajet &amp; Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Départ</p>
                    <p className="font-semibold">{booking.trip.departure.address}</p>
                    <p className="text-sm text-gray-500">
                      {format(
                        booking.scheduledFor instanceof Date
                          ? booking.scheduledFor
                          : (booking.scheduledFor as { toDate: () => Date }).toDate(),
                        'dd/MM/yyyy à HH:mm',
                        { locale: fr }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Destination</p>
                    <p className="font-semibold">{booking.trip.arrival.address}</p>
                  </div>
                </div>

                <GPSNavigation
                  destinations={[
                    {
                      address: booking.trip.departure.address,
                      latitude: booking.trip.departure.coordinates?.lat,
                      longitude: booking.trip.departure.coordinates?.lng,
                      name: 'Départ',
                      type: 'pickup' as const,
                    },
                    {
                      address: booking.trip.arrival.address,
                      latitude: booking.trip.arrival.coordinates?.lat,
                      longitude: booking.trip.arrival.coordinates?.lng,
                      name: 'Destination',
                      type: 'destination' as const,
                    },
                  ]}
                  onNavigationStart={(provider, destination) => console.log('Nav:', provider, destination)}
                />
              </CardContent>
            </Card>

            {/* Jeunes à accompagner - Détails enrichis */}
            <Card className={activeSection !== 'youngsters' && activeSection !== 'details' ? 'hidden lg:block' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Jeunes à accompagner ({booking.youngsters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.youngsters.map((youngster, index) => {
                    const fullDetails = youngstersDetails[youngster.youngsterId];

                    return (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{youngster.firstName}</h4>
                            <p className="text-sm text-gray-600">{youngster.age} ans</p>
                          </div>
                        </div>

                        {youngster.specialNotes && (
                          <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <span>{youngster.specialNotes}</span>
                          </div>
                        )}

                        {/* Informations de santé enrichies */}
                        {fullDetails && (
                          <div className="space-y-2 border-t pt-3">
                            {fullDetails.healthInfo && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  Informations médicales
                                </p>
                                {fullDetails.healthInfo.allergies && fullDetails.healthInfo.allergies.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Pill className="h-3 w-3 text-orange-500" />
                                    <span className="text-orange-700">Allergies: {fullDetails.healthInfo.allergies.join(', ')}</span>
                                  </div>
                                )}
                                {fullDetails.healthInfo.medications && fullDetails.healthInfo.medications.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Stethoscope className="h-3 w-3 text-purple-500" />
                                    <span>Médicaments: {fullDetails.healthInfo.medications.join(', ')}</span>
                                  </div>
                                )}
                                {fullDetails.healthInfo.chronicConditions && fullDetails.healthInfo.chronicConditions.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Shield className="h-3 w-3 text-blue-500" />
                                    <span>Conditions: {fullDetails.healthInfo.chronicConditions.join(', ')}</span>
                                  </div>
                                )}
                                {fullDetails.healthInfo.doctorName && (
                                  <div className="text-sm text-gray-600">
                                    Médecin: {fullDetails.healthInfo.doctorName} {fullDetails.healthInfo.doctorPhone && `(${fullDetails.healthInfo.doctorPhone})`}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Contacts d'urgence */}
                            {fullDetails.emergencyContacts && fullDetails.emergencyContacts.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-green-500" />
                                  Contacts d&apos;urgence
                                </p>
                                {fullDetails.emergencyContacts.map((contact, cIdx) => (
                                  <div key={cIdx} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                    <div>
                                      <span className="font-medium">{contact.name}</span>
                                      <span className="text-gray-500 ml-1">({contact.relationship})</span>
                                    </div>
                                    <a href={`tel:${contact.phoneNumber}`} className="text-blue-600 hover:underline">
                                      {contact.phoneNumber}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Notes comportementales */}
                            {fullDetails.behaviouralNotes && (
                              <div className="text-sm p-2 bg-blue-50 rounded">
                                <p className="font-medium">Notes comportementales:</p>
                                <p className="text-gray-700">{fullDetails.behaviouralNotes}</p>
                              </div>
                            )}

                            {/* Besoins spéciaux */}
                            {fullDetails.specialNeeds && fullDetails.specialNeeds.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {fullDetails.specialNeeds.map((need, nIdx) => (
                                  <Badge key={nIdx} variant="outline" className="text-xs">{need}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Instructions spéciales */}
            {booking.additionalInfo && (
              <Card className={activeSection !== 'details' ? 'hidden lg:block' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Instructions spéciales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg">{booking.additionalInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Checklist de mission */}
            <Card className={activeSection !== 'checklist' ? 'hidden lg:block' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Checklist de mission
                </CardTitle>
                <CardDescription>Vérifiez chaque étape avant et pendant la mission</CardDescription>
              </CardHeader>
              <CardContent>
                {checklist.length === 0 ? (
                  <div className="text-center py-6">
                    <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">Aucune checklist définie</p>
                    <Button variant="outline" onClick={handleInitChecklist} disabled={loadingChecklist}>
                      {loadingChecklist ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      Initialiser la checklist
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          item.checked ? 'bg-green-50' : 'bg-white border hover:bg-gray-50'
                        }`}
                        onClick={() => handleToggleChecklistItem(item.id, item.checked)}
                      >
                        {item.checked ? (
                          <CheckSquare className="h-5 w-5 text-green-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                        <span className={item.checked ? 'line-through text-gray-500' : ''}>{item.label}</span>
                      </div>
                    ))}
                    <div className="text-right text-sm text-gray-500 mt-2">
                      {checklist.filter((i) => i.checked).length}/{checklist.length} complétés
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className={activeSection !== 'details' ? 'hidden lg:block' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Suivi de la mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MissionTimeline missionTracking={booking.missionTracking} />
              </CardContent>
            </Card>

            {/* Rapport de mission (post-mission) */}
            {isCompleted && (
              <Card className={activeSection !== 'report' ? 'hidden lg:block' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Rapport de mission
                  </CardTitle>
                  <CardDescription>Remplissez le rapport de fin de mission</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showReportForm ? (
                    <div className="text-center py-6">
                      <Star className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">La mission est terminée. Remplissez votre rapport.</p>
                      <Button onClick={() => setShowReportForm(true)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Rédiger le rapport
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Comportement du/des jeune(s)</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {behaviourOptions.map((opt) => (
                            <Button
                              key={opt.value}
                              variant={reportBehaviour === opt.value ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setReportBehaviour(opt.value)}
                            >
                              {opt.emoji} {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Coopération</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {behaviourOptions.map((opt) => (
                            <Button
                              key={opt.value}
                              variant={reportCooperation === opt.value ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setReportCooperation(opt.value)}
                            >
                              {opt.emoji} {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Notes générales</Label>
                        <Textarea
                          value={reportNotes}
                          onChange={(e) => setReportNotes(e.target.value)}
                          rows={4}
                          placeholder="Comment s'est déroulée la mission..."
                        />
                      </div>

                      <div>
                        <Label>Recommandations (optionnel)</Label>
                        <Textarea
                          value={reportRecommendations}
                          onChange={(e) => setReportRecommendations(e.target.value)}
                          rows={2}
                          placeholder="Suggestions pour les prochaines missions..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSubmitReport} disabled={submittingReport || !reportNotes.trim()}>
                          {submittingReport ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                          Soumettre le rapport
                        </Button>
                        <Button variant="outline" onClick={() => setShowReportForm(false)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne droite - Actions */}
          <div className={`space-y-6 ${activeSection !== 'actions' && activeSection !== 'details' ? 'hidden lg:block' : ''}`}>

            {/* Actions de statut */}
            <Card>
              <CardHeader>
                <CardTitle>Statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Badge variant="default" className="mb-1">{booking.status}</Badge>
                  <p className="text-sm font-medium capitalize">{currentStatus.replace(/_/g, ' ')}</p>
                </div>

                {!isCompleted && !isCancelled && statusActions.length > 0 && (
                  <div className="space-y-2">
                    {statusActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        className="w-full"
                        onClick={() => updateMissionStatus(action.status)}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                <Textarea
                  placeholder="Notes sur cette étape..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={2}
                  disabled={updatingStatus}
                />
              </CardContent>
            </Card>

            {/* QR Code de prise en charge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code de prise en charge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleGenerateQR}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Générer le QR Code
                </Button>

                {showQR && qrData && (
                  <div className="p-4 bg-white border-2 rounded-lg text-center">
                    <div className="w-48 h-48 mx-auto bg-gray-100 border rounded flex items-center justify-center mb-2">
                      <div className="text-center">
                        <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 break-all px-2">{qrData.slice(0, 20)}...</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Présentez ce code au parent/tuteur</p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <Label className="text-xs">Scanner un code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Code QR..."
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      className="text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={handleValidateQR} disabled={validatingQR}>
                      {validatingQR ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Géolocalisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Géolocalisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationTracker
                  bookingId={booking.id}
                  missionStatus={booking.missionTracking?.currentStatus}
                  onLocationUpdate={(position) => console.log('Position:', position)}
                />
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos sécurisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoCapture
                  bookingId={booking.id}
                  photoType="other"
                  onPhotoUploaded={() => {
                    toast({ title: 'Photo uploadée', description: 'La photo a été ajoutée.' });
                  }}
                />
              </CardContent>
            </Card>

            {/* Signaler un incident */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Signaler un incident
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showIncidentForm ? (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                      onClick={() => setShowIncidentForm(true)}
                      disabled={isCompleted || isCancelled}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Signaler un incident
                    </Button>

                    {incidents.length > 0 && (
                      <div className="space-y-2">
                        {incidents.map((inc, idx) => (
                          <div key={idx} className="p-2 bg-orange-50 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">{inc.type}</Badge>
                              <Badge variant={inc.severity === 'high' ? 'destructive' : 'outline'} className="text-xs">{inc.severity}</Badge>
                            </div>
                            <p className="mt-1 text-gray-700">{inc.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Type d&apos;incident</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {incidentTypes.map((t) => (
                          <Button
                            key={t.value}
                            variant={incidentType === t.value ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => setIncidentType(t.value)}
                          >
                            {t.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Sévérité</Label>
                      <div className="flex gap-1 mt-1">
                        {(['low', 'medium', 'high'] as IncidentSeverity[]).map((s) => (
                          <Button
                            key={s}
                            variant={incidentSeverity === s ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => setIncidentSeverity(s)}
                          >
                            {s === 'low' ? '🟢 Faible' : s === 'medium' ? '🟡 Moyen' : '🔴 Grave'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={incidentDescription}
                        onChange={(e) => setIncidentDescription(e.target.value)}
                        rows={3}
                        placeholder="Décrivez l'incident..."
                        className="text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSubmitIncident}
                        disabled={submittingIncident || !incidentDescription.trim()}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {submittingIncident ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        Signaler
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowIncidentForm(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact parent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact parent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{booking.trip.departure.contactPerson || 'Parent'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  {booking.trip.departure.contactPhone ? (
                    <a href={`tel:${booking.trip.departure.contactPhone}`} className="font-medium text-blue-600 hover:underline">
                      {booking.trip.departure.contactPhone}
                    </a>
                  ) : (
                    <p className="font-medium text-gray-400">Non renseigné</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Acompte (30%)</span>
                  <span>{booking.pricing.depositPaid ? '✅' : '❌'} {booking.pricing.deposit.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Solde (70%)</span>
                  <span>{booking.pricing.balancePaid ? '✅' : '❌'} {booking.pricing.balance.toFixed(2)}€</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{booking.pricing.total.toFixed(2)}€</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
