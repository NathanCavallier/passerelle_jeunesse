'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import EditProfileForm from '@/components/profile/edit-profile-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-4"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au dashboard
              </Link>
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos informations personnelles et paramètres de sécurité
            </p>
          </div>

          {/* Formulaire */}
          <EditProfileForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
