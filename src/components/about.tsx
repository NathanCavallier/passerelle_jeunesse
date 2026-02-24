'use client';

import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const commitments = [
    { text: 'Sécurité et vigilance' },
    { text: 'Communication claire avec les familles' },
    { text: 'Respect du rythme et de la personnalité du jeune' },
    { text: 'Cadre professionnel et contractualisé' },
];

export default function About() {
  return (
    <section id="about" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="relative w-56 h-72 mb-4 rounded-2xl overflow-hidden border-4 border-primary shadow-lg">
              <Image
                src="/images/nathan.jpeg"
                alt="Nathan Imogo — Fondateur de Passerelle Jeunesse"
                fill
                className="object-cover object-center"
                sizes="224px"
                priority
              />
            </div>
            <h3 className="text-2xl font-bold font-headline">Nathan Imogo</h3>
            <p className="text-muted-foreground">Fondateur</p>
          </div>
          <div className="md:col-span-2">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Une présence de confiance pour accompagner les jeunes
            </h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
              <p>
                Je m’appelle <strong className="font-semibold text-foreground">Nathan Imogo</strong>, fondateur de <em className="italic">Passerelle Jeunesse – Accompagnement & Mobilité</em>.
              </p>
              <p>
                J’ai créé ce service pour répondre à un besoin concret : offrir aux familles et aux structures locales une présence fiable et bienveillante pour accompagner les jeunes dans certaines étapes de leur quotidien.
              </p>
              <p>
                Mon rôle n’est pas de remplacer les parents, mais de les <strong className="font-semibold text-foreground">soutenir ponctuellement</strong>, en assurant la sécurité, le cadre et l’accompagnement éducatif nécessaire lors de déplacements, d’activités ou de moments de transition.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-16">
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl font-bold">Mes engagements</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {commitments.map((commitment, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                            <span className="text-muted-foreground">{commitment.text}</span>
                        </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div className="mt-12 text-center text-lg text-muted-foreground">
            <p>Passerelle Jeunesse s’inscrit dans une démarche de proximité, de confiance et de prévention.</p>
        </div>
      </div>
    </section>
  );
}
