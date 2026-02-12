import Header from '@/components/header';
import Footer from '@/components/footer';
import FAQ from '@/components/faq';

export const metadata = {
  title: 'FAQ - Passerelle Jeunesse',
  description: 'Questions fréquentes sur nos services d\'accompagnement pour jeunes de 7 à 20 ans',
};

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
