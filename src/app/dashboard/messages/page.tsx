/**
 * Page de messagerie
 * Communication avec les accompagnateurs pour chaque mission
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Loader2, MessageCircle, Info, Rocket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MessagesPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container max-w-4xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au dashboard
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-8 w-8" />
                            Messages
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Communiquez avec vos accompagnateurs pour chaque mission
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenu principal - En développement */}
            <Card className="mb-6">
                <CardContent className="pt-10 pb-10 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="relative mb-6">
                            <MessageCircle className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
                            <Rocket className="h-10 w-10 absolute top-0 right-1/4 text-primary animate-bounce" />
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-3">
                            Messagerie en temps réel
                        </h2>
                        
                        <Badge variant="secondary" className="mb-4">
                            En cours de développement
                        </Badge>
                        
                        <p className="text-muted-foreground mb-6">
                            La messagerie instantanée avec vos accompagnateurs sera bientôt disponible ! 
                            Vous pourrez échanger en temps réel pour coordonner les détails de chaque mission.
                        </p>

                        <Alert className="text-left">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Fonctionnalités prévues</AlertTitle>
                            <AlertDescription className="mt-2">
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Chat en temps réel avec notifications</li>
                                    <li>Historique des conversations</li>
                                    <li>Partage de photos et documents</li>
                                    <li>Localisation en temps réel</li>
                                    <li>Messages automatiques aux étapes clés</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <div className="mt-8 space-y-3">
                            <p className="text-sm font-medium">En attendant, vous pouvez :</p>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    variant="default"
                                    onClick={() => router.push('/dashboard/bookings')}
                                >
                                    Voir mes réservations
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/notifications')}
                                >
                                    Configurer les notifications
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Informations complémentaires */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notifications en place</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Vous recevez déjà des notifications par email à chaque changement 
                            de statut de vos missions. Configurez vos préférences dans les paramètres.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Support disponible</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                            Pour toute question urgente, contactez-nous directement :
                        </p>
                        <a 
                            href="mailto:support@passerelle-jeunesse.fr"
                            className="text-sm text-primary hover:underline"
                        >
                            support@passerelle-jeunesse.fr
                        </a>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline de déploiement */}
            <Alert className="mt-6">
                <Rocket className="h-4 w-4" />
                <AlertTitle>Feuille de route</AlertTitle>
                <AlertDescription>
                    <div className="mt-2 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-600">Terminé</Badge>
                            <span>Phase 1-4 : Dashboard parent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Sprint 2</Badge>
                            <span>Configuration et paramètres</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">À venir</Badge>
                            <span>Sprint 3 : Messagerie en temps réel</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">À venir</Badge>
                            <span>Sprint 4 : Application accompagnateur</span>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
}
