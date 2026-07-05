import PageShell from '@/components/page-shell';
import Contact from '@/components/contact';

export const metadata = {
  title: 'Contact - Passerelle Jeunesse',
  description: 'Contactez Passerelle Jeunesse pour une demande de devis ou d’information sur nos services.',
};

export default function ContactPage() {
  return (
    <PageShell>
      <Contact />
    </PageShell>
  );
}
