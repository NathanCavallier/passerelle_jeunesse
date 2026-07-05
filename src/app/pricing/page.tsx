import PageShell from '@/components/page-shell';
import Pricing from '@/components/pricing';

export const metadata = {
  title: 'Tarifs - Passerelle Jeunesse',
  description: 'Consultez les tarifs de Passerelle Jeunesse pour l’accompagnement, la mobilité et les services jeunesse.',
};

export default function PricingPage() {
  return (
    <PageShell>
      <Pricing />
    </PageShell>
  );
}
