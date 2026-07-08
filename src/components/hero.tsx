'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast"
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

// Fonction de traitement du formulaire côté client
async function handleServiceRequest(values: any) {
  // Simulate API call/database operation
  console.log('New service request:', values);
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, message: 'Service request sent successfully.' };
}

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

const services = [
  'Trajets sécurisés',
  'Coordination parentale',
  'Accompagnement individualisé',
  'Suivi transparent',
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  organization: z.string().optional(),
  service: z.string({ required_error: "Veuillez sélectionner un service." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
});

export default function Hero() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await handleServiceRequest(values);
    if (result.success) {
      toast({
        title: "Demande Envoyée",
        description: "Merci ! Nous avons bien reçu votre demande et vous contacterons bientôt.",
      });
      form.reset();
      setOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: result.message,
      });
    }
  }

  return (
    <section className="relative w-full overflow-hidden flex items-center justify-center min-h-[600px] py-20">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
      <div className="relative z-10 flex h-full items-center justify-center text-center">
        <div className="container px-4 md:px-6 text-white">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Passerelle Jeunesse – Accompagnement & Mobilité
            </h1>
            <p className="text-lg md:text-xl text-slate-200">
              Sécuriser les parcours des jeunes, partout en France, en lien étroit avec les familles.
            </p>

            <div className="text-base text-slate-300 space-y-3 max-w-3xl mx-auto !mt-6">
                <p>
                    Passerelle Jeunesse propose un service professionnel d’accompagnement pour les <strong className="font-semibold text-white">jeunes de 7 à 20 ans</strong>, afin d’assurer leurs déplacements, soutenir leur autonomie et offrir aux familles un relais de confiance, dans un cadre sécurisé et bienveillant.
                </p>
                <p>
                    Basé à <strong className="font-semibold text-white">Metz et Saint-Avold</strong>, le service accompagne aussi bien des trajets locaux que des voyages longue distance en train ou bus vers toute la France.
                </p>
                <div className="grid gap-3 sm:grid-cols-3 mt-6 text-left text-sm text-slate-200">
                  <p>✔ Accompagnement clair et rassurant</p>
                  <p>✔ Parents informés à chaque étape</p>
                  <p>✔ Jeunes accompagnés vers l’autonomie</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 !mt-8">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="#services">
                    Découvrir les services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Contacter Passerelle Jeunesse
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Demander un service</DialogTitle>
                      <DialogDescription>
                        Remplissez le formulaire ci-dessous et nous vous recontacterons pour coordonner le service.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="votre.email@exemple.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="organization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organisation (facultatif)</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom de votre organisation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service souhaité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {services.map(service => (
                                    <SelectItem key={service} value={service}>{service}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Décrivez brièvement vos besoins..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Annuler
                            </Button>
                          </DialogClose>
                          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Envoi..." : "Envoyer la demande"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
