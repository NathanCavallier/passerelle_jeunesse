import PageShell from '@/components/page-shell';
import About from '@/components/about';

export const metadata = {
  title: 'À propos - Passerelle Jeunesse',
  description: 'Passerelle Jeunesse propose de l’accompagnement et de la mobilité sécurisée pour les jeunes et leurs familles.',
};

export default function AboutPage() {
  return (
    <PageShell>
      <About />
    </PageShell>
  );
}
