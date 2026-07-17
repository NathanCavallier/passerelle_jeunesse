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
  details?: {
    includes: string[];
    excludes: string[];
    securityItems: string[];
    processSteps: string[];
    audience: string;
    crossLink?: {
      href: string;
      label: string;
    };
    note?: string;
  };
}> = {
  mobilite: {
    title: 'Accompagnement et mobilité',
    subtitle: 'Accompagnement des trajets et déplacements',
    description: `Passerelle Jeunesse propose un accompagnement rassurant pour les déplacements des jeunes.
    Que ce soit pour un trajet local à Metz/Saint-Avold ou un transfert plus lointain,
    nous organisons chaque étape avec sérieux, clarté et transparence.`,
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
    subtitle: 'Communication et coordination autour du jeune',
    description: `Nous plaçons la communication avec les familles au cœur de notre service.
    Passerelle Jeunesse garantit un interlocuteur clair, des informations régulières et un cadre défini
    pour chaque mission, dans un souci de simplicité et de confiance.`,
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
    title: 'Suivi et transparence',
    subtitle: 'Visibilité et confiance à chaque étape',
    description: `Passerelle Jeunesse propose un suivi documenté et une traçabilité des missions.
    Les parents reçoivent des comptes rendus, des confirmations de prise en charge et des échanges clairs
    avec notre équipe, dans un cadre défini.`,
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
  'baby-sitting': {
    title: 'Garde à domicile',
    subtitle: 'Présence rassurante et cadre défini à domicile',
    description: `Une présence rassurante et bienveillante pour vos enfants, avant ou après l’école,
    le mercredi ou pendant les vacances. Passerelle Jeunesse met à disposition des intervenants
    de confiance, avec une communication claire et un cadre défini dès la première mission.`,
    status: '✓ Nouveau pôle',
    features: [
      'Garde à domicile avant et après l’école',
      'Garde le mercredi et pendant les vacances scolaires',
      'Accompagnement aux activités ludiques et récréatives',
      'Aide aux devoirs légère et routines du soir ou du matin',
      'Compte rendu de garde envoyé après chaque mission',
    ],
    ctaText: 'Demander une garde',
    ctaHref: '/contact?subject=baby-sitting',
    color: 'violet',
    details: {
      includes: [
        'Garde à domicile avant et après l’école',
        'Garde le mercredi et pendant les vacances scolaires',
        'Accompagnement aux activités ludiques et récréatives',
        'Aide aux devoirs légère et routines du soir/matin',
        'Préparation de repas simples',
      ],
      excludes: [
        'Aucun soin médical au-delà des premiers secours de base',
        'Aucune garde de nourrissons de moins de 12 mois sans validation préalable',
        'Aucune administration de médicament sans protocole écrit signé par les parents',
      ],
      securityItems: [
        'Autorisation parentale écrite obligatoire avant toute première garde',
        'Fiche sanitaire simplifiée avec allergies, contacts d’urgence et consignes particulières',
        'Intervenant identifié et présenté à la famille avant la première mission',
        'Procédure d’urgence claire communiquée en amont',
        'Compte rendu envoyé après chaque mission',
      ],
      processSteps: [
        'Premier échange — on évalue vos besoins, la fréquence, les horaires et l’âge des enfants',
        'Mise en relation — un intervenant adapté au profil de vos enfants est proposé',
        'Garde d’essai — une première mission permet de valider que le courant passe',
        'Récurrence possible — mise en place d’un planning hebdomadaire si besoin',
      ],
      audience: 'Enfants de 4 à 16 ans. Pour les enfants de moins de 4 ans, une évaluation spécifique est nécessaire selon le profil de l’intervenant.',
      crossLink: {
        href: '/poles/soutien-scolaire',
        label: 'Découvrir le pôle Soutien scolaire',
      },
      note: 'Si un agrément Services à la Personne est obtenu, un crédit d’impôt de 50 % peut devenir un argument de conversion particulièrement fort sur ce service.',
    },
  },
  'soutien-scolaire': {
    title: 'Soutien scolaire',
    subtitle: 'Accompagnement scolaire bienveillant à domicile',
    description: `Un accompagnement scolaire bienveillant pour aider votre enfant à reprendre confiance
    et à s’organiser dans son travail. Ce service s’inscrit dans un cadre défini et rassurant,
    sans chercher à remplacer un cadre éducatif spécialisé.`,
    status: '✓ Disponible',
    features: [
      'Aide aux devoirs et à l’organisation',
      'Intervenants adaptés au niveau de l’enfant',
      'Préparation d’évaluations et de contrôles',
      'Remotivation et remise en confiance',
      'Suivi partagé avec les parents',
    ],
    ctaText: 'Demander un accompagnement',
    ctaHref: '/contact?subject=soutien-scolaire',
    color: 'amber',
    details: {
      includes: [
        'Aide aux devoirs (primaire, collège, lycée selon l’intervenant)',
        'Aide à l’organisation du travail et des méthodes',
        'Préparation d’évaluations et de contrôles',
        'Remotivation et remise en confiance face au travail scolaire',
      ],
      excludes: [
        'Nous ne sommes pas un organisme de soutien scolaire certifié avec programme pédagogique propre',
        'Nous ne garantissons pas de résultat scolaire ou de progression de notes',
        'Nous n’intervenons pas comme professionnel de l’éducation spécialisée (troubles DYS, accompagnement MDPH, etc.)',
      ],
      securityItems: [
        'Autorisation parentale écrite avant la première séance',
        'Séance découverte pour définir les besoins réels de l’enfant',
        'Point régulier avec les parents sur la progression et l’assiduité',
        'Séances à domicile ou en présentiel dans un lieu convenu avec la famille',
      ],
      processSteps: [
        'Premier échange — matières concernées, niveau, difficultés identifiées',
        'Mise en relation — un intervenant adapté au niveau scolaire et à la matière est proposé',
        'Séance découverte — pour ajuster la méthode à l’enfant',
        'Suivi régulier — séances ponctuelles ou récurrentes selon les besoins',
      ],
      audience: 'Jeunes de 6 à 18 ans, du primaire à la terminale, selon le niveau et la disponibilité de nos intervenants.',
      crossLink: {
        href: '/poles/baby-sitting',
        label: 'Découvrir le pôle Baby Sitting',
      },
    },
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
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {pole.description}
            </p>

            {pole.details ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 mb-10">
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Inclus</h2>
                    <ul className="space-y-3">
                      {pole.details.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className={`${color.icon} font-bold mt-1`}>✓</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Exclus</h2>
                    <ul className="space-y-3">
                      {pole.details.excludes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold mt-1">✕</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Cadre et sécurité</h2>
                  <ul className="space-y-3">
                    {pole.details.securityItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-amber-700 font-bold mt-1">•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-muted-foreground mb-8">
                  <span className="font-semibold text-foreground">Public concerné :</span>{' '}
                  {pole.details.audience}
                </p>

                <div className="rounded-2xl border bg-slate-50 p-6 mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Comment ça fonctionne</h2>
                  <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                    {pole.details.processSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                {pole.details.crossLink && (
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 mb-8">
                    <p className="text-sm font-semibold text-violet-700 mb-2">Besoin d’un accompagnement plus scolaire ?</p>
                    <Link href={pole.details.crossLink.href} className="text-violet-700 underline-offset-4 hover:underline">
                      {pole.details.crossLink.label}
                    </Link>
                  </div>
                )}

                {pole.details.note && (
                  <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-5 mb-10">
                    <p className="text-sm text-violet-700">{pole.details.note}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-6">Ce que nous proposons</h2>
                <ul className="space-y-3 mb-12">
                  {pole.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className={`${color.icon} font-bold mt-1`}>✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

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
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-8">Découvrez aussi</h2>
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
