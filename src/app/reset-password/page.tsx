import Header from '@/components/header';
import Footer from '@/components/footer';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Réinitialiser le mot de passe - Passerelle Jeunesse',
  description: 'Réinitialisez votre mot de passe Passerelle Jeunesse',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <ResetPasswordForm />
      </main>
      <Footer />
    </div>
  );
}
