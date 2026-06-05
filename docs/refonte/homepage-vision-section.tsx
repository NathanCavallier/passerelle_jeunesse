'use client';

/**
 * Section Vision — à intégrer sur la page d'accueil (src/app/page.tsx)
 * Positionnement : après <Services /> et avant <Testimonials />
 *
 * À créer dans : src/components/homepage-vision-section.tsx
 *
 * Usage dans page.tsx :
 *   import HomepageVisionSection from '@/components/homepage-vision-section';
 *   // puis dans le JSX après <Services /> :
 *   <HomepageVisionSection />
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Train,
  FlaskConical,
  Puzzle,
  Monitor,
  Globe,
  Home,
  ArrowRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';

const timelineSteps = [
  {
    label: 'Aujourd\'hui',
    title: 'Accompagnement & Mobilité',
    status: 'active',
    icon: Train,
    color: 'blue',
    items: ['Accompagnement local & longue distance', 'Metz et Saint-Avold', 'Toute la France'],
  },
  {
    label: 'Prochainement',
    title: 'Ateliers éducatifs & Événements',
    status: 'upcoming',
    icon: FlaskConical,
    color: 'amber',
    items: ['Ateliers sciences (Ateliers 360)', 'Samedis découverte', 'Escape games éducatifs'],
  },
  {
    label: 'Vision',
    title: 'Centre Jeunesse Multifonction',
    status: 'future',
    icon: Home,
    color: 'gray',
    items: ['Lieu physique dédié', 'Périscolaire & numérique', 'Campus jeunesse Lorraine'],
  },
];

const comingPoles = [
  { icon: FlaskConical, label: 'Sciences & Ateliers 360', color: 'violet' },
  { icon: Puzzle, label: 'Escape Games', color: 'amber' },
  { icon: Monitor, label: 'Numérique & IA', color: 'cyan' },
  { icon: Globe, label: 'Citoyenneté & Autonomie', color: 'rose' },
  { icon: Home, label: 'Accueil périscolaire', color: 'emerald' },
];

const colorMap: Record<string, { bg: string; text: string; dot: string; bar: string }> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-600',
    bar: 'bg-blue-500',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
    bar: 'bg-amber-400',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-400',
    dot: 'bg-gray-300',
    bar: 'bg-gray-300',
  },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', dot: '', bar: '' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: '', bar: '' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', dot: '', bar: '' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: '', bar: '' },
};

export default function HomepageVisionSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-blue-50/40">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Un projet en croissance
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bien plus que du transport
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Passerelle Jeunesse se construit progressivement, de l'accompagnement
            mobilité vers un véritable centre jeunesse multifonction.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Ligne verticale centrale (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-amber-300 to-gray-200 -translate-x-1/2" />

          <div className="space-y-8">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              const c = colorMap[step.color];
              const isActive = step.status === 'active';
              const isUpcoming = step.status === 'upcoming';

              return (
                <div
                  key={step.title}
                  className={`relative flex flex-col md:flex-row items-start gap-6 ${
                    i % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot central (desktop) */}
                  <div className="hidden md:flex absolute left-1/2 top-6 -translate-x-1/2 z-10">
                    <div
                      className={`w-5 h-5 rounded-full border-4 border-background ${c.dot}`}
                    />
                  </div>

                  {/* Card */}
                  <div className={`w-full md:w-5/12 ${i % 2 === 1 ? 'md:ml-auto' : ''}`}>
                    <div
                      className={`rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md ${
                        isActive
                          ? 'border-blue-200'
                          : isUpcoming
                          ? 'border-amber-200'
                          : 'border-gray-100 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl ${c.bg}`}>
                          <Icon className={`h-5 w-5 ${c.text}`} />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isActive
                                ? 'text-blue-600'
                                : isUpcoming
                                ? 'text-amber-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
                        </div>
                        {isActive && (
                          <span className="ml-auto flex-shrink-0 text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                            En ligne
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {step.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                            {isActive ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle
                                className={`h-3.5 w-3.5 flex-shrink-0 ${
                                  isUpcoming ? 'text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            )}
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block w-5/12" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Pôles à venir */}
        <div className="mt-16 rounded-2xl bg-white border border-gray-200 p-8">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Prochains pôles en développement
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {comingPoles.map((pole) => {
              const Icon = pole.icon;
              const c = colorMap[pole.color];
              return (
                <div
                  key={pole.label}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 ${c.bg} text-sm font-medium ${c.text}`}
                >
                  <Icon className="h-4 w-4" />
                  {pole.label}
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Ces activités seront introduites progressivement selon les partenariats et besoins locaux.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/le-projet">
            <Button variant="outline" size="lg" className="gap-2">
              Découvrir notre vision complète
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
