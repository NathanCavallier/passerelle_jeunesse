import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Footprints, MapPin, Users, Train, Sparkles, Heart, Briefcase } from 'lucide-react';

export default function Services() {
  return (
    <section id="services" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Des solutions adaptées aux besoins des familles et des structures</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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

          {/* Service 4: Garde d'enfants & Accompagnement */}
          <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                  <Heart className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl">Garde & Accompagnement d'enfants</CardTitle>
                    <CardDescription>Services flexibles avec gratifications libres des parents.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-2 mb-4 text-muted-foreground flex-grow">
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                        <span>Garde à domicile (avant/après école, mercredi, vacances)</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                        <span>Accompagnements locaux et aide aux devoirs</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                        <span>Activités ludiques et pédagogiques</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                        <span>Encadrement bienveillant et sécurisé</span>
                    </li>
                </ul>
                 <ul className="space-y-2 text-muted-foreground text-sm mt-4 border-t pt-4">
                    <li className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span><strong className="font-semibold text-foreground">Âges :</strong> 4-16 ans</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="font-semibold text-foreground">Gratification :</strong> Libre (recommandé : 15€+/h)</span>
                    </li>
                </ul>
            </CardContent>
          </Card>

          {/* Service 5: Missions variées */}
          <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 p-4">
                  <Sparkles className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl">Missions variées</CardTitle>
                    <CardDescription>Services diversifiés avec gratifications libres.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-2 mb-4 text-muted-foreground flex-grow">
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        <span>Aide ménage légère et rangement</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        <span>Courses et commissions pour seniors</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        <span>Accompagnement aux démarches en ligne</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        <span>Tutorat et soutien pédagogique</span>
                    </li>
                </ul>
                 <ul className="space-y-2 text-muted-foreground text-sm mt-4 border-t pt-4">
                    <li className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="font-semibold text-foreground">Gratification :</strong> Libre (recommandé : 20€+/h)</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="font-semibold text-foreground">Flexibilité :</strong> Adaptable selon vos besoins</span>
                    </li>
                </ul>
            </CardContent>
          </Card>
        </div>

          {/* Original Service 3: Soutenir l'autonomie - Repositioned */}
          <div className="max-w-3xl mx-auto mt-12">
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="font-headline text-2xl">Notre approche globale</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col text-left">
                <p className="text-muted-foreground flex-grow">
                    L'accompagnement ne se limite pas au transport : il aide aussi les jeunes et les familles à gagner en confiance, en organisation et en autonomie. <strong className="font-semibold text-foreground">Passerelle Jeunesse agit comme un adulte référent temporaire</strong>, jamais en remplacement de l'autorité parentale.
                </p>
            </CardContent>
          </Card>
          </div>
        </div>
    </section>
  );
}
