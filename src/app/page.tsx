import PageShell from '@/components/page-shell';
import Hero from '@/components/hero';
import HomepageVisionSection from '@/components/homepage-vision-section';
import PolesGrid from '@/components/poles-grid';
import Testimonials from '@/components/testimonials';
import Contact from '@/components/contact';

export default function Home() {
  return (
    <PageShell>
      <Hero />
       <Testimonials />
      <Contact />
    </PageShell>
  );
}
