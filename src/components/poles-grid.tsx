'use client';

/**
 * Grid des 6 pôles de service
 * Affiche : Mobilité, Sciences & Découverte, Escape Games, Périscolaire, Numérique, À venir
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Train,
  FlaskConical,
  Puzzle,
  Users,
  Monitor,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';

const poles = [
  {
    icon: Train,
    title: 'Mobilité',
    description: 'Accompagnement local et longue distance',
    status: 'active' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/poles/mobilite',
  },
  {
    icon: FlaskConical,
    title: 'Sciences & Découverte',
    description: 'Ateliers Ateliers 360 : chimie, physique, robotique',
    status: 'coming' as const,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    href: '/poles/sciences-decouverte',
  },
  {
    icon: Puzzle,
    title: 'Escape Games',
    description: 'Enquêtes et jeux d\'évasion éducatifs',
    status: 'coming' as const,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    href: '/poles/escape-games',
  },
  {
    icon: Users,
    title: 'Accueil Périscolaire',
    description: 'Après l\'école, mercredis, vacances scolaires',
    status: 'coming' as const,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    href: '/poles/periscolaire',
  },
  {
    icon: Monitor,
    title: 'Numérique & IA',
    description: 'Programmation, jeux vidéo, cybersécurité, impression 3D',
    status: 'coming' as const,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    href: '/poles/numerique',
  },
  {
    icon: Sparkles,
    title: 'À Venir',
    description: 'D\'autres pôles explorent nos ambitions futures',
    status: 'future' as const,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    href: '/poles/coming-soon',
  },
];

export default function PolesGrid() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            6 pôles de service
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            De la mobilité aux ateliers éducatifs : un écosystème complet pour
            l'épanouissement des jeunes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poles.map((pole) => {
            const Icon = pole.icon;
            const isActive = pole.status === 'active';
            const isComing = pole.status === 'coming';

            return (
              <Link key={pole.title} href={pole.href}>
                <Card
                  className={`h-full transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    isComing || !isActive ? 'opacity-90' : ''
                  }`}
                >
                  <CardHeader>
                    <div className={`p-3 rounded-lg w-fit mb-3 ${pole.bgColor}`}>
                      <Icon className={`h-6 w-6 ${pole.color}`} />
                    </div>
                    <CardTitle className="text-xl">{pole.title}</CardTitle>
                    <CardDescription>{pole.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {isActive
                          ? '✓ Disponible'
                          : isComing
                          ? '📅 Bientôt'
                          : '🔮 À l\'étude'}
                      </span>
                      {!isActive && isComing && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {!(!isActive && isComing) && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link href="/poles">
            <Button size="lg" variant="outline">
              Voir tous les pôles en détail
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
