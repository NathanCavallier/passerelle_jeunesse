'use client';

import { Briefcase, Clock, HeartHandshake, Users } from 'lucide-react';

const audience = [
    { text: 'Familles ayant besoin d’un relais fiable', icon: <HeartHandshake className="h-8 w-8 text-primary" /> },
    { text: 'Jeunes voyageant seuls ou en fratrie', icon: <Users className="h-8 w-8 text-primary" /> },
    { text: 'Associations et structures jeunesse', icon: <Briefcase className="h-8 w-8 text-primary" /> },
    { text: 'Parents aux horaires contraints ou aux besoins ponctuels', icon: <Clock className="h-8 w-8 text-primary" /> },
];

export default function TargetAudience() {
  return (
    <section id="for-whom" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Pour qui ?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {audience.map((item, index) => (
            <div key={index} className="text-center flex flex-col items-center gap-4">
                 <div className="rounded-full bg-primary/10 p-4">
                    {item.icon}
                  </div>
                <p className="font-semibold text-foreground text-lg">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
