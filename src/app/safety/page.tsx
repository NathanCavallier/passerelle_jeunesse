import PageShell from '@/components/page-shell';
import Safety from '@/components/safety';

export const metadata = {
  title: 'Sécurité - Passerelle Jeunesse',
  description: 'Découvrez les engagements de sécurité et les bonnes pratiques de Passerelle Jeunesse pour accompagner les jeunes.',
};

export default function SafetyPage() {
  return (
    <PageShell>
      <Safety />
    </PageShell>
  );
}
