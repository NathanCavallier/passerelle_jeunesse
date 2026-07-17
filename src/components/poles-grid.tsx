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
  Baby,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

const poles = [
  {
    icon: Train,
    title: 'Accompagnement et mobilité',
    description: 'Trajets accompagnés, organisation des déplacements et présence rassurante pour les jeunes en toute confiance.',
    status: 'active' as const,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    href: '/poles/mobilite',
  },
  {
    icon: Users,
    title: 'Coordination familiale',
    description: 'Suivi personnalisé des familles, points de contact clairs et informations partagées à chaque étape.',
    status: 'active' as const,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    href: '/poles/accompagnement-familial',
  },
  {
    icon: Monitor,
    title: 'Suivi et transparence',
    description: 'Compte rendu, visibilité et communication pour que les parents restent sereins.',
    status: 'active' as const,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    href: '/poles/suivi-transparent',
  },
  {
    icon: Baby,
    title: 'Garde à domicile',
    description: 'Garde d’enfants à domicile rassurante et bienveillante pour les horaires scolaires et les vacances.',
    status: 'active' as const,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    href: '/poles/baby-sitting',
  },
  {
    icon: GraduationCap,
    title: 'Soutien scolaire',
    description: 'Aide aux devoirs et accompagnement pédagogique pour reprendre confiance dans le travail scolaire.',
    status: 'active' as const,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    href: '/poles/soutien-scolaire',
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
            Une offre pensée pour accompagner les jeunes au quotidien, avec des services clairs, rassurants et adaptés à chaque famille.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {poles.map((pole) => {
            const Icon = pole.icon;
            const isActive = pole.status === 'active';

            return (
              <Link key={pole.title} href={pole.href}>
                <Card
                  className={`group h-full rounded-2xl border border-border/70 bg-card p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                    !isActive ? 'opacity-90' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pole.bgColor}`}>
                      <Icon className={`h-6 w-6 ${pole.color}`} />
                    </div>
                    <CardTitle className="mt-4 text-xl font-semibold text-foreground">{pole.title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">{pole.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between border-t border-border/70 pt-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        {isActive ? '✓ Disponible' : '🔮 À l\'étude'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
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
