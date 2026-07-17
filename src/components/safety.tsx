'use client';

import { ShieldCheck, CheckCircle, XCircle, HeartHandshake } from 'lucide-react';

const commitments = [
  { text: 'Autorisation écrite des responsables légaux avant toute mission (trajet, garde ou séance de soutien)' },
  { text: 'Contrat ou devis avant chaque intervention' },
  { text: 'Assurance Responsabilité Civile Professionnelle couvrant les trajets et les interventions à domicile' },
  { text: 'Communication régulière avec les familles' },
  { text: 'Respect total de l’autorité parentale' },
];

const weAreNot = [
  'un animateur de colonie de vacances',
  'un éducateur spécialisé ou un travailleur social',
  'une structure médicale, paramédicale ou thérapeutique',
  'un organisme de soutien scolaire certifié avec garantie de résultat',
  'une crèche ou un établissement d’accueil du jeune enfant',
];

const weAre = [
  'Un accompagnant de mobilité et d’accompagnement jeunesse',
  'Un référent adulte temporaire, à domicile ou en trajet',
  'Un service de sécurisation des trajets, des gardes et des temps de devoirs',
  'Un relais de confiance pour les familles, dans un cadre défini et transparent',
];

const babySittingRules = [
  'Fiche sanitaire simplifiée obligatoire avant la première garde',
  'Aucune administration de médicament sans consigne écrite des parents',
  'Aucun soin médical au-delà des gestes de premiers secours de base',
  'Procédure d’urgence communiquée aux parents avant la première garde',
  'Un intervenant présenté et validé par la famille avant toute garde en autonomie',
];

const schoolSupportRules = [
  'Séance découverte pour cadrer les attentes réelles',
  'Points réguliers avec les parents sur l’assiduité et la progression',
  'Orientation vers des structures spécialisées si un besoin relevant de troubles de l’apprentissage ou d’un accompagnement MDPH est identifié',
];

export default function Safety() {
  return (
    <section id="safety" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-semibold tracking-tight sm:text-4xl">
              Un accompagnement rassurant, défini et transparent
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Passerelle Jeunesse intervient dans un cadre clair, stable et adapté aux besoins des familles :
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 mb-8">
              {commitments.map((commitment, index) => (
                <li key={index} className="flex items-start gap-3">
                  <ShieldCheck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{commitment.text}</span>
                </li>
              ))}
            </ul>
            <div className="text-center text-md text-muted-foreground bg-background p-6 rounded-lg border">
              <p>Le service n’intervient pas dans les domaines médicaux, thérapeutiques ou judiciaires, et agit toujours comme <strong className="font-semibold text-foreground">accompagnant</strong>, jamais comme décideur à la place des parents.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="font-headline text-2xl font-semibold tracking-tight">Notre positionnement</h3>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Pour bien comprendre notre rôle, voici ce qui nous définit et ce que nous ne sommes pas — quel que soit le pôle concerné.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-lg">
              <h4 className="flex items-center gap-2 font-headline text-xl font-semibold tracking-tight text-destructive mb-4">
                Ce que nous ne sommes PAS
              </h4>
              <ul className="space-y-3">
                {weAreNot.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-accent/5 border border-accent/20 p-6 rounded-lg">
              <h4 className="flex items-center gap-2 font-headline text-xl font-semibold tracking-tight text-accent mb-4">
                Ce que nous SOMMES
              </h4>
              <ul className="space-y-3">
                {weAre.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HeartHandshake className="h-5 w-5 text-amber-700" />
                <h4 className="font-headline text-xl font-semibold tracking-tight text-foreground">Cadre spécifique — Baby-Sitting</h4>
              </div>
              <ul className="space-y-3">
                {babySittingRules.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-amber-700 flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-sky-700" />
                <h4 className="font-headline text-xl font-semibold tracking-tight text-foreground">Cadre spécifique — Soutien Scolaire</h4>
              </div>
              <ul className="space-y-3">
                {schoolSupportRules.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-sky-700 flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
