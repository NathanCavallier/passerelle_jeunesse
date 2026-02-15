/**
 * Page des paramètres du compte
 * Gestion de la langue, sécurité, confidentialité et préférences
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getUserDocument, updateUserDocument } from '@/lib/firestore-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Shield, Download, Trash2, Loader2, Moon, Sun, Eye, EyeOff, Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Language } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SettingsPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<Language>('fr');
    const [saving, setSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [exportingData, setExportingData] = useState(false);

    // Charger la langue actuelle
    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return;

            try {
                const userData = await getUserDocument(user.uid);
                if (userData?.preferences?.language) {
                    setLanguage(userData.preferences.language);
                }
            } catch (error) {
                console.error('Erreur chargement paramètres:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadSettings();
        }
    }, [user, authLoading]);

    // Changer la langue
    const handleLanguageChange = async (newLanguage: Language) => {
        if (!user) return;

        setLanguage(newLanguage);
        setSaving(true);

        try {
            const userData = await getUserDocument(user.uid);
            await updateUserDocument(user.uid, {
                preferences: {
                    language: newLanguage,
                    notifications: userData?.preferences?.notifications || {
                        email: true,
                        sms: true,
                        push: true,
                    },
                    newsletter: userData?.preferences?.newsletter || false,
                },
            });

            toast({
                title: 'Langue mise à jour',
                description: 'Vos préférences de langue ont été enregistrées.',
            });
        } catch (error) {
            console.error('Erreur sauvegarde langue:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de sauvegarder vos préférences.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Exporter les données personnelles (RGPD)
    const handleExportData = async () => {
        if (!user || !userProfile) return;

        setExportingData(true);
        try {
            // Créer l'objet avec toutes les données utilisateur
            const exportData = {
                userData: {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    createdAt: user.metadata.creationTime,
                    lastLoginAt: user.metadata.lastSignInTime,
                },
                profile: userProfile,
                exportDate: new Date().toISOString(),
                version: '1.0',
            };

            // Convertir en JSON formaté
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Créer un lien de téléchargement
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `passerelle-jeunesse-donnees-${format(new Date(), 'yyyy-MM-dd')}.json`;
            link.click();

            toast({
                title: 'Export réussi',
                description: 'Vos données personnelles ont été téléchargées.',
            });
        } catch (error) {
            console.error('Erreur export données:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible d\'exporter vos données.',
            });
        } finally {
            setExportingData(false);
        }
    };

    // Supprimer le compte (placeholder)
    const handleDeleteAccount = async () => {
        // TODO: Implémenter la suppression réelle du compte
        toast({
            variant: 'destructive',
            title: 'Fonctionnalité en développement',
            description: 'La suppression de compte sera bientôt disponible. Contactez le support.',
        });
        setDeleteDialogOpen(false);
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
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez vos préférences, votre sécurité et votre confidentialité.
                </p>
            </div>

            {/* Préférences de langue */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Langue et région
                    </CardTitle>
                    <CardDescription>
                        Choisissez la langue d'affichage de l'application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="language">Langue</Label>
                            <Select
                                value={language}
                                onValueChange={(value) => handleLanguageChange(value as Language)}
                                disabled={saving}
                            >
                                <SelectTrigger id="language">
                                    <SelectValue placeholder="Sélectionnez une langue" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Les traductions en anglais et allemand seront disponibles prochainement
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Apparence (placeholder pour mode sombre futur) */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        Apparence
                    </CardTitle>
                    <CardDescription>
                        Personnalisez l'affichage de l'application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Le mode sombre et les options de personnalisation seront bientôt disponibles. Restez à l'écoute !
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Sécurité */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Sécurité
                    </CardTitle>
                    <CardDescription>
                        Protégez votre compte avec des options de sécurité avancées
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Mot de passe</Label>
                                <p className="text-sm text-muted-foreground">
                                    Modifiez votre mot de passe régulièrement
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/profile')}
                            >
                                Modifier
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Authentification à deux facteurs (2FA)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Ajoutez une couche de sécurité supplémentaire
                                </p>
                            </div>
                            <Alert className="flex-1 ml-4">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Bientôt disponible
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Dernière connexion</Label>
                        <p className="text-sm text-muted-foreground">
                            {user.metadata.lastSignInTime
                                ? format(new Date(user.metadata.lastSignInTime), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
                                : 'Non disponible'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Confidentialité et données */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Confidentialité et données
                    </CardTitle>
                    <CardDescription>
                        Gérez vos données personnelles conformément au RGPD
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Exporter mes données</Label>
                                <p className="text-sm text-muted-foreground">
                                    Téléchargez une copie de toutes vos données personnelles (RGPD)
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleExportData}
                                disabled={exportingData}
                            >
                                {exportingData ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Exporter
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Vos droits RGPD</AlertTitle>
                        <AlertDescription className="mt-2 space-y-2 text-sm">
                            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Droit d'accès à vos données</li>
                                <li>Droit de rectification</li>
                                <li>Droit à l'effacement ("droit à l'oubli")</li>
                                <li>Droit à la portabilité</li>
                                <li>Droit d'opposition</li>
                            </ul>
                            <p className="mt-2">
                                Pour exercer ces droits, utilisez les options ci-dessus ou contactez-nous.
                            </p>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Zone de danger */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Zone de danger
                    </CardTitle>
                    <CardDescription>
                        Actions irréversibles sur votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Supprimer mon compte</Label>
                                <p className="text-sm text-muted-foreground">
                                    Suppression définitive de votre compte et de toutes vos données
                                </p>
                            </div>
                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Êtes-vous absolument sûr ?</DialogTitle>
                                        <DialogDescription className="space-y-2 pt-2">
                                            <p>
                                                Cette action est <strong>irréversible</strong>. Elle supprimera définitivement :
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 ml-2">
                                                <li>Votre profil et toutes vos informations personnelles</li>
                                                <li>Toutes vos réservations et leur historique</li>
                                                <li>Les profils de vos jeunes</li>
                                                <li>Vos documents et photos</li>
                                                <li>Votre historique de paiements</li>
                                            </ul>
                                            <Alert className="mt-4">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Note :</strong> Les paiements déjà effectués ne seront pas remboursés.
                                                </AlertDescription>
                                            </Alert>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDeleteDialogOpen(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                        >
                                            Oui, supprimer définitivement
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liens utiles */}
            <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
                <p>
                    <a href="/legal/privacy" className="underline hover:text-foreground">
                        Politique de confidentialité
                    </a>
                    {' · '}
                    <a href="/legal/terms" className="underline hover:text-foreground">
                        Conditions d'utilisation
                    </a>
                </p>
                <p>
                    Questions ? Contactez-nous à{' '}
                    <a href="mailto:support@passerelle-jeunesse.fr" className="underline hover:text-foreground">
                        support@passerelle-jeunesse.fr
                    </a>
                </p>
            </div>

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
