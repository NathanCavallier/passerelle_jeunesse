/**
 * Page de test PWA pour accompagnateurs
 * Tests de validation et fonctionnalités avancées
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PWAInstallBanner } from '@/components/pwa/install-banner';
import { PWAValidationSuite } from '@/components/testing/pwa-validation';
import { PWASummary } from '@/components/testing/pwa-summary';
import { TestModeBanner } from '@/components/testing/test-mode-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  TestTube2,
  Smartphone,
  MapPin,
  Bell,
  Wifi,
  Battery,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function AccompanistTestPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAccompanist } = useAuth();

  const [testResults, setTestResults] = useState<any[]>([]);

  // Redirection si pas accompagnateur
  if (!isAuthenticated || !isAccompanist) {
    router.push('/dashboard');
    return null;
  }

  // Tests manuels recommandés
  const manualTests = [
    {
      category: 'Installation PWA',
      tests: [
        {
          name: 'Installation sur écran d\'accueil',
          description: 'Vérifier que l\'app peut être ajoutée à l\'écran d\'accueil',
          steps: [
            'Cliquer sur "Ajouter à l\'écran d\'accueil" dans le menu du navigateur',
            'Vérifier que l\'icône apparaît sur l\'écran d\'accueil',
            'Ouvrir l\'app depuis l\'écran d\'accueil',
            'Vérifier le mode plein écran sans barre d\'adresse'
          ],
          critical: true
        },
        {
          name: 'Shortcuts rapides',
          description: 'Tester les raccourcis vers missions et profil',
          steps: [
            'Appui long sur l\'icône de l\'app',
            'Vérifier les raccourcis "Mes missions" et "Mon profil"',
            'Tester navigation directe via raccourcis'
          ],
          critical: false
        }
      ]
    },
    {
      category: 'Fonctionnement Offline',
      tests: [
        {
          name: 'Mode avion',
          description: 'Tester l\'app en mode hors ligne complet',
          steps: [
            'Activer le mode avion',
            'Naviguer dans l\'app (dashboard, missions, profil)',
            'Vérifier les messages offline appropriés',
            'Désactiver le mode avion et vérifier la synchronisation'
          ],
          critical: true
        },
        {
          name: 'Connexion instable',
          description: 'Tester avec connexion intermittente',
          steps: [
            'Activer/désactiver WiFi et données plusieurs fois',
            'Essayer des actions (mise à jour statut, photos)',
            'Vérifier la queue de synchronization',
            'Valider que tout se synchronise au retour en ligne'
          ],
          critical: true
        }
      ]
    },
    {
      category: 'Géolocalisation',
      tests: [
        {
          name: 'Précision GPS',
          description: 'Vérifier la qualité du tracking GPS',
          steps: [
            'Aller dans une mission en cours',
            'Activer le partage de position',
            'Se déplacer et vérifier la mise à jour temps réel',
            'Vérifier la précision (< 10m idéalement)'
          ],
          critical: true
        },
        {
          name: 'GPS en arrière-plan',
          description: 'Tester le tracking quand l\'app est en arrière-plan',
          steps: [
            'Démarrer le tracking GPS',
            'Passer l\'app en arrière-plan',
            'Utiliser d\'autres apps pendant 5 minutes',
            'Revenir et vérifier continuité du tracking'
          ],
          critical: false
        }
      ]
    },
    {
      category: 'Navigation GPS',
      tests: [
        {
          name: 'Intégration Google Maps',
          description: 'Tester l\'ouverture de Google Maps',
          steps: [
            'Aller dans le détail d\'une mission',
            'Cliquer sur navigation GPS',
            'Vérifier l\'ouverture de Google Maps avec bonne destination',
            'Tester retour à l\'app Passerelle Jeunesse'
          ],
          critical: false
        },
        {
          name: 'Navigation multi-étapes',
          description: 'Tester itinéraire avec plusieurs arrêts',
          steps: [
            'Mission avec départ, destination et retour',
            'Lancer navigation complète',
            'Vérifier que tous les points sont dans l\'itinéraire'
          ],
          critical: false
        }
      ]
    },
    {
      category: 'Notifications',
      tests: [
        {
          name: 'Push notifications',
          description: 'Tester réception et actions des notifications',
          steps: [
            'Demander permission notifications',
            'Simuler nouvelle mission (si possible)',
            'Vérifier réception notification',
            'Tester actions "Voir" et "Fermer"'
          ],
          critical: false
        }
      ]
    },
    {
      category: 'Performance',
      tests: [
        {
          name: 'Vitesse de chargement',
          description: 'Mesurer temps de chargement de l\'app',
          steps: [
            'Fermer complètement l\'app',
            'Rouvrir depuis l\'écran d\'accueil',
            'Chronométrer jusqu\'à affichage dashboard',
            'Objectif : < 3 secondes'
          ],
          critical: false
        },
        {
          name: 'Fluidité navigation',
          description: 'Tester responsive des interactions',
          steps: [
            'Naviguer rapidement entre pages',
            'Faire défiler listes de missions',
            'Tester tous les boutons et liens',
            'Vérifier absence lag ou freeze'
          ],
          critical: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PWAInstallBanner />
      <TestModeBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/accompanist">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TestTube2 className="h-8 w-8" />
              Tests PWA Mobile
            </h1>
            <p className="text-gray-600 mt-1">
              Validation des fonctionnalités PWA et tests mobiles
            </p>
          </div>
        </div>

        {/* Statut utilisateur */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informations de test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Utilisateur:</span>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Rôle:</span>
                <Badge variant="default">Accompagnateur</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">Navigateur:</span>
                <p className="font-medium text-xs">{navigator.userAgent.split(' ')[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Résumé PWA
            </TabsTrigger>
            <TabsTrigger value="automatic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tests Auto
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Tests Manuels
            </TabsTrigger>
          </TabsList>

          {/* Résumé PWA */}
          <TabsContent value="summary">
            <PWASummary />
          </TabsContent>

          {/* Tests automatiques */}
          <TabsContent value="automatic">
            <PWAValidationSuite />
          </TabsContent>

          {/* Tests manuels */}
          <TabsContent value="manual">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guide de tests manuels</CardTitle>
                  <CardDescription>
                    Suivez ces tests étape par étape pour valider toutes les fonctionnalités PWA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-2">
                          Pour une validation complète, testez sur :
                        </p>
                        <ul className="text-blue-700 space-y-1">
                          <li>• 📱 iPhone avec Safari</li>
                          <li>• 🤖 Android avec Chrome</li>
                          <li>• 🌐 Différentes conditions réseau (WiFi, 4G, 3G)</li>
                          <li>• 🔋 Différents niveaux de batterie</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {manualTests.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {category.tests.map((test, testIndex) => (
                      <div
                        key={testIndex}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {test.name}
                              {test.critical && (
                                <Badge variant="destructive" className="text-xs">
                                  Critique
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {test.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Étapes :</p>
                          <ol className="text-sm text-gray-600 space-y-1">
                            {test.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex gap-2">
                                <span className="font-mono text-xs bg-gray-100 rounded px-1 min-w-[20px] text-center">
                                  {stepIndex + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Rapport de validation */}
              <Card>
                <CardHeader>
                  <CardTitle>Rapport de validation</CardTitle>
                  <CardDescription>
                    Une fois tous les tests effectués, documentez les résultats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-green-700">Tests réussis</div>
                      </div>
                      
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">0</div>
                        <div className="text-sm text-red-700">Tests échoués</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <TestTube2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{manualTests.reduce((acc, cat) => acc + cat.tests.length, 0)}</div>
                        <div className="text-sm text-blue-700">Tests totaux</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Complétez les tests manuels pour valider la PWA accompagnateur
                      </p>
                    </div>
                  </div>
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