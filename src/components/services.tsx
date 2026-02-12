import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Footprints, MapPin, Users, Train, Sparkles } from 'lucide-react';

export default function Services() {
  return (
    <section id="services" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Des solutions adaptées aux besoins des familles et des structures</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Service 1: Accompagnement local */}
          <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Footprints className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl">Accompagnement local</CardTitle>
                    <CardDescription>Déplacements courts, accompagnement à des activités, rendez-vous ou trajets scolaires.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-2 mb-4 text-muted-foreground flex-grow">
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Trajets domicile ↔ école / activité</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Présence ponctuelle et cadre rassurant</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Remise du jeune à un adulte référent</span>
                    </li>
                </ul>
                 <ul className="space-y-2 text-muted-foreground text-sm mt-4 border-t pt-4">
                    <li className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span><strong className="font-semibold text-foreground">Zone :</strong> Metz, Saint-Avold et alentours</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-accent" />
                        <span><strong className="font-semibold text-foreground">Capacité :</strong> 1 à 5 jeunes selon l’âge et la situation</span>
                    </li>
                </ul>
            </CardContent>
          </Card>

          {/* Service 2: Voyages accompagnés */}
          <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Train className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl">Voyages accompagnés – France entière</CardTitle>
                    <CardDescription>Un jeune doit voyager seul ? Passerelle Jeunesse peut l’accompagner du départ jusqu’à l’arrivée.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-2 mb-4 text-muted-foreground flex-grow">
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Départ depuis Metz ou Saint-Avold</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Accompagnement en train ou bus</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Gestion des correspondances et bagages</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Surveillance active pendant tout le trajet</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                        <span>Remise en main propre à l’adulte désigné à l’arrivée</span>
                    </li>
                </ul>
                 <ul className="space-y-2 text-muted-foreground text-sm mt-4 border-t pt-4">
                    <li className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-accent" />
                        <span><strong className="font-semibold text-foreground">Capacité :</strong> adaptée selon l’âge (jusqu’à 5 jeunes sur un même trajet)</span>
                    </li>
                </ul>
            </CardContent>
          </Card>

          {/* Service 3: Soutenir l’autonomie */}
          <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl">Soutenir l’autonomie en toute sécurité</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <p className="text-muted-foreground flex-grow">
                    L’accompagnement ne se limite pas au transport : il aide aussi les jeunes à gagner en confiance, en organisation et en autonomie, toujours en lien avec les parents.
                </p>
                <div className="text-sm text-muted-foreground mt-4 border-t pt-4">
                    <p>Passerelle Jeunesse agit comme un <strong className="font-semibold text-foreground">adulte référent temporaire</strong>, jamais en remplacement de l’autorité parentale.</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
