'use client';

/**
 * Grid des pôles de service de Passerelle Jeunesse
 * Affiche uniquement les services d'accompagnement et de suivi.
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Train,
  Users,
  Monitor,
  ArrowRight,
} from 'lucide-react';

const poles = [
  {
    icon: Train,
    title: 'Mobilité sécurisée',
    description: 'Trajets accompagnés et organisation des déplacements des jeunes en toute confiance.',
    status: 'active' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/poles/mobilite',
  },
  {
    icon: Users,
    title: 'Coordination familiale',
    description: 'Suivi personnalisé des familles, points de contact clairs et informations partagées à chaque étape.',
    status: 'active' as const,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    href: '/poles/accompagnement-familial',
  },
  {
    icon: Monitor,
    title: 'Suivi transparent',
    description: 'Compte rendu, visibilité et communication pour que les parents restent sereins.',
    status: 'active' as const,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    href: '/poles/suivi-transparent',
  },
];

export default function PolesGrid() {
  return (
    <section id="services" className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Nos services d'accompagnement
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Passerelle Jeunesse se concentre sur la mobilité, la coordination familiale
            et le suivi transparent pour les jeunes et leurs proches.
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
