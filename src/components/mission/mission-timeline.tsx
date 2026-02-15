/**
 * Composant MissionTimeline
 * Affiche la timeline des statuts de la mission en temps réel
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar,
    MapPin,
    CheckCircle2,
    Clock,
    Car,
    UserCheck,
    Package,
    Home,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MissionStatus, SimplifiedMissionTracking, Timestamp } from '@/types/firestore';

interface MissionTimelineProps {
    missionTracking?: SimplifiedMissionTracking;
}

// Configuration des statuts avec icônes et couleurs
const STATUS_CONFIG: Record<MissionStatus, {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    description: string;
}> = {
    scheduled: {
        label: 'Programmée',
        icon: Calendar,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        description: 'Mission planifiée',
    },
    en_route_to_pickup: {
        label: 'En route',
        icon: Car,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'L\'accompagnateur se dirige vers le point de départ',
    },
    waiting_at_pickup: {
        label: 'Sur place',
        icon: MapPin,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'Arrivé au point de rendez-vous',
    },
    picked_up: {
        label: 'Prise en charge',
        icon: UserCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Jeune(s) pris en charge',
    },
    in_transit: {
        label: 'En trajet',
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Transport en cours',
    },
    arriving_soon: {
        label: 'Arrivée imminente',
        icon: MapPin,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        description: 'Arrivée dans quelques minutes',
    },
    delivered: {
        label: 'Livraison effectuée',
        icon: Home,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Jeune(s) remis à destination',
    },
    completed: {
        label: 'Terminée',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Mission terminée avec succès',
    },
    incident: {
        label: 'Incident',
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        description: 'Un incident est survenu',
    },
    cancelled: {
        label: 'Annulée',
        icon: XCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        description: 'Mission annulée',
    },
};

/**
 * Convertit un Timestamp Firestore en Date
 */
function toSafeDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }
    return new Date(timestamp);
}

export function MissionTimeline({ missionTracking }: MissionTimelineProps) {
    if (!missionTracking || !missionTracking.statusHistory || missionTracking.statusHistory.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Suivi de la mission
                    </CardTitle>
                    <CardDescription>
                        Le suivi en temps réel apparaîtra ici une fois la mission démarrée
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm">En attente du démarrage de la mission</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentStatus = missionTracking.currentStatus;
    const currentConfig = STATUS_CONFIG[currentStatus];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Suivi de la mission
                    </CardTitle>
                    <Badge 
                        className={`${currentConfig.bgColor} ${currentConfig.color} border-0`}
                    >
                        <currentConfig.icon className="h-3 w-3 mr-1" />
                        {currentConfig.label}
                    </Badge>
                </div>
                <CardDescription>
                    {currentConfig.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-6">
                    {/* Ligne verticale de connexion */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                    {/* Timeline des statuts */}
                    {missionTracking.statusHistory.map((update, index) => {
                        const config = STATUS_CONFIG[update.status];
                        const Icon = config.icon;
                        const updateDate = toSafeDate(update.updatedAt);
                        const isLast = index === missionTracking.statusHistory.length - 1;

                        return (
                            <div key={index} className="relative flex gap-4 items-start">
                                {/* Icône */}
                                <div 
                                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} ${config.color} shrink-0`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 pb-6">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-sm">
                                            {config.label}
                                        </h4>
                                        <time className="text-xs text-muted-foreground">
                                            {format(updateDate, 'HH:mm', { locale: fr })}
                                        </time>
                                    </div>

                                    {update.notes && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {update.notes}
                                        </p>
                                    )}

                                    {update.location && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>
                                                Position: {update.location.lat.toFixed(4)}, {update.location.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    )}

                                    {update.photoURL && (
                                        <div className="mt-2">
                                            <img
                                                src={update.photoURL}
                                                alt={`Photo ${config.label}`}
                                                className="rounded-lg w-full max-w-sm h-48 object-cover"
                                            />
                                        </div>
                                    )}

                                    {isLast && (
                                        <Badge 
                                            variant="outline" 
                                            className="mt-2 text-xs"
                                        >
                                            En cours
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Photos récapitulatives */}
                {(missionTracking.departurePhoto || missionTracking.arrivalPhoto) && (
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-medium mb-3">Photos de confirmation</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {missionTracking.departurePhoto && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Départ</p>
                                    <img
                                        src={missionTracking.departurePhoto}
                                        alt="Photo de départ"
                                        className="rounded-lg w-full h-32 object-cover"
                                    />
                                </div>
                            )}
                            {missionTracking.arrivalPhoto && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Arrivée</p>
                                    <img
                                        src={missionTracking.arrivalPhoto}
                                        alt="Photo d'arrivée"
                                        className="rounded-lg w-full h-32 object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
