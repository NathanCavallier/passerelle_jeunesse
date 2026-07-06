'use client';

/**
 * Composant ProjectVision
 * Copié depuis docs/refonte/project-vision.tsx
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Train,
  FlaskConical,
  Puzzle,
  Monitor,
  Globe,
  Home,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  MapPin,
  Users,
  Sparkles,
} from 'lucide-react';

const phases = [
  {
    number: '01',
    label: 'Phase 1',
    horizon: '0 – 6 mois',
    title: 'Lancer une activité viable',
    status: 'active' as const,
    statusLabel: 'En cours ✓',
    description:
      "Générer les premiers revenus et valider le besoin. L'\"accompagnement mobilité\" est opérationnel depuis Metz et Saint-Avold.",
    items: [
      'Statut auto-entrepreneur actif',
      'Plateforme de réservation en ligne',
      'Accompagnement local & longue distance',
      'Documents administratifs (contrats, autorisations)',
      'Premiers retours familles & associations',
    ],
    goal: '5 à 10 missions pour apprendre ce que les familles demandent réellement.',
  },
  {
    number: '02',
    label: 'Phase 2',
    horizon: '6 – 18 mois',
    title: 'Construire la communauté',
    status: 'upcoming' as const,
    statusLabel: 'À venir',
    description:
      "Faire évoluer Passerelle Jeunesse vers un acteur jeunesse local reconnu en ajoutant les premiers ateliers éducatifs.",
    items: [
      'Ateliers sciences (chimie, électricité, robotique)',
      'Événements : Samedis Sciences, Vacances Découverte',
      'Escape games éducatifs ponctuels',
      'Partenariats mairies, MJC, centres sociaux',
      'Intégration du pôle Ateliers 360',
    ],
    goal: "Être identifié localement comme une structure sérieuse.",
  },
  {
    number: '03',
    label: 'Phase 3',
    horizon: '18 – 36 mois',
    title: 'Ouvrir le Centre Jeunesse',
    status: 'future' as const,
    statusLabel: 'Vision',
    description:
      "Disposer d'une communauté, de partenaires et d'ateliers testés pour ouvrir un lieu physique pérenne à Metz ou Saint-Avold.",
    items: [
      'Local dédié (80 – 150 m²)',
      'Salle sciences, espace devoirs, salle numérique',
      'Escape games permanents',
      'Accueil périscolaire & mercredis éducatifs',
      "Équipe d'animateurs et intervenants",
    ],
    goal: "Un campus jeunesse où apprendre, créer, voyager et grandir.",
  },
];

const poles = [
  {
    icon: Train,
    title: 'Mobilité',
    status: 'active' as const,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    services: [
      'Accompagnement local',
      'Voyages en train & bus',
      'Déplacements scolaires',
      'France entière',
    ],
  },
  {
    icon: Home,
    title: 'Accueil & périscolaire',
    status: 'upcoming' as const,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    services: [
      "Accueil après l'école",
      'Mercredis éducatifs',
      'Vacances scolaires',
      'Aide aux devoirs',
    ],
  },
  {
    icon: FlaskConical,
    title: 'Sciences & Découverte',
    status: 'upcoming' as const,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    services: [
      'Chimie & physique',
      'Électronique & robotique',
      'Astronomie',
      'Ateliers 360',
    ],
  },
  {
    icon: Puzzle,
    title: 'Escape Games',
    status: 'future' as const,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    services: [
      'Scénarios scientifiques',
      'Enquêtes historiques',
      'Défis logiques',
      "Formats groupe & famille",
    ],
  },
  {
    icon: Monitor,
    title: 'Numérique',
    status: 'future' as const,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    services: [
      'Programmation',
      'Création de jeux vidéo',
      'IA initiation',
      'Impression 3D',
    ],
  },
  {
    icon: Globe,
    title: 'Citoyenneté & Autonomie',
    status: 'future' as const,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    services: [
      'Préparer un voyage',
      'Gérer un budget',
      'Premiers secours',
      'Prise de parole',
    ],
  },
];

const statusConfig = {
  active: {
    badge: 'Opérationnel',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
    borderClass: 'border-blue-400',
    numClass: 'bg-blue-600 text-white',
    timelineClass: 'bg-blue-600',
  },
  upcoming: {
    badge: 'En préparation',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-amber-300',
    numClass: 'bg-amber-500 text-white',
    timelineClass: 'bg-amber-400',
  },
  future: {
    badge: 'Vision',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    borderClass: 'border-gray-200',
    numClass: 'bg-gray-200 text-gray-600',
    timelineClass: 'bg-gray-300',
  },
};

const poleStatusConfig = {
  active: { badge: 'Disponible', badgeClass: 'bg-green-100 text-green-800' },
  upcoming: { badge: 'En préparation', badgeClass: 'bg-amber-100 text-amber-800' },
  future: { badge: 'Vision', badgeClass: 'bg-gray-100 text-gray-500' },
};

export default function ProjectVision() {
  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Un projet en construction
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            De la mobilité vers un<br />
            <span className="text-blue-200">centre jeunesse multifonction</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Passerelle Jeunesse n'est pas une activité figée. C'est un projet construit
            progressivement, phase par phase, en partant de ce qui génère de la valeur
            aujourd'hui pour financer la vision de demain.
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-blue-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Metz & Saint-Avold
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> 7 à 20 ans
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> Centre jeunesse à venir
            </span>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-16 px-4 bg-white border-b">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-4">
            Notre mission
          </p>
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug">
            « Accompagner les jeunes dans leur développement personnel, leur
            autonomie, leur curiosité scientifique et leur insertion dans la
            société. »
          </blockquote>
        </div>
      </section>

      {/* TIMELINE 3 PHASES */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-3">
            Feuille de route
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            3 phases de développement
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            L'erreur serait de vouloir ouvrir directement un centre complet.
            La bonne approche : construire progressivement sur des bases solides.
          </p>
        </div>

        <div className="space-y-6">
          {phases.map((phase) => {
            const cfg = statusConfig[phase.status];
            return (
              <div
                key={phase.number}
                className={`relative rounded-2xl border-2 ${cfg.borderClass} bg-white overflow-hidden`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cfg.timelineClass}`} />

                <div className="pl-6 pr-6 py-6 md:pl-8">
                  <div className="flex flex-wrap items-start gap-4 mb-5">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${cfg.numClass}`}
                    >
                      {phase.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {phase.label}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {phase.horizon}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 ${cfg.badgeClass}`}
                        >
                          {cfg.badge}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{phase.title}</h3>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-5 leading-relaxed">{phase.description}</p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                            phase.status === 'active'
                              ? 'text-green-500'
                              : phase.status === 'upcoming'
                              ? 'text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      phase.status === 'active'
                        ? 'bg-blue-50 text-blue-800'
                        : phase.status === 'upcoming'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="font-semibold">Objectif : </span>
                    {phase.goal}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LES 6 PÔLES */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-3">
              Vision à 3–5 ans
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Les 6 pôles du futur centre
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Très peu de structures réunissent mobilité, sciences, escape games,
              numérique et autonomie dans un même projet. C'est notre singularité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {poles.map((pole) => {
              const Icon = pole.icon;
              const statusLabel = poleStatusConfig[pole.status];
              return (
                <div
                  key={pole.title}
                  className={`bg-white rounded-2xl border border-gray-200 p-6 transition-shadow hover:shadow-md ${
                    pole.status !== 'active' ? 'opacity-85' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${pole.bg}`}>
                      <Icon className={`h-5 w-5 ${pole.color}`} />
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusLabel.badgeClass}`}
                    >
                      {statusLabel.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{pole.title}</h3>
                  <ul className="space-y-1.5">
                    {pole.services.map((s) => (
                      <li key={s} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${pole.color.replace('text-', 'bg-')}`} />
                        {s}
                      </li>
                    ))}
                    {pole.title === 'Sciences & Découverte' && (
                      <p className="mt-3 text-xs text-violet-600 font-medium">
                        ↗ En lien avec{' '}
                        <a
                          href="https://www.ateliers360.fr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Ateliers 360
                        </a>
                      </p>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PUBLIC CIBLE */}
      <section className="py-16 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Public accompagné</h2>
            <p className="text-gray-500 mt-2">Des programmes adaptés à chaque tranche d'âge</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                ages: '6 – 10 ans',
                title: 'Découverte',
                desc: "Premières expériences d'autonomie, éveil scientifique, accompagnements sécurisés de proximité.",
                color: 'border-t-4 border-blue-400',
              },
              {
                ages: '11 – 14 ans',
                title: 'Exploration',
                desc: "Projets collaboratifs, ateliers sciences, déplacements plus longs, construction de l'autonomie.",
                color: 'border-t-4 border-violet-400',
              },
              {
                ages: '15 – 20 ans',
                title: 'Autonomie',
                desc: "Voyages accompagnés longue distance, ateliers citoyenneté, orientation et préparation à l'avenir.",
                color: 'border-t-4 border-amber-400',
              },
            ].map((group) => (
              <div key={group.ages} className={`bg-gray-50 rounded-xl p-6 ${group.color}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {group.ages}
                </p>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{group.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{group.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLOGAN & CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-200 text-sm uppercase tracking-widest font-semibold mb-4">
            Notre vision
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            De la curiosité à l'autonomie
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            D'abord une communauté et une réputation, ensuite un lieu.
            Rejoignez les premières familles qui font confiance à Passerelle Jeunesse
            dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8">
                Créer un compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 px-8"
              >
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
