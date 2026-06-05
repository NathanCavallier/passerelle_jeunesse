import Header from '@/components/header';
import Hero from '@/components/hero';
import HomepageVisionSection from '@/components/homepage-vision-section';
import PolesGrid from '@/components/poles-grid';
import Testimonials from '@/components/testimonials';
import Contact from '@/components/contact';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <HomepageVisionSection />
        <PolesGrid />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
