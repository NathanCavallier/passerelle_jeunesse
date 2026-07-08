'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Users, Map, Home, Train, MapPin, Ticket, Utensils, Users2, ShieldCheck, FileText, Phone, MoonStar, Heart, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const offer1 = {
    offerNumber: 'OFFRE 1',
    title: 'ACCOMPAGNEMENT LOCAL',
    subtitle: '“Mobilité & Présence Locale”',
    description: 'Pour : trajets courts et accompagnement de proximité',
    inclus: [
        'Trajets domicile ↔ école / activité / rendez-vous',
        'Présence lors d’activités si nécessaire',
        'Attente et remise à un adulte référent',
        'Communication avec les parents',
    ],
    capacite: [
        '1 à 3 jeunes (trajet simple)',
        'Jusqu’à 5 si groupe homogène et court trajet'
    ],
    tarifs: [
        { formule: '1 heure', tarif: '25 €' },
        { formule: '2 heures', tarif: '45 €' },
        { formule: 'Demi-journée (4h)', tarif: '85 €' },
        { formule: 'Heure supplémentaire', tarif: '20 €' },
    ],
};

const offer2 = {
    offerNumber: 'OFFRE 2',
    title: 'ACCOMPAGNEMENT LONGUE DISTANCE',
    subtitle: '“Voyage accompagné – France entière”',
    description: 'Pour : jeunes voyageant seuls que les parents veulent sécuriser',
    depart: ['Metz', 'Saint-Avold'],
    destination: 'toute la France',
    inclus: [
        'Prise en charge du jeune au point de départ',
        'Voyage complet avec lui (train ou bus)',
        'Aide gestion bagages / correspondances',
        'Surveillance active pendant le trajet',
        'Remise en main propre à l’adulte désigné à l’arrivée',
        'Compte rendu aux parents',
    ],
    capacite: [
        { age: '7–10 ans', max: '1 à 2 max' },
        { age: '11–14 ans', max: '2 à 3 max' },
        { age: '15–20 ans', max: 'jusqu’à 5 (si trajet simple)' },
    ],
    tarifs: [
        { duree: 'Jusqu’à 3h', tarif: '120 €' },
        { duree: '3h à 6h', tarif: '180 €' },
        { duree: '6h à 10h', tarif: '250 €' },
        { duree: 'Journée complète', tarif: '320 €' },
    ],
    notes: [
        { icon: <Ticket className="h-4 w-4 text-accent flex-shrink-0 mt-1" />, text: 'Transport du professionnel : à la charge de la famille' },
        { icon: <Utensils className="h-4 w-4 text-accent flex-shrink-0 mt-1" />, text: 'Repas si mission longue : pris en charge' },
    ]
};

const offer4 = {
    offerNumber: 'OFFRE 4',
    title: 'GARDE & ACCOMPAGNEMENT D\'ENFANTS',
    subtitle: '"Services flexibles pour familles"',
    description: 'Pour : garde d\'enfants avec gratifications libres des parents',
    inclus: [
        'Garde à domicile (avant/après école, mercredi, vacances)',
        'Accompagnements locaux (école, activités, rendez-vous)',
        'Aide aux devoirs et activités ludiques',
        'Encadrement bienveillant et sécurisé',
        'Communication régulière avec les parents',
    ],
    capacite: ['4-16 ans'],
    tarifs: [
        { formule: 'Gratification libre', tarif: 'Recommandé : 15€+/h' },
        { formule: 'Demi-journée', tarif: 'À convenir' },
        { formule: 'Journée complète', tarif: 'À convenir' },
    ],
};

const offer5 = {
    offerNumber: 'OFFRE 5',
    title: 'MISSIONS VARIÉES',
    subtitle: '"Services diversifiés pour tous"',
    description: 'Pour : aide ponctuelle avec gratifications libres',
    inclus: [
        'Aide ménage légère et rangement',
        'Courses et commissions',
        'Accompagnement aux démarches en ligne',
        'Tutorat et soutien pédagogique',
        'Accompagnement pour seniors',
    ],
    capacite: ['Flexibilité adaptée'],
    tarifs: [
        { formule: 'Gratification libre', tarif: 'Recommandé : 20€+/h' },
        { formule: 'Par visite', tarif: 'À convenir' },
    ],
};

