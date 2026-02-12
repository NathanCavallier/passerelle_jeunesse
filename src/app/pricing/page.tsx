import Header from '@/components/header';
import Footer from '@/components/footer';
import Pricing from '@/components/pricing';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
