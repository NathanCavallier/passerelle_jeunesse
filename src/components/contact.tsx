'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
  return (
    <section id="contact" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Besoin d’un accompagnement et de mobilité ?</CardTitle>
              <CardDescription className="pt-2">
                Chaque situation est étudiée avec attention afin de proposer un cadre clair, adapté et sécurisé pour vos trajets, vos garde ou vos besoins d’accompagnement.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center justify-center gap-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span>Basé à Metz / Saint-Avold</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <a href="tel:+33619226294" className="hover:underline">+33 6 19 22 62 94</a>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <a href="mailto:contact@passerellejeunesse.fr" className="hover:underline">contact@passerellejeunesse.fr</a>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Réponse sous 24h ouvrées. Demande sans engagement et accompagnement sur mesure pour votre famille ou votre structure.</p>
              <div className="mt-8">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 h-auto whitespace-normal text-center" size="lg">
                  <Link href="mailto:contact@passerellejeunesse.fr">
                    Demander un devis ou un premier échange sans engagement
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
