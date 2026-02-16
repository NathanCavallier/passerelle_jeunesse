/**
 * Page de détail d'une mission spécifique pour l'accompagnateur
 * Affichage complet des informations et outils de mise à jour de statut
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
import { useToast } from '@/hooks/use-toast';
import { MissionTimeline } from '@/components/mission/mission-timeline';
import { PhotoCapture } from '@/components/mission/photo-capture';
import { LocationTracker } from '@/components/mission/location-tracker';
import { GPSNavigation } from '@/components/mission/gps-navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { Booking, MissionStatus } from '@/types/firestore';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Navigation,
  Phone,
  AlertCircle,
  Camera,
  MessageSquare,
  CheckCircle,
  Loader2,
  User,
  Heart,
  Shield,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AccompanistMissionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

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

    const bookingRef = doc(db, 'bookings', id);
    const unsubscribe: Unsubscribe = onSnapshot(
      bookingRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          
          // Vérifier que cette mission est bien assignée à cet accompagnateur
          if (data.accompanistId !== user.uid) {
            toast({
              variant: "destructive",
              title: "Accès non autorisé",
              description: "Cette mission ne vous est pas assignée."
            });
            router.push('/dashboard/accompanist/missions');
            return;
          }

          const bookingData = {
            id: doc.id,
            ...data,
            scheduledFor: data.scheduledFor?.toDate?.() || data.scheduledFor,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as Booking;
          
          setBooking(bookingData);
          setLoadingBooking(false);
        } else {
          toast({
            variant: "destructive",
            title: "Mission introuvable",
            description: "Cette mission n'existe pas ou a été supprimée."
          });
          router.push('/dashboard/accompanist/missions');
        }
      },
      (error) => {
        console.error('Erreur lors du chargement de la mission:', error);
        setLoadingBooking(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les détails de la mission."
        });
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user, isAccompanist, id, router, toast]);

  const updateMissionStatus = async (newStatus: MissionStatus, photoURL?: string) => {
    if (!booking || !user) return;

    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          status: newStatus,
          notes: statusNotes.trim() || undefined,
          photoURL: photoURL || undefined,
          location: undefined // TODO: Ajouter la géolocalisation
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast({
        title: "Statut mis à jour",
        description: `Mission marquée comme "${newStatus}"`
      });

      // Réinitialiser les notes
      setStatusNotes('');

    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la mission."
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusActions = (currentStatus?: string) => {
    const status = currentStatus || 'scheduled';
    
    const nextActions: Record<string, { status: MissionStatus; label: string; variant: 'default' | 'secondary' | 'destructive' }[]> = {
      scheduled: [
        { status: 'en_route_to_pickup', label: 'En route vers le point de départ', variant: 'default' }
      ],
      en_route_to_pickup: [
        { status: 'waiting_at_pickup', label: 'Arrivé au point de départ', variant: 'default' }
      ],
      waiting_at_pickup: [
        { status: 'picked_up', label: 'Jeune pris en charge', variant: 'default' }
      ],
      picked_up: [
        { status: 'in_transit', label: 'En route vers la destination', variant: 'default' }
      ],
      in_transit: [
        { status: 'arriving_soon', label: 'Arrivé à destination', variant: 'default' }
      ],
      arriving_soon: [
        { status: 'delivered', label: 'Jeune déposé', variant: 'default' }
      ],
      delivered: booking?.trip?.connections ? [
        { status: 'completed', label: 'En route pour le retour', variant: 'default' }
      ] : [
        { status: 'completed', label: 'Mission terminée', variant: 'secondary' }
      ],
    };

    return nextActions[status] || [];
  };

  if (loading || loadingBooking || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/accompanist/missions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux missions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Détail de la mission</h1>
            <p className="text-gray-600 mt-1">
              ID: {booking.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Détails de la mission */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Trajet & Navigation GPS
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Phase 5 • Mobile
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Départ</p>
                    <p className="font-semibold">{booking.trip.departure.address}</p>
                    <p className="text-sm text-gray-500">
                      {format(booking.scheduledFor instanceof Date ? booking.scheduledFor : booking.scheduledFor.toDate(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Destination</p>
                    <p className="font-semibold">{booking.trip.arrival.address}</p>
                    <Badge variant="outline">
                      {booking.trip.connections ? 'Avec correspondance' : 'Direct'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {booking.serviceType === 'local' ? 'Accompagnement local' : 'Longue distance'}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Durée estimée: N/A
                  </div>
                </div>

                {/* Navigation GPS intégrée */}
                <div className="border-t pt-4">
                  <GPSNavigation 
                    destinations={[
                      {
                        address: booking.trip.departure.address,
                        latitude: booking.trip.departure.coordinates?.lat,
                        longitude: booking.trip.departure.coordinates?.lng,
                        name: `Départ - ${booking.trip.departure.address}`,
                        type: 'pickup' as const
                      },
                      {
                        address: booking.trip.arrival.address,
                        latitude: booking.trip.arrival.coordinates?.lat,
                        longitude: booking.trip.arrival.coordinates?.lng,
                        name: `Destination - ${booking.trip.arrival.address}`,
                        type: 'destination' as const
                      }
                    ]}
                    onNavigationStart={(provider, destination) => {
                      console.log('Navigation started:', provider, destination);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Jeunes à accompagner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Jeunes à accompagner ({booking.youngsters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.youngsters.map((youngster, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {youngster.firstName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {youngster.age} ans
                        </p>
                        
                        {/* Informations importantes - simplifiées */}
                        <div className="mt-2 space-y-1">
                          {youngster.specialNotes && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Shield className="h-4 w-4" />
                              <span>Notes: {youngster.specialNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations complémentaires */}
            {booking.additionalInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Informations complémentaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {booking.additionalInfo}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Timeline de la mission */}
            <Card>
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
          </div>

          {/* Colonne droite - Actions et contrôles */}
          <div className="space-y-6">
            
            {/* Statut actuel */}
            <Card>
              <CardHeader>
                <CardTitle>Statut de la mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Badge variant="default" className="mb-2">
                    {booking.status}
                  </Badge>
                  <p className="text-sm font-medium capitalize">
                    {currentStatus.replace(/_/g, ' ')}
                  </p>
                </div>

                {/* Actions de mise à jour de statut */}
                {!isCompleted && !isCancelled && statusActions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600">Prochaines étapes :</p>
                    {statusActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        className="w-full"
                        onClick={() => updateMissionStatus(action.status)}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Zone de notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Notes (optionnel)
                  </label>
                  <Textarea
                    placeholder="Ajouter des notes sur cette étape..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                    disabled={updatingStatus}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Géolocalisation
                </CardTitle>
                <CardDescription>
                  Partage de position temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationTracker 
                  bookingId={booking.id}
                  missionStatus={booking.missionTracking?.currentStatus}
                  onLocationUpdate={(position) => {
                    console.log('Position mise à jour:', position);
                  }}
                />
              </CardContent>
            </Card>

            {/* Capture de photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos de confirmation
                </CardTitle>
                <CardDescription>
                  Ajoutez des photos pour documenter la mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoCapture
                  bookingId={booking.id}
                  photoType="other"
                  onPhotoUploaded={(photoURL) => {
                    toast({
                      title: "Photo uploadée",
                      description: "La photo a été ajoutée à la mission."
                    });
                  }}
                />
              </CardContent>
            </Card>

            {/* Informations du parent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact parent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Parent/Tuteur</p>
                  <p className="font-medium">{booking.trip.departure.contactPerson || 'Parent'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{booking.trip.departure.contactPhone || 'Non renseigné'}</p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer un message
                  <span className="ml-2 text-xs">(Bientôt)</span>
                </Button>
              </CardContent>
            </Card>

            {/* Informations de paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Acompte (30%)</span>
                  <span className="font-medium">
                    {booking.pricing.depositPaid ? '✅' : '❌'} {booking.pricing.deposit.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Solde (70%)</span>
                  <span className="font-medium">
                    {booking.pricing.balancePaid ? '✅' : '❌'} {booking.pricing.balance.toFixed(2)}€
                  </span>
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