import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = [
  {
    name: 'Marie L.',
    role: 'Parent',
    avatarId: 'testimonial-avatar-1',
    text: "Le service de transport de Passerelle Jeunesse est une vraie aide au quotidien. Mon fils est accompagné avec calme, ponctualité et sérénité, ce qui change beaucoup pour notre famille.",
  },
  {
    name: 'Jean-François T.',
    role: 'Directeur, Centre Communautaire',
    avatarId: 'testimonial-avatar-2',
    text: "Nous avons trouvé chez Passerelle Jeunesse une présence fiable et rassurante pour accompagner les jeunes dans des situations de transition ou de déplacement.",
  },
  {
    name: 'Aïcha B.',
    role: 'Famille',
    avatarId: 'testimonial-avatar-3',
    text: "Les gardes à domicile et le soutien scolaire de Passerelle Jeunesse ont permis à notre fille de reprendre confiance et de retrouver un rythme serein. Nous avons senti une vraie présence humaine à chaque étape.",
  },
];

export default function Testimonials() {
  const getAvatar = (id: string) => PlaceHolderImages.find(img => img.id === id);

  return (
    <section id="testimonials" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Des parents et partenaires rassurés</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Témoignages concrets sur la sérénité, la fiabilité et la qualité des accompagnements.
          </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => {
              const avatar = getAvatar(testimonial.avatarId);
              return (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="flex flex-col justify-between h-full shadow-md">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                          {avatar && (
                            <AvatarImage src={avatar.imageUrl} alt={testimonial.name} data-ai-hint={avatar.imageHint} />
                          )}
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground italic mb-4">"{testimonial.text}"</p>
                        <div className="mt-auto">
                          <p className="font-bold font-headline">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
