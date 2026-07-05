import PageShell from '@/components/page-shell';
import MentionsLegales from '@/components/mentions-legales';

export const metadata = {
  title: 'Mentions Légales - Passerelle Jeunesse',
  description: 'Mentions légales et informations réglementaires du site Passerelle Jeunesse',
};

export default function MentionsLegalesPage() {
  return (
    <PageShell>
      <MentionsLegales />
    </PageShell>
  );
}
