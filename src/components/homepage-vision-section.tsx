'use client';

/**
 * Section Vision — Timeline 3 phases
 * Positionnement : après <Services /> et avant <Testimonials />
 *
 * Affiche la progression : Mobilité → Coordination → Suivi
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Train,
  FlaskConical,
  Home,
  ArrowRight,
} from 'lucide-react';

const timelineSteps = [
  {
    label: 'Aujourd\'hui',
    title: 'Accompagnement & mobilité',
    status: 'active' as const,
    icon: Train,
    color: 'blue',
    items: [
      'Trajets sécurisés accompagnés',
      'Coordination de A à Z',
      'Parents informés à chaque étape',
    ],
  },
  {
    label: 'Prochainement',
    title: 'Renforcement du suivi',
    status: 'upcoming' as const,
    icon: FlaskConical,
    color: 'amber',
    items: [
      'Protocoles de suivi plus complets',
      'Rapports de mission détaillés',
      'Meilleure visibilité pour les familles',
    ],
  },
  {
    label: 'Vision',
    title: 'Passerelle Jeunesse comme référence',
    status: 'future' as const,
    icon: Home,
    color: 'gray',
    items: [
      'Référence locale d’accompagnement',
      'Un service centré sur la confiance',
      'Un suivi adapté aux familles',
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; dot: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    dot: 'bg-gray-300',
    badge: 'bg-gray-100 text-gray-600',
  },
};

export default function HomepageVisionSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-blue-50/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Un projet en croissance
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Bien plus que du transport
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Passerelle Jeunesse se construit progressivement, de l'accompagnement
            mobilité vers une relation de confiance durable.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            const c = colorMap[step.color];
            const isActive = step.status === 'active';
            const isUpcoming = step.status === 'upcoming';

            return (
              <div
                key={step.title}
                className={`relative flex gap-6 pb-6 ${
                  index < timelineSteps.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                {/* Left indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${c.bg}`}>
                    <Icon className={`h-6 w-6 ${c.text}`} />
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-1 h-8 ${c.dot}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Items list */}
                  <ul className="space-y-1.5 mb-4">
                    {step.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-muted-foreground text-sm"
                      >
                        <span className={`${c.dot} rounded-full h-2 w-2 mt-1.5 flex-shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isActive && (
                    <Link href="/dashboard/bookings/new">
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-2"
                      >
                        Réserver une mission
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
