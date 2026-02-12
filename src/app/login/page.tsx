import Header from '@/components/header';
import Footer from '@/components/footer';
import LoginForm from '@/components/auth/login-form';

export const metadata = {
  title: 'Connexion - Passerelle Jeunesse',
  description: 'Connectez-vous à votre compte Passerelle Jeunesse',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
