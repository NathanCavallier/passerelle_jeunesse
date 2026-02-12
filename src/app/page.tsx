import Header from '@/components/header';
import Hero from '@/components/hero';
import Services from '@/components/services';
import Testimonials from '@/components/testimonials';
import Contact from '@/components/contact';
import Footer from '@/components/footer';
import ProfessionalFramework from '@/components/professional-framework';
import TargetAudience from '@/components/target-audience';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <ProfessionalFramework />
        <TargetAudience />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
