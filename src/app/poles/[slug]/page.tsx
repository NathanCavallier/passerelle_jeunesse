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
    title: 'Mobilité',
    subtitle: 'Accompagnement local et longue distance',
    description: `Passerelle Jeunesse propose un accompagnement personnalisé pour tous les jeunes ayant besoin
    de se déplacer. Que ce soit pour un trajet local à Metz/Saint-Avold ou une aventure à travers la France,
    nous sommes là pour faciliter vos déplacements en toute sécurité et confiance.`,
    status: '✓ Disponible',
    features: [
      'Trajets locaux à Metz et Saint-Avold',
      'Accompagnement à travers la France',
      'Missions ponctuelles ou régulières',
      'Professionnels expérimentés et formés',
      'Plateforme de réservation sécurisée',
    ],
    ctaText: 'Réserver une mission',
    ctaHref: '/dashboard/bookings/new',
    color: 'blue',
  },
  'sciences-decouverte': {
    title: 'Sciences & Découverte',
    subtitle: 'Ateliers scientifiques avec Ateliers 360',
    description: `Découvrez le monde fascinant des sciences à travers des ateliers pratiques et ludiques.
    Chimie, physique, électricité, robotique : des expériences concrètes pour comprendre et apprendre
    en s'amusant.`,
    status: '📅 Bientôt (Septembre 2026)',
    features: [
      'Ateliers de chimie expérimentale',
      'Projets de physique et électricité',
      'Robotique et programmation',
      'Expériences pratiques et ludiques',
      'Équipes pédagogiques spécialisées',
      'Petits groupes (6-12 jeunes)',
    ],
    ctaText: 'Me notifier de l\'ouverture',
    ctaHref: '/contact?subject=ateliers-sciences',
    color: 'violet',
  },
  'escape-games': {
    title: 'Escape Games & Enquêtes',
    subtitle: 'Jeux d\'évasion éducatifs',
    description: `Immergez-vous dans des aventures captivantes où logique, observation et travail
    d'équipe sont essentiels. Nos escape games sont conçus pour développer l'esprit critique
    tout en s'amusant.`,
    status: '📅 Bientôt (Septembre 2026)',
    features: [
      'Enquêtes scientifiques et historiques',
      'Énigmes logiques et mathématiques',
      'Jeux coopératifs en équipe',
      'Thèmes variés et progressifs',
      'Sessions de 60-90 minutes',
      'Accès régulier ou ponctuel',
    ],
    ctaText: 'Je m\'inscris à la liste d\'attente',
    ctaHref: '/contact?subject=escape-games',
    color: 'amber',
  },
  periscolaire: {
    title: 'Accueil Périscolaire',
    subtitle: 'Après l\'école et mercredis éducatifs',
    description: `Un espace bienveillant où les jeunes trouvent aide aux devoirs, activités créatives
    et moments de détente. Du lundi au vendredi après les cours et les mercredis, un encadrement
    de qualité pour réussir à l'école et s'épanouir.`,
    status: '📅 Bientôt (Août 2026)',
    features: [
      'Aide aux devoirs personnalisée',
      'Activités créatives et sportives',
      'Goûter et moments de détente',
      'Encadrement bienveillant 15-20 jeunes',
      'Horaires flexibles après école',
      'Accueil pendant les vacances scolaires',
    ],
    ctaText: 'Préinscrire mon enfant',
    ctaHref: '/contact?subject=periscolaire',
    color: 'emerald',
  },
  numerique: {
    title: 'Numérique & IA',
    subtitle: 'Programmation, IA, cybersécurité, création',
    description: `Préparez-vous au futur numérique en apprenant la programmation, la création de jeux
    vidéo, les bases de l'IA et de la cybersécurité. L'impression 3D et les technologies modernes
    n'auront plus de secrets pour vous.`,
    status: '📅 Prochainement (Avril 2027)',
    features: [
      'Programmation Python et JavaScript',
      'Création de jeux avec Godot/Unity',
      'Initiation à l\'IA et machine learning',
      'Cybersécurité et protection des données',
      'Impression 3D et design numérique',
      'Projets collaboratifs innovants',
    ],
    ctaText: 'Rester informé du lancement',
    ctaHref: '/contact?subject=numerique-ia',
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
