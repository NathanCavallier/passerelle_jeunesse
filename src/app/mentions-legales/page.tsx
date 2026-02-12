import Header from '@/components/header';
import Footer from '@/components/footer';
import MentionsLegales from '@/components/mentions-legales';

export const metadata = {
  title: 'Mentions Légales - Passerelle Jeunesse',
  description: 'Mentions légales et informations réglementaires du site Passerelle Jeunesse',
};

export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <MentionsLegales />
      </main>
      <Footer />
    </div>
  );
}
