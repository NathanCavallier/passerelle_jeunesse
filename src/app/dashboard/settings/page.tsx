/**
 * Page des paramètres du compte — version complète
 * Langue, apparence (mode sombre), sécurité, RGPD, suppression de compte
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getUserDocument, updateUserDocument, deleteUserDocument } from '@/lib/firestore-service';
import { deleteAccount, logout } from '@/lib/auth-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Globe, Shield, Download, Trash2, Loader2,
  Moon, Sun, Monitor, Info, AlertTriangle, CheckCircle2,
  Smartphone, Key, Clock, LogOut, Eye, EyeOff, Settings
} from 'lucide-react';
import type { Language } from '@/types/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SettingsPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { theme, setTheme, resolvedTheme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<Language>('fr');
    const [saving, setSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deletePending, setDeletePending] = useState(false);
    const [showDeletePassword, setShowDeletePassword] = useState(false);
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
                    ...(userData?.preferences as any),
                    language: newLanguage,
                } as any,
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

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de se déconnecter.' });
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

    // Supprimer le compte (implémentation réelle)
    const handleDeleteAccount = async () => {
        if (!user || deleteConfirmText !== 'SUPPRIMER') {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Tapez "SUPPRIMER" pour confirmer.' });
            return;
        }
        setDeletePending(true);
        try {
            await deleteUserDocument(user.uid);
            await deleteAccount(deletePassword);
            toast({ title: 'Compte supprimé', description: 'Votre compte a été définitivement supprimé.' });
            router.push('/');
        } catch (error: any) {
            const msg = error?.message?.includes('wrong-password') || error?.message?.includes('INVALID_PASSWORD')
                ? 'Mot de passe incorrect.'
                : error?.message || 'Impossible de supprimer le compte.';
            toast({ variant: 'destructive', title: 'Erreur de suppression', description: msg });
        } finally {
            setDeletePending(false);
            setDeletePassword('');
            setDeleteConfirmText('');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex flex-col min-h-dvh bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex flex-col min-h-dvh bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {/* En-tête */}
                <div className="mb-8">
                    <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Paramètres du compte</h1>
                            <p className="text-muted-foreground mt-1">Personnalisez votre expérience et gérez votre compte</p>
                        </div>
                    </div>
                </div>

                {/* Onglets */}
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">
                            <Globe className="h-4 w-4 mr-2 hidden sm:block" />Général
                        </TabsTrigger>
                        <TabsTrigger value="appearance">
                            <Sun className="h-4 w-4 mr-2 hidden sm:block" />Apparence
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <Shield className="h-4 w-4 mr-2 hidden sm:block" />Sécurité
                        </TabsTrigger>
                        <TabsTrigger value="privacy">
                            <Eye className="h-4 w-4 mr-2 hidden sm:block" />Confidentialité
                        </TabsTrigger>
                    </TabsList>

                    {/* ======================== GÉNÉRAL ======================== */}
                    <TabsContent value="general" className="space-y-6">
                        {/* Infos du compte */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations du compte</CardTitle>
                                <CardDescription>Aperçu de votre compte</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Email</Label>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Statut email</Label>
                                        {user.emailVerified ? (
                                            <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Vérifié</Badge>
                                        ) : (
                                            <Badge variant="destructive">Non vérifié</Badge>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Membre depuis</Label>
                                        <p className="font-medium">
                                            {user.metadata.creationTime
                                                ? format(new Date(user.metadata.creationTime), 'dd MMMM yyyy', { locale: fr })
                                                : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Dernière connexion</Label>
                                        <p className="font-medium">
                                            {user.metadata.lastSignInTime
                                                ? format(new Date(user.metadata.lastSignInTime), "dd MMM yyyy 'à' HH:mm", { locale: fr })
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex gap-3">
                                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/profile')}>Modifier le profil</Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-2" />Se déconnecter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Langue */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />Langue et région
                                </CardTitle>
                                <CardDescription>Choisissez la langue d'affichage de l'application</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-w-xs">
                                    <Label htmlFor="language">Langue</Label>
                                    <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)} disabled={saving}>
                                        <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                                            <SelectItem value="en" disabled>🇬🇧 English (bientôt)</SelectItem>
                                            <SelectItem value="de" disabled>🇩🇪 Deutsch (bientôt)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Les traductions EN et DE seront disponibles prochainement</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ======================== APPARENCE ======================== */}
                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" />Thème</CardTitle>
                                <CardDescription>Personnalisez l'apparence de l'interface</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'light', icon: <Sun className="h-6 w-6" />, label: 'Clair' },
                                        { value: 'dark', icon: <Moon className="h-6 w-6" />, label: 'Sombre' },
                                        { value: 'system', icon: <Monitor className="h-6 w-6" />, label: 'Système' },
                                    ].map(({ value, icon, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => setTheme(value)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                                                theme === value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                                            }`}
                                        >
                                            <span className={theme === value ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
                                            <span className="text-sm font-medium">{label}</span>
                                            {theme === value && <Badge className="text-xs">Actif</Badge>}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Thème actuel : <span className="font-medium text-foreground">{resolvedTheme === 'dark' ? '🌙 Mode sombre' : '☀️ Mode clair'}</span>
                                    {theme === 'system' && ' (synchronisé avec le système)'}
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ======================== SÉCURITÉ ======================== */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Mot de passe</CardTitle>
                                <CardDescription>Gardez votre compte sécurisé</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Modifier le mot de passe</p>
                                    <p className="text-sm text-muted-foreground">Utilisez un mot de passe fort avec chiffres et symboles</p>
                                </div>
                                <Button variant="outline" onClick={() => router.push('/dashboard/profile')}>Modifier</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Authentification à deux facteurs (2FA)</CardTitle>
                                <CardDescription>Couche de sécurité supplémentaire via SMS ou TOTP</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">Statut : non configuré</p>
                                    <Badge variant="secondary">Bientôt disponible</Badge>
                                </div>
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>L'authentification à deux facteurs via SMS et TOTP (Google Authenticator, Authy) sera disponible prochainement.</AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Sessions et appareils</CardTitle>
                                <CardDescription>Connexions récentes à votre compte</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">Session actuelle</p>
                                            <Badge className="text-xs bg-green-500">Actif</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Connexion le {user.metadata.lastSignInTime
                                                ? format(new Date(user.metadata.lastSignInTime), "dd MMM yyyy 'à' HH:mm", { locale: fr })
                                                : '—'}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-1" />Déconnecter
                                    </Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">Connexion non autorisée ?</p>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/reset-password')}>Changer le mot de passe</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ======================== CONFIDENTIALITÉ ======================== */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Exporter mes données</CardTitle>
                                <CardDescription>Droit à la portabilité — RGPD art. 20</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between gap-4">
                                <p className="text-sm text-muted-foreground">Inclut : profil, jeunes, réservations, préférences. Format : JSON.</p>
                                <Button variant="outline" onClick={handleExportData} disabled={exportingData}>
                                    {exportingData ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Export...</> : <><Download className="mr-2 h-4 w-4" />Exporter</>}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Vos droits RGPD</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Règlement (UE) 2016/679</AlertTitle>
                                    <AlertDescription className="mt-2 text-sm space-y-1">
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                            <li><strong>Accès</strong> — export ci-dessus</li>
                                            <li><strong>Rectification</strong> — modifiez votre profil</li>
                                            <li><strong>Effacement</strong> — suppression ci-dessous</li>
                                            <li><strong>Portabilité</strong> — export JSON</li>
                                            <li><strong>Opposition</strong> — désactivez les notifications</li>
                                        </ul>
                                        <p className="mt-2">Contact : <a href="mailto:rgpd@passerelle-jeunesse.fr" className="underline hover:text-foreground">rgpd@passerelle-jeunesse.fr</a></p>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Zone de danger */}
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />Zone de danger
                                </CardTitle>
                                <CardDescription>Actions irréversibles sur votre compte</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium">Supprimer mon compte</p>
                                        <p className="text-sm text-muted-foreground">Supprime définitivement votre compte et toutes vos données</p>
                                    </div>
                                    <Dialog open={deleteDialogOpen} onOpenChange={(o) => {
                                        setDeleteDialogOpen(o);
                                        if (!o) { setDeletePassword(''); setDeleteConfirmText(''); }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" className="shrink-0">
                                                <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="text-destructive flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5" />Supprimer définitivement
                                                </DialogTitle>
                                                <DialogDescription className="space-y-3 pt-2">
                                                    <p>Cette action est <strong>irréversible</strong>. Elle supprimera :</p>
                                                    <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                                                        <li>Profil et données personnelles</li>
                                                        <li>Toutes les réservations</li>
                                                        <li>Profils des jeunes et documents</li>
                                                        <li>Historique de paiements</li>
                                                    </ul>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="delete-password">Votre mot de passe actuel</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="delete-password"
                                                            type={showDeletePassword ? 'text' : 'password'}
                                                            value={deletePassword}
                                                            onChange={(e) => setDeletePassword(e.target.value)}
                                                            placeholder="Entrez votre mot de passe"
                                                            className="pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                                                        >
                                                            {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="delete-confirm">
                                                        Tapez <strong className="text-destructive">SUPPRIMER</strong> pour confirmer
                                                    </Label>
                                                    <Input
                                                        id="delete-confirm"
                                                        value={deleteConfirmText}
                                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                        placeholder="SUPPRIMER"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDeleteAccount}
                                                    disabled={deletePending || !deletePassword || deleteConfirmText !== 'SUPPRIMER'}
                                                >
                                                    {deletePending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Suppression...</> : <><Trash2 className="mr-2 h-4 w-4" />Supprimer définitivement</>}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Navigation rapide */}
                <div className="mt-10 p-5 bg-accent/40 rounded-lg">
                    <p className="text-sm font-medium mb-3 text-muted-foreground">Actions rapides</p>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
                        <Link href="/dashboard/notifications"><Button variant="outline" size="sm">Notifications</Button></Link>
                        <Link href="/dashboard/profile"><Button variant="outline" size="sm">Mon profil</Button></Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    <Link href="/cgv" className="underline hover:text-foreground">CGV</Link>
                    {' · '}
                    <Link href="/mentions-legales" className="underline hover:text-foreground">Mentions légales</Link>
                    {' · '}
                    <a href="mailto:support@passerelle-jeunesse.fr" className="underline hover:text-foreground">support@passerelle-jeunesse.fr</a>
                </p>

                {saving && (
                    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />Enregistrement...
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
