import Header from '@/components/header';
import Footer from '@/components/footer';
import Safety from '@/components/safety';

export default function SafetyPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Safety />
      </main>
      <Footer />
    </div>
  );
}
