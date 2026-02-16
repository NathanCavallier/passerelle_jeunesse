/**
 * Framework de tests et validation PWA pour accompagnateurs
 * Tests automatisés des fonctionnalités critiques mobile
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePWA } from '@/hooks/use-pwa';
import { useLocation } from '@/hooks/use-location';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Play,
  RefreshCw,
  Smartphone,
  Wifi,
  MapPin,
  Bell,
  Camera,
  Download
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
  critical: boolean;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  progress: number;
}

export function PWAValidationSuite() {
  const { isInstallable, isInstalled, isOnline, isUpdateAvailable } = usePWA();
  const { isSupported: gpsSupported, permissionStatus } = useLocation();
  
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Tests PWA Core
  const runPWATests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: Service Worker
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/dashboard/accompanist');
        results.push({
          name: 'Service Worker',
          status: registration ? 'passed' : 'failed',
          message: registration ? 'Service Worker enregistré et actif' : 'Service Worker non enregistré',
          critical: true
        });
      } else {
        results.push({
          name: 'Service Worker',
          status: 'failed',
          message: 'Service Worker non supporté',
          critical: true
        });
      }
    } catch (error) {
      results.push({
        name: 'Service Worker',
        status: 'failed',
        message: `Erreur: ${error}`,
        critical: true
      });
    }

    // Test 2: Manifest PWA  
    try {
      const response = await fetch('/manifest-accompanist.json');
      const manifest = await response.json();
      
      results.push({
        name: 'Web App Manifest',
        status: manifest.name ? 'passed' : 'failed',
        message: manifest.name ? `Manifest valide: ${manifest.name}` : 'Manifest invalide',
        details: `Icons: ${manifest.icons?.length || 0}, Start URL: ${manifest.start_url}`,
        critical: true
      });
    } catch (error) {
      results.push({
        name: 'Web App Manifest',
        status: 'failed',
        message: 'Manifest non accessible',
        critical: true
      });
    }

    // Test 3: Installation PWA
    results.push({
      name: 'Installation PWA',
      status: isInstalled ? 'passed' : (isInstallable ? 'warning' : 'failed'),
      message: isInstalled 
        ? 'Application installée' 
        : (isInstallable ? 'Installation disponible' : 'Installation non disponible'),
      critical: false
    });

    // Test 4: Cache Offline
    try {
      const cacheNames = await caches.keys();
      const hasPWACache = cacheNames.some(name => name.includes('accompanist'));
      
      results.push({
        name: 'Cache Offline',
        status: hasPWACache ? 'passed' : 'warning',
        message: hasPWACache ? `${cacheNames.length} caches actifs` : 'Aucun cache PWA trouvé',
        details: `Caches: ${cacheNames.join(', ')}`,
        critical: false
      });
    } catch (error) {
      results.push({
        name: 'Cache Offline',
        status: 'failed',
        message: 'Impossible de vérifier le cache',
        critical: false
      });
    }

    return results;
  };

  // Tests Géolocalisation
  const runLocationTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: Support géolocalisation
    results.push({
      name: 'Support Géolocalisation',
      status: gpsSupported ? 'passed' : 'failed',
      message: gpsSupported ? 'API Geolocation supportée' : 'Géolocalisation non supportée',
      critical: true
    });

    // Test 2: Permissions
    results.push({
      name: 'Permissions GPS',
      status: permissionStatus === 'granted' ? 'passed' : (permissionStatus === 'denied' ? 'failed' : 'warning'),
      message: `Permission: ${permissionStatus}`,
      details: permissionStatus === 'denied' ? 'Autoriser l\'accès dans les paramètres' : '',
      critical: true
    });

    // Test 3: Position actuelle (si permissions OK)
    if (gpsSupported && permissionStatus === 'granted') {
      try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        results.push({
          name: 'Obtention Position',
          status: 'passed',
          message: 'Position obtenue avec succès',
          critical: false
        });
      } catch (error) {
        results.push({
          name: 'Obtention Position',
          status: 'failed',
          message: 'Échec obtention position',
          details: `Code erreur: ${(error as GeolocationPositionError).code}`,
          critical: false
        });
      }
    }

    return results;
  };

  // Tests Notifications
  const runNotificationTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: Support notifications
    const notificationSupported = 'Notification' in window;
    results.push({
      name: 'Support Push Notifications',
      status: notificationSupported ? 'passed' : 'failed',
      message: notificationSupported ? 'API Notifications supportée' : 'Notifications non supportées',
      critical: false
    });

    // Test 2: Permissions notifications
    if (notificationSupported) {
      results.push({
        name: 'Permission Notifications',
        status: Notification.permission === 'granted' ? 'passed' : (Notification.permission === 'denied' ? 'failed' : 'warning'),
        message: `Permission: ${Notification.permission}`,
        critical: false
      });

      // Test 3: Test notification
      if (Notification.permission === 'granted') {
        try {
          new Notification('Test PWA', {
            body: 'Notification de test réussie',
            icon: '/images/icons/icon-96x96.png',
            tag: 'test-notification',
            silent: true
          });

          results.push({
            name: 'Test Notification',
            status: 'passed',
            message: 'Notification test envoyée',
            critical: false
          });
        } catch (error) {
          results.push({
            name: 'Test Notification',
            status: 'failed',
            message: 'Échec envoi notification test',
            critical: false
          });
        }
      }
    }

    return results;
  };

  // Tests Performance
  const runPerformanceTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: Connection Speed
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      results.push({
        name: 'Vitesse Connexion',
        status: ['4g', '3g'].includes(effectiveType) ? 'passed' : 'warning',
        message: `Type connexion: ${effectiveType}`,
        details: `Downlink: ${connection.downlink} Mbps`,
        critical: false
      });
    }

    // Test 2: Memory Usage
    const memory = (performance as any).memory;
    if (memory) {
      const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      results.push({
        name: 'Utilisation Mémoire',
        status: memoryUsage < 80 ? 'passed' : 'warning',
        message: `${memoryUsage.toFixed(1)}% utilisée`,
        details: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB / ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB`,
        critical: false
      });
    }

    // Test 3: Storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usagePercent = estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0;

        results.push({
          name: 'Espace Stockage',
          status: usagePercent < 80 ? 'passed' : 'warning',
          message: `${usagePercent.toFixed(1)}% utilisé`,
          details: `${((estimate.usage || 0) / 1024 / 1024).toFixed(1)} MB / ${((estimate.quota || 0) / 1024 / 1024).toFixed(1)} MB`,
          critical: false
        });
      } catch (error) {
        results.push({
          name: 'Espace Stockage', 
          status: 'warning',
          message: 'Impossible de vérifier le stockage',
          critical: false
        });
      }
    }

    return results;
  };

  // Exécuter tous les tests
  const runAllTests = async () => {
    setIsRunning(true);
    setOverallProgress(0);

    const testSuitesConfig = [
      { name: 'PWA Core', runner: runPWATests },
      { name: 'Géolocalisation', runner: runLocationTests },
      { name: 'Notifications', runner: runNotificationTests },
      { name: 'Performance', runner: runPerformanceTests }
    ];

    const results: TestSuite[] = [];

    for (let i = 0; i < testSuitesConfig.length; i++) {
      const suite = testSuitesConfig[i];
      setCurrentTest(suite.name);

      const tests = await suite.runner();
      const passedTests = tests.filter(t => t.status === 'passed').length;
      const progress = (passedTests / tests.length) * 100;

      results.push({
        name: suite.name,
        tests,
        progress
      });

      setTestSuites([...results]);
      setOverallProgress(((i + 1) / testSuitesConfig.length) * 100);

      // Délai entre les suites
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentTest(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Statistiques globales
  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = testSuites.reduce((acc, suite) => acc + suite.tests.filter(t => t.status === 'passed').length, 0);
  const failedTests = testSuites.reduce((acc, suite) => acc + suite.tests.filter(t => t.status === 'failed').length, 0);
  const criticalIssues = testSuites.reduce((acc, suite) => acc + suite.tests.filter(t => t.status === 'failed' && t.critical).length, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Validation PWA Mobile
              </CardTitle>
              <CardDescription>
                Tests automatisés des fonctionnalités PWA critiques
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                size="sm"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
              </Button>
              
              {testSuites.length > 0 && (
                <Button
                  onClick={() => setTestSuites([])}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {(isRunning || testSuites.length > 0) && (
          <CardContent>
            <div className="space-y-4">
              {/* Progrès global */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progrès global</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                {currentTest && (
                  <p className="text-xs text-gray-600">
                    Tests en cours: {currentTest}
                  </p>
                )}
              </div>

              {/* Statistiques */}
              {testSuites.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                    <div className="text-xs text-gray-600">Réussis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                    <div className="text-xs text-gray-600">Échecs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{criticalIssues}</div>
                    <div className="text-xs text-gray-600">Critiques</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalTests}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Résultats par suite */}
      {testSuites.map((suite, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{suite.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Progress value={suite.progress} className="w-24 h-2" />
                <span className="text-sm text-gray-600">{Math.round(suite.progress)}%</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {suite.tests.map((test, testIndex) => (
              <div
                key={testIndex}
                className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium text-sm">{test.name}</div>
                      <div className="text-xs opacity-75">{test.message}</div>
                      {test.details && (
                        <div className="text-xs opacity-60 mt-1">{test.details}</div>
                      )}
                    </div>
                  </div>
                  
                  {test.critical && (
                    <Badge variant="destructive" className="text-xs">
                      Critique
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Alertes critiques */}
      {criticalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalIssues} problème(s) critique(s) détecté(s)</strong>
            <br />
            Ces problèmes peuvent empêcher le bon fonctionnement de l'application PWA.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}