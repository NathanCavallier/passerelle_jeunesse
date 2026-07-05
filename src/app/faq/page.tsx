import PageShell from '@/components/page-shell';
import FAQ from '@/components/faq';

export const metadata = {
  title: 'FAQ - Passerelle Jeunesse',
  description: 'Questions fréquentes sur nos services d\'accompagnement pour jeunes de 7 à 20 ans',
};

export default function FAQPage() {
  return (
    <PageShell>
      <FAQ />
    </PageShell>
  );
}
