/**
 * Page de paramètres pour l'accompagnateur
 * Configuration du compte et préférences
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth-service';
import { 
  ArrowLeft,
  Settings,
  Bell,
  Shield,
  Globe,
  Moon,
  Smartphone,
  LogOut,
  Trash2,
  AlertTriangle,
  Save
} from 'lucide-react';

export default function AccompanistSettingsPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, isAccompanist } = useAuth();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

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

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès."
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion."
      });
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implémenter la sauvegarde des paramètres
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder vos paramètres."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !isAuthenticated || !isAccompanist) {
    return null;
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600 mt-1">
                Configuration de votre compte et préférences
              </p>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>Sauvegarde...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Langue
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Compte
            </TabsTrigger>
          </TabsList>

          {/* Onglet Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Choisissez comment recevoir vos notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notifications par email */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Notifications par email</Label>
                    <p className="text-sm text-gray-600">
                      Recevoir des emails pour les nouvelles missions et messages
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <Separator />

                {/* Notifications push */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Notifications push</Label>
                    <p className="text-sm text-gray-600">
                      Recevoir des notifications push sur vos appareils
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <Separator />

                {/* Notifications SMS */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Notifications SMS</Label>
                    <p className="text-sm text-gray-600">
                      Recevoir des SMS pour les missions urgentes
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>

                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertTitle>Astuce</AlertTitle>
                  <AlertDescription>
                    Les notifications push nécessitent l'autorisation de votre navigateur. 
                    Activez-les pour ne manquer aucune nouvelle mission.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Confidentialité */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visibilité du profil</CardTitle>
                  <CardDescription>
                    Contrôlez qui peut voir vos informations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Profil public</Label>
                      <p className="text-sm text-gray-600">
                        Permettre aux familles de voir votre profil dans les recherches
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Statistiques visibles</Label>
                      <p className="text-sm text-gray-600">
                        Afficher votre note et nombre de missions sur votre profil
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Données personnelles</CardTitle>
                  <CardDescription>
                    Gestion de vos données selon le RGPD
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full" disabled>
                    📥 Exporter mes données
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Téléchargez toutes vos données personnelles au format JSON
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Langue */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>Langue et région</CardTitle>
                <CardDescription>
                  Configurez votre langue préférée
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Langue de l'interface</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="lang-fr" name="language" defaultChecked />
                      <Label htmlFor="lang-fr">🇫🇷 Français</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="lang-en" name="language" disabled />
                      <Label htmlFor="lang-en" className="text-gray-400">🇬🇧 English (Bientôt)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="lang-de" name="language" disabled />
                      <Label htmlFor="lang-de" className="text-gray-400">🇩🇪 Deutsch (Bientôt)</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Mode sombre</Label>
                    <p className="text-sm text-gray-600">
                      Interface avec thème sombre pour réduire la fatigue oculaire
                    </p>
                  </div>
                  <Switch 
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Compte */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                  <CardDescription>
                    Vos données de connexion et sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Adresse email</Label>
                    <Input 
                      value={userProfile?.email || ''} 
                      disabled 
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'email ne peut pas être modifié pour des raisons de sécurité
                    </p>
                  </div>

                  <div>
                    <Label>Dernière connexion</Label>
                    <Input 
                      value={userProfile?.lastLoginAt?.toLocaleString() || 'Jamais'} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" disabled>
                      🔐 Changer le mot de passe
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      📱 Authentification à deux facteurs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions du compte */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions du compte</CardTitle>
                  <CardDescription>
                    Déconnexion et suppression de compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>

                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Zone de danger</AlertTitle>
                    <AlertDescription className="text-red-700">
                      <div className="space-y-3 mt-2">
                        <p>
                          La suppression de votre compte est irréversible. 
                          Toutes vos données seront définitivement supprimées.
                        </p>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full" 
                          disabled
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer mon compte
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}