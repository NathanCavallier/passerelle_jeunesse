/**
 * Page récapitulative des pôles de service
 * Route: /poles
 *
 * Affiche vue d'ensemble de tous les pôles avec CTA
 */

import PageShell from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Train,
  FlaskConical,
  Puzzle,
  Users,
  Monitor,
  Sparkles,
  Baby,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const poles = [
  {
    icon: Train,
    title: 'Accompagnement et mobilité',
    description: 'Trajets accompagnés, présence rassurante et coordination des déplacements des jeunes.',
    status: 'Disponible maintenant',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/poles/mobilite',
  },
  {
    icon: Users,
    title: 'Coordination familiale',
    description: 'Information claire aux parents, points de contact dédiés et suivi personnalisé.',
    status: 'Disponible maintenant',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    href: '/poles/accompagnement-familial',
  },
  {
    icon: Monitor,
    title: 'Suivi transparent',
    description: 'Rapports, confirmation de trajets et communication pour garantir la sérénité.',
    status: 'Disponible maintenant',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    href: '/poles/suivi-transparent',
  },
  {
    icon: Baby,
    title: 'Baby Sitting',
    description: 'Garde d’enfants à domicile, rassurante et bienveillante, pour les horaires scolaires et les vacances.',
    status: 'Nouveau pôle',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    href: '/poles/baby-sitting',
  },
  {
    icon: BookOpen,
    title: 'Soutien scolaire',
    description: 'Accompagnement pédagogique bienveillant pour aider les jeunes à reprendre confiance et à s’organiser.',
    status: 'Disponible maintenant',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    href: '/poles/soutien-scolaire',
  },
];

export const metadata = {
  title: 'Nos services - Passerelle Jeunesse',
  description: 'Découvrez les services de Passerelle Jeunesse : mobilité, coordination familiale, suivi transparent, baby sitting et soutien scolaire.',
};

export default function PolesPage() {
  return (
    <PageShell>
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-violet-50">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Nos services d'accompagnement, de garde et de soutien
            </h1>
            <p className="text-xl text-muted-foreground">
              Découvrez les services concrets que Passerelle Jeunesse propose aux familles : accompagnement, mobilité, coordination, suivi en toute confiance, garde d’enfants à domicile et soutien scolaire.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {poles.map((pole) => {
                const Icon = pole.icon;

                return (
                  <div
                    key={pole.title}
                    className="group rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`p-8 ${pole.bgColor}`}>
                      <Icon className={`h-10 w-10 ${pole.color} mb-3`} />
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {pole.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {pole.description}
                      </p>
                      <span className="inline-block text-sm font-semibold text-blue-600 mb-4">
                        {pole.status}
                      </span>
                    </div>

                    <div className="p-6 border-t">
                      <Link href={pole.href}>
                        <Button className="w-full gap-2" variant="ghost">
                          En savoir plus
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-blue-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Prêt à vous lancer ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Réservez une mission d'accompagnement ou contactez-nous pour une demande personnalisée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/bookings/new">
                <Button size="lg" className="gap-2">
                  Réserver une mission
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
