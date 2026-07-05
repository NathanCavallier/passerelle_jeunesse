import PageShell from '@/components/page-shell';
import CGV from '@/components/cgv';

export const metadata = {
  title: 'Conditions Générales de Vente - Passerelle Jeunesse',
  description: 'Conditions générales de vente des services d\'accompagnement Passerelle Jeunesse',
};

export default function CGVPage() {
  return (
    <PageShell>
      <CGV />
    </PageShell>
  );
}
