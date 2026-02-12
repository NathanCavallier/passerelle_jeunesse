import Header from '@/components/header';
import Footer from '@/components/footer';
import CGV from '@/components/cgv';

export const metadata = {
  title: 'Conditions Générales de Vente - Passerelle Jeunesse',
  description: 'Conditions générales de vente des services d\'accompagnement Passerelle Jeunesse',
};

export default function CGVPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <CGV />
      </main>
      <Footer />
    </div>
  );
}
