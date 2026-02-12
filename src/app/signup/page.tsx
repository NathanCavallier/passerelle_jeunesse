import Header from '@/components/header';
import Footer from '@/components/footer';
import SignupForm from '@/components/auth/signup-form';

export const metadata = {
  title: 'Créer un compte - Passerelle Jeunesse',
  description: 'Créez votre compte Passerelle Jeunesse gratuitement',
};

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <SignupForm />
      </main>
      <Footer />
    </div>
  );
}