const importantConditions = [
    { icon: <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0 mt-1" />, text: 'Autorisation parentale obligatoire' },
    { icon: <FileText className="h-5 w-5 text-accent flex-shrink-0 mt-1" />, text: 'Fiche sanitaire simplifiée' },
    { icon: <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-1" />, text: 'Contacts d’urgence' },
    { icon: <Ticket className="h-5 w-5 text-accent flex-shrink-0 mt-1" />, text: 'Billets fournis à l’avance' },
    { icon: <MoonStar className="h-5 w-5 text-accent flex-shrink-0 mt-1" />, text: 'Pas de transport de nuit pour mineur seul (sauf cas validé)' },
];


export default function Pricing() {
    return (
        <section id="pricing" className="py-12 md:py-24 bg-card">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Nos offres et tarifs</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Des solutions claires et adaptées pour répondre à chaque besoin.
                    </p>
                </div>

                <Card className="mb-16 bg-background border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl font-bold text-center">Cadre Général des Prestations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-muted-foreground">
                            <li className="flex items-start gap-4">
                                <Users className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Public</h3>
                                    <p>Jeunes de 7 à 20 ans</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Check className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Encadrement</h3>
                                    <p>1 accompagnateur adulte</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Users className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Capacité maximale</h3>
                                    <p>5 jeunes simultanément (selon âge et trajet)</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Map className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Zone d’intervention</h3>
                                    <p className="text-muted-foreground">Local (Metz / Saint-Avold et alentours)</p>
                                    <p className="text-muted-foreground">National (trajets en train ou bus depuis Metz ou Saint-Avold vers toute la France)</p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <div className="grid gap-8">
                    <Card key={offer1.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-6 bg-primary/5">
                            <div className='flex items-center gap-4'>
                                <div className="mb-4 rounded-full bg-primary/10 p-4 hidden sm:block">
                                    <Home className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-accent">{offer1.offerNumber}</p>
                                    <CardTitle className="font-headline text-2xl">{offer1.title}</CardTitle>
                                    <CardDescription className="text-lg !mt-2">{offer1.subtitle}</CardDescription>
                                </div>
                            </div>
                            <p className="text-muted-foreground pt-2 !mt-1">{offer1.description}</p>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 grid md:grid-cols-3 gap-8">
                            <div>
                                <h4 className="font-bold text-lg mb-3">Inclus</h4>
                                <ul className="space-y-2">
                                    {offer1.inclus.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                                            <span className="text-muted-foreground text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Capacité</h4>
                                <ul className="space-y-2">
                                    {offer1.capacite.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Users className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                                            <span className="text-muted-foreground text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Tarifs</h4>
                                <Table>
                                    <TableBody>
                                        {offer1.tarifs.map((tarif) => (
                                            <TableRow key={tarif.formule}>
                                                <TableCell className="font-medium p-2 pl-0">{tarif.formule}</TableCell>
                                                <TableCell className="text-right p-2 pr-0 font-bold text-foreground">{tarif.tarif}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-4">
                            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                <Link href="/#contact">
                                    Demander cette offre
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card key={offer2.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-6 bg-primary/5">
                            <div className='flex items-center gap-4'>
                                <div className="mb-4 rounded-full bg-primary/10 p-4 hidden sm:block">
                                    <Train className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-accent">{offer2.offerNumber}</p>
                                    <CardTitle className="font-headline text-2xl">{offer2.title}</CardTitle>
                                    <CardDescription className="text-lg !mt-2">{offer2.subtitle}</CardDescription>
                                </div>
                            </div>
                            <p className="text-muted-foreground pt-2 !mt-1">{offer2.description}</p>
                            <div className='flex flex-col sm:flex-row gap-4 pt-2'>
                                <div className='flex items-center gap-2 text-sm'>
                                    <MapPin className="h-4 w-4 text-accent" />
                                    <span className='font-semibold'>Départ :</span> {offer2.depart.join(' / ')}
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <Map className="h-4 w-4 text-accent" />
                                    <span className='font-semibold'>Destination :</span> {offer2.destination}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 grid md:grid-cols-3 gap-8">
                            <div>
                                <h4 className="font-bold text-lg mb-3">Inclus</h4>
                                <ul className="space-y-2">
                                    {offer2.inclus.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                                            <span className="text-muted-foreground text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Capacité</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="p-2 pl-0">Âge des jeunes</TableHead>
                                            <TableHead className="text-right p-2 pr-0">Nombre max</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {offer2.capacite.map((item) => (
                                            <TableRow key={item.age}>
                                                <TableCell className="font-medium p-2 pl-0">{item.age}</TableCell>
                                                <TableCell className="text-right p-2 pr-0">{item.max}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Tarification voyage</h4>
                                <p className='text-sm text-muted-foreground mb-3'>Le prix dépend du <strong>temps mobilisé</strong>, pas seulement du trajet.</p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="p-2 pl-0">Durée totale mission</TableHead>
                                            <TableHead className="text-right p-2 pr-0">Tarif</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {offer2.tarifs.map((tarif) => (
                                            <TableRow key={tarif.duree}>
                                                <TableCell className="font-medium p-2 pl-0">{tarif.duree}</TableCell>
                                                <TableCell className="text-right p-2 pr-0 font-bold text-foreground">{tarif.tarif}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 space-y-2">
                                    {offer2.notes.map((note, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                                            {note.icon}
                                            <span>{note.text}</span>
                                        </li>
                                    ))}
                                </div>
                                <p className='text-xs text-muted-foreground mt-4'>👉 Tarif <strong>par mission</strong>, pas par enfant (sauf cas complexe)</p>

                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-4">
                            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                <Link href="/#contact">
                                    Demander cette offre
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card key="offer3" className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-6 bg-primary/5">
                            <div className='flex items-center gap-4'>
                                <div className="mb-4 rounded-full bg-primary/10 p-4 hidden sm:block">
                                    <Users2 className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-accent">OFFRE 3</p>
                                    <CardTitle className="font-headline text-2xl">ACCOMPAGNEMENT RENFORCÉ (groupes)</CardTitle>
                                    <CardDescription className="text-lg !mt-2">“Fratries ou petits groupes”</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 grid md:grid-cols-2 gap-8 items-start">
                            <div>
                                <h4 className="font-bold text-lg mb-3">Pour</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                                        <span className="text-muted-foreground text-sm">Frères/sœurs</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                                        <span className="text-muted-foreground text-sm">Amis voyageant ensemble</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                                        <span className="text-muted-foreground text-sm">Déplacements vers colonies, stages, internats</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Supplément groupe</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="p-2 pl-0">Nombre d’enfants</TableHead>
                                            <TableHead className="text-right p-2 pr-0">Supplément</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium p-2 pl-0">2 enfants</TableCell>
                                            <TableCell className="text-right p-2 pr-0 font-bold text-foreground">+15 €</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium p-2 pl-0">3 enfants</TableCell>
                                            <TableCell className="text-right p-2 pr-0 font-bold text-foreground">+30 €</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium p-2 pl-0">4 enfants</TableCell>
                                            <TableCell className="text-right p-2 pr-0 font-bold text-foreground">+45 €</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium p-2 pl-0">5 enfants</TableCell>
                                            <TableCell className="text-right p-2 pr-0 font-bold text-foreground">+60 €</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-4">
                            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                <Link href="/#contact">
                                    Demander cette offre
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card key="offer4" className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-6 bg-emerald-50 dark:bg-emerald-900/20">
                            <div className='flex items-center gap-4'>
                                <div className="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 hidden sm:block">
                                    <Heart className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">OFFRE 4</p>
                                    <CardTitle className="font-headline text-2xl">GARDE & ACCOMPAGNEMENT D'ENFANTS</CardTitle>
                                    <CardDescription className="text-lg !mt-2">"Services flexibles pour familles"</CardDescription>
                                </div>
                            </div>
                            <p className="text-muted-foreground pt-2 !mt-1">Pour : garde d'enfants avec gratifications libres des parents</p>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-lg mb-3">Services inclus</h4>
                                <ul className="space-y-2">
                                    {['Garde à domicile (avant/après école, mercredi, vacances)', 'Accompagnements locaux', 'Aide aux devoirs et activités ludiques', 'Encadrement bienveillant et sécurisé'].map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                                            <span className="text-muted-foreground text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Tarification</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Gratification libre</span>
                                        <span className="font-bold text-foreground">Recommandé : 15€+/h</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Demi-journée</span>
                                        <span className="font-bold text-foreground">À convenir</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Journée complète</span>
                                        <span className="font-bold text-foreground">À convenir</span>
                                    </div>
                                    <div className="pt-3 border-t text-sm text-muted-foreground">
                                        <p><strong className="text-foreground">Âges :</strong> 4-16 ans</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-4">
                            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Link href="/#contact">
                                    Demander cette offre
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card key="offer5" className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-6 bg-amber-50 dark:bg-amber-900/20">
                            <div className='flex items-center gap-4'>
                                <div className="mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 p-4 hidden sm:block">
                                    <Briefcase className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">OFFRE 5</p>
                                    <CardTitle className="font-headline text-2xl">MISSIONS VARIÉES</CardTitle>
                                    <CardDescription className="text-lg !mt-2">"Services diversifiés pour tous"</CardDescription>
                                </div>
                            </div>
                            <p className="text-muted-foreground pt-2 !mt-1">Pour : aide ponctuelle avec gratifications libres</p>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-lg mb-3">Services proposés</h4>
                                <ul className="space-y-2">
                                    {['Aide ménage légère et rangement', 'Courses et commissions', 'Aide numérique et tech', 'Tutorat et soutien pédagogique'].map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                                            <span className="text-muted-foreground text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-3">Tarification</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Gratification libre</span>
                                        <span className="font-bold text-foreground">Recommandé : 20€+/h</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Par visite</span>
                                        <span className="font-bold text-foreground">À convenir</span>
                                    </div>
                                    <div className="pt-3 border-t text-sm text-muted-foreground">
                                        <p><strong className="text-foreground">Flexibilité :</strong> Adaptable selon vos besoins</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-4">
                            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                <Link href="/#contact">
                                    Demander cette offre
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="mt-16 bg-background border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl font-bold text-center">Conditions Importantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                                {importantConditions.map((condition, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        {condition.icon}
                                        <span className="text-muted-foreground">{condition.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
