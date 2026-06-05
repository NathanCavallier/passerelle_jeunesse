/**
 * Page "Le Projet" — Passerelle Jeunesse
 * Présente la vision en 3 phases et les pôles futurs
 * À créer dans : src/app/le-projet/page.tsx
 */

import Header from '@/components/header';
import Footer from '@/components/footer';
import ProjectVision from '@/components/project-vision';

export const metadata = {
  title: 'Le Projet — Passerelle Jeunesse',
  description:
    'Découvrez la vision et la feuille de route de Passerelle Jeunesse : de l\'accompagnement mobilité vers un centre jeunesse multifonction.',
};

export default function LeProjetPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <ProjectVision />
      </main>
      <Footer />
    </div>
  );
}
