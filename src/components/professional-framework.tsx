'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const items = [
    'Service déclaré en auto-entreprise',
    'Assurance Responsabilité Civile Professionnelle',
    'Autorisation parentale obligatoire',
    'Devis ou contrat avant chaque mission',
    'Communication régulière avec les familles',
];

export default function ProfessionalFramework() {
  return (
    <section id="framework" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card shadow-lg border">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl">Un cadre professionnel et rassurant</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <ShieldCheck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                          <span className="text-muted-foreground">{item}</span>
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
