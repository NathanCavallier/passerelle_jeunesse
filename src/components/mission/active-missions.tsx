/**
 * Composant ActiveMissions
 * Affiche les missions actuellement en cours avec mises à jour en temps réel
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Clock,
    MapPin,
    Users,
    Car,
    Package,
    UserCheck,
    AlertCircle,
    ArrowRight,
    Radio,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import type { Booking, MissionStatus } from '@/types/firestore';
import { useState, useEffect } from 'react';

interface ActiveMissionsProps {
    bookings: Booking[];
    lastUpdate?: Date | null;
}

// Statuts considérés comme "actifs" (mission en cours)
const ACTIVE_STATUSES: MissionStatus[] = [
    'en_route_to_pickup',
    'waiting_at_pickup',
    'picked_up',
    'in_transit',
    'arriving_soon',
];

const STATUS_CONFIG: Record<MissionStatus, {
    label: string;
    icon: any;
    color: string;
}> = {
    scheduled: { label: 'Programmée', icon: Clock, color: 'bg-slate-100 text-slate-700' },
    en_route_to_pickup: { label: 'En route', icon: Car, color: 'bg-blue-100 text-blue-700' },
    waiting_at_pickup: { label: 'Sur place', icon: MapPin, color: 'bg-purple-100 text-purple-700' },
    picked_up: { label: 'Prise en charge', icon: UserCheck, color: 'bg-green-100 text-green-700' },
    in_transit: { label: 'En trajet', icon: Package, color: 'bg-blue-100 text-blue-700' },
    arriving_soon: { label: 'Arrivée proche', icon: MapPin, color: 'bg-orange-100 text-orange-700' },
    delivered: { label: 'Livré', icon: UserCheck, color: 'bg-green-100 text-green-700' },
    completed: { label: 'Terminée', icon: UserCheck, color: 'bg-green-100 text-green-700' },
    incident: { label: 'Incident', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Annulée', icon: AlertCircle, color: 'bg-gray-100 text-gray-700' },
};

function toSafeDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }
    return new Date(timestamp);
}

export function ActiveMissions({ bookings, lastUpdate }: ActiveMissionsProps) {
    const router = useRouter();
    const [activeMissions, setActiveMissions] = useState<Booking[]>([]);
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        // Filtrer les missions actives
        const active = bookings.filter(booking => {
            // Vérifier si la mission a un statut actif
            if (booking.missionTracking?.currentStatus) {
                return ACTIVE_STATUSES.includes(booking.missionTracking.currentStatus);
            }
            // Ou si le booking est assigné et pas encore terminé/annulé
            return booking.status === 'assigned' || booking.status === 'in_progress';
        });

        setActiveMissions(active);
    }, [bookings]);

    // Mettre à jour "il y a X min" toutes les 30 secondes
    useEffect(() => {
        const updateTimeAgo = () => {
            if (lastUpdate) {
                setTimeAgo(formatDistanceToNow(lastUpdate, { locale: fr, addSuffix: true }));
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 30000); // 30 secondes

        return () => clearInterval(interval);
    }, [lastUpdate]);

    if (activeMissions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Missions en cours
                            </CardTitle>
                            {/* Badge Live avec animation pulse */}
                            <Badge variant="outline" className="flex items-center gap-1.5 border-green-500 text-green-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live
                            </Badge>
                        </div>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                        <span>Suivez vos missions en temps réel</span>
                        {lastUpdate && timeAgo && (
                            <span className="text-xs text-muted-foreground">
                                Mis à jour {timeAgo}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                            <Car className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Aucune mission en cours actuellement
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Missions en cours
                            <Badge variant="secondary" className="ml-1">
                                {activeMissions.length}
                            </Badge>
                        </CardTitle>
                        {/* Badge Live avec animation pulse */}
                        <Badge variant="outline" className="flex items-center gap-1.5 border-green-500 text-green-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live
                        </Badge>
                    </div>
                </div>
                <CardDescription className="flex items-center justify-between">
                    <span>Suivez vos missions en temps réel</span>
                    {lastUpdate && timeAgo && (
                        <span className="text-xs text-muted-foreground">
                            Mis à jour {timeAgo}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {activeMissions.map((booking) => {
                    const currentStatus = booking.missionTracking?.currentStatus || ('scheduled' as MissionStatus);
                    const statusConfig = STATUS_CONFIG[currentStatus];
                    const StatusIcon = statusConfig.icon;
                    const scheduledDate = toSafeDate(booking.scheduledFor);
                    const lastUpdate = booking.missionTracking?.lastUpdateAt 
                        ? toSafeDate(booking.missionTracking.lastUpdateAt)
                        : null;

                    return (
                        <div
                            key={booking.id}
                            className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Badge className={`${statusConfig.color} border-0`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig.label}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        #{booking.id.substring(0, 8).toUpperCase()}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Trajet */}
                            <div className="space-y-2 mb-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 mt-0.5 shrink-0">
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{booking.trip.departure.city}</div>
                                    </div>
                                </div>

                                <div className="ml-2.5 border-l-2 border-dashed border-slate-300 h-4" />

                                <div className="flex items-start gap-2 text-sm">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 mt-0.5 shrink-0">
                                        <div className="h-2 w-2 rounded-full bg-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{booking.trip.arrival.city}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{booking.youngsters.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{format(scheduledDate, 'HH:mm', { locale: fr })}</span>
                                    </div>
                                </div>
                                {lastUpdate && (
                                    <span className="text-xs">
                                        Mis à jour il y a{' '}
                                        {Math.round((Date.now() - lastUpdate.getTime()) / 60000)}min
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
