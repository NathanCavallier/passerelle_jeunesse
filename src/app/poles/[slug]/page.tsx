import type { Metadata } from 'next';
import PageShell from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

const colorClasses = {
  blue: {
    bgFrom: 'from-blue-50',
    bgTo: 'to-blue-100',
    icon: 'text-blue-600',
    status: 'text-blue-600',
  },
  violet: {
    bgFrom: 'from-violet-50',
    bgTo: 'to-violet-100',
    icon: 'text-violet-600',
    status: 'text-violet-600',
  },
  amber: {
    bgFrom: 'from-amber-50',
    bgTo: 'to-amber-100',
    icon: 'text-amber-600',
    status: 'text-amber-600',
  },
  emerald: {
    bgFrom: 'from-emerald-50',
    bgTo: 'to-emerald-100',
    icon: 'text-emerald-600',
    status: 'text-emerald-600',
  },
  cyan: {
    bgFrom: 'from-cyan-50',
    bgTo: 'to-cyan-100',
    icon: 'text-cyan-600',
    status: 'text-cyan-600',
  },
} as const;

const polesData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  status: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  color: keyof typeof colorClasses;
}> = {
  mobilite: {
    title: 'Mobilité sécurisée',
    subtitle: 'Accompagnement des trajets des jeunes',
    description: `Passerelle Jeunesse propose un accompagnement personnalisé pour les déplacements des jeunes.
    Que ce soit pour un trajet local à Metz/Saint-Avold ou un transfert plus lointain,
    nous coordonnons chaque étape avec sérieux et transparence.`,
    status: '✓ Disponible',
    features: [
      'Trajets sécurisés sur mesure',
      'Accompagnement de sortie et arrivée',
      'Coordination avec les familles',
      'Conducteurs et accompagnateurs formés',
      'Suivi en temps réel et compte rendu',
    ],
    ctaText: 'Réserver une mission',
    ctaHref: '/dashboard/bookings/new',
    color: 'blue',
  },
  'accompagnement-familial': {
    title: 'Coordination familiale',
    subtitle: 'Information et suivi pour les parents',
    description: `Nous plaçons la communication avec les familles au cœur de notre service.
    Passerelle Jeunesse garantit un interlocuteur dédié, des mises à jour régulières et une coordination
    simple entre tous les acteurs du trajet.`,
    status: '✓ Disponible',
    features: [
      'Points de contact dédiés',
      'Information claire avant et après chaque trajet',
      'Validation des heures et lieux',
      'Réponses rapides aux questions des parents',
      'Organisation avec les établissements et les proches',
    ],
    ctaText: 'Nous contacter',
    ctaHref: '/contact?subject=coordination-familiale',
    color: 'emerald',
  },
  'suivi-transparent': {
    title: 'Suivi transparent',
    subtitle: 'Visibilité et confiance à chaque étape',
    description: `Passerelle Jeunesse propose un suivi documenté et une traçabilité des missions.
    Les parents reçoivent des comptes rendus, des confirmations de trajet et des échanges clairs
    avec notre équipe.`,
    status: '✓ Disponible',
    features: [
      'Rapports après chaque trajet',
      'Confirmation de prise en charge',
      'Suivi des temps de parcours',
      'Recueil des retours familles',
      'Supports clairs pour chaque déplacement',
    ],
    ctaText: 'Demander un suivi',
    ctaHref: '/contact?subject=suivi-transparent',
    color: 'cyan',
  },
};

export function generateStaticParams() {
  return Object.keys(polesData).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const pole = polesData[params.slug];

  if (!pole) {
    return {
      title: 'Pôle non trouvé - Passerelle Jeunesse',
      description: 'Pôle introuvable dans Passerelle Jeunesse.',
    };
  }

  return {
    title: `${pole.title} - Passerelle Jeunesse`,
    description: pole.description,
  };
}

export default function PoleDetailPage({ params }: { params: { slug: string } }) {
  const pole = polesData[params.slug];

  if (!pole) {
    notFound();
  }

  const color = colorClasses[pole.color];

  return (
    <PageShell>
      <main className="flex-1">
        {/* Hero */}
        <section className={`py-16 px-4 bg-gradient-to-r ${color.bgFrom} ${color.bgTo}`}>
          <div className="max-w-5xl mx-auto">
            <Link
              href="/poles"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux pôles
            </Link>
            <h1 className="text-5xl font-bold text-foreground mb-2">{pole.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{pole.subtitle}</p>
            <span className={`inline-block text-sm font-semibold ${color.status}`}>
              {pole.status}
            </span>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {pole.description}
            </p>

            <h2 className="text-3xl font-bold text-foreground mb-6">Ce que nous proposons</h2>
            <ul className="space-y-3 mb-12">
              {pole.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className={`${color.icon} font-bold mt-1`}>✓</span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={pole.ctaHref}>
                <Button size="lg" className="gap-2">
                  {pole.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Poser une question
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Related poles */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Découvrez aussi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(polesData)
                .filter(([slug]) => slug !== params.slug)
                .slice(0, 2)
                .map(([slug, related]) => {
                  const relatedColor = colorClasses[related.color];
                  return (
                    <Link key={slug} href={`/poles/${slug}`}>
                      <div className="p-6 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                        <h3 className="font-bold text-foreground mb-2">{related.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{related.subtitle}</p>
                        <span className={`text-xs font-semibold ${relatedColor.status}`}>
                          {related.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
