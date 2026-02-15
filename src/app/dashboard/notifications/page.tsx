/**
 * Page de configuration des notifications
 * Permet de gérer les préférences de notifications (email, SMS, push, newsletter)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getUserDocument, updateUserDocument } from '@/lib/firestore-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { UserPreferences } from '@/types/firestore';

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences>({
        language: 'fr',
        notifications: {
            email: true,
            sms: true,
            push: true,
        },
        newsletter: false,
    });

    // Charger les préférences actuelles
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user) return;

            try {
                const userData = await getUserDocument(user.uid);
                if (userData?.preferences) {
                    setPreferences(userData.preferences);
                }
            } catch (error) {
                console.error('Erreur chargement préférences:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: 'Impossible de charger vos préférences.',
                });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadPreferences();
        }
    }, [user, authLoading, toast]);

    // Sauvegarder les modifications
    const savePreferences = async (newPreferences: UserPreferences) => {
        if (!user) return;

        setSaving(true);
        try {
            await updateUserDocument(user.uid, {
                preferences: newPreferences,
            });

            toast({
                title: 'Préférences mises à jour',
                description: 'Vos préférences de notifications ont été enregistrées.',
            });
        } catch (error) {
            console.error('Erreur sauvegarde préférences:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de sauvegarder vos préférences.',
            });
            // Revenir à l'état précédent en cas d'erreur
            setPreferences(preferences);
        } finally {
            setSaving(false);
        }
    };

    // Toggle d'une préférence de notification
    const handleToggleNotification = (channel: 'email' | 'sms' | 'push') => {
        const newPreferences = {
            ...preferences,
            notifications: {
                ...preferences.notifications,
                [channel]: !preferences.notifications[channel],
            },
        };
        setPreferences(newPreferences);
        savePreferences(newPreferences);
    };

    // Toggle newsletter
    const handleToggleNewsletter = () => {
        const newPreferences = {
            ...preferences,
            newsletter: !preferences.newsletter,
        };
        setPreferences(newPreferences);
        savePreferences(newPreferences);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
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
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez vos préférences de notifications et restez informé des mises à jour importantes.
                </p>
            </div>

            {/* Info Alert */}
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Nous vous recommandons de garder au moins les notifications par email activées pour ne manquer aucune information importante concernant vos réservations.
                </AlertDescription>
            </Alert>

            {/* Notifications par canal */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Canaux de notification
                    </CardTitle>
                    <CardDescription>
                        Choisissez comment vous souhaitez recevoir les notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Email */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3 flex-1">
                            <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <Label htmlFor="email-notifications" className="cursor-pointer">
                                    Notifications par email
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des emails pour les réservations, rappels et mises à jour importantes.
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={preferences.notifications.email}
                            onCheckedChange={() => handleToggleNotification('email')}
                            disabled={saving}
                        />
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3 flex-1">
                            <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <Label htmlFor="sms-notifications" className="cursor-pointer">
                                    Notifications par SMS
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des SMS pour les alertes urgentes et rappels de dernière minute.
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    ⚠️ Service actuellement en phase de déploiement
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="sms-notifications"
                            checked={preferences.notifications.sms}
                            onCheckedChange={() => handleToggleNotification('sms')}
                            disabled={saving}
                        />
                    </div>

                    {/* Push */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3 flex-1">
                            <Smartphone className="h-5 w-5 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <Label htmlFor="push-notifications" className="cursor-pointer">
                                    Notifications push
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des notifications directement sur votre appareil.
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    ⚠️ Service actuellement en phase de déploiement
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="push-notifications"
                            checked={preferences.notifications.push}
                            onCheckedChange={() => handleToggleNotification('push')}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Newsletter et communications marketing */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Newsletter et actualités
                    </CardTitle>
                    <CardDescription>
                        Restez informé des nouveautés et des offres spéciales
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between space-x-4">
                        <div className="space-y-1 flex-1">
                            <Label htmlFor="newsletter" className="cursor-pointer">
                                S'abonner à la newsletter
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Recevez nos actualités, conseils et offres promotionnelles par email (environ 2 fois par mois).
                            </p>
                        </div>
                        <Switch
                            id="newsletter"
                            checked={preferences.newsletter}
                            onCheckedChange={handleToggleNewsletter}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Types de notifications */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Types de notifications que vous recevez</CardTitle>
                    <CardDescription>
                        Voici les notifications automatiques auxquelles vous êtes abonné(e)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                                <p className="font-medium">Confirmation de réservation</p>
                                <p className="text-sm text-muted-foreground">
                                    Dès qu'une réservation est créée et payée
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                                <p className="font-medium">Rappel avant le trajet</p>
                                <p className="text-sm text-muted-foreground">
                                    24 heures avant le départ
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                                <p className="font-medium">Changement de statut</p>
                                <p className="text-sm text-muted-foreground">
                                    Lorsque l'accompagnateur démarre ou termine la mission
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                                <p className="font-medium">Annulation ou remboursement</p>
                                <p className="text-sm text-muted-foreground">
                                    En cas de modification de votre réservation
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                                <p className="font-medium">Messages de l'accompagnateur</p>
                                <p className="text-sm text-muted-foreground">
                                    Lorsque vous recevez un nouveau message
                                </p>
                            </div>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Indicateur de sauvegarde */}
            {saving && (
                <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                </div>
            )}
        </div>
    );
}
