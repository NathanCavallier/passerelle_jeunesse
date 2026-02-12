'use client';

import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

const commitments = [
    { text: 'Autorisation écrite des responsables légaux' },
    { text: 'Contrat ou devis avant chaque mission' },
    { text: 'Assurance Responsabilité Civile Professionnelle' },
    { text: 'Communication régulière avec les familles' },
    { text: 'Respect total de l’autorité parentale' },
];

const weAreNot = [
    "un animateur de colo",
    "un éducateur spécialisé",
    "une structure sociale",
];

const weAre = [
    "Un accompagnateur de mobilité jeunesse",
    "Un référent adulte temporaire",
    "Un service de sécurisation des trajets",
];


export default function Safety() {
  return (
    <section id="safety" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Un accompagnement professionnel et encadré
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Passerelle Jeunesse intervient dans un cadre clair et rassurant :
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
              <p>Le service n’intervient pas dans les domaines médicaux, thérapeutiques ou judiciaires, et agit toujours comme <strong className="font-semibold text-foreground">accompagnateur</strong>, jamais comme décideur à la place des parents.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="font-headline text-2xl font-bold tracking-tight">Notre positionnement</h3>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Pour bien comprendre notre rôle, voici ce qui nous définit et ce que nous ne sommes pas.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-lg">
                <h4 className="flex items-center gap-2 font-headline text-xl font-bold text-destructive mb-4">
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
                <h4 className="flex items-center gap-2 font-headline text-xl font-bold text-accent mb-4">
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

        </div>
      </div>
    </section>
  );
}
