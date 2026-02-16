/**
 * Page de messagerie temps réel
 * Communication complète entre parents et accompagnateurs
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ChatInterface } from '@/components/messages/chat-interface';
import { TestModeBanner } from '@/components/testing/test-mode-banner';
import { Loader2 } from 'lucide-react';

export default function MessagesPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <TestModeBanner />
            
            <main className="container mx-auto max-w-7xl">
                <div className="h-[calc(100vh-8rem)] border rounded-lg bg-background shadow-sm overflow-hidden">
                    <ChatInterface 
                        onBack={() => router.push('/dashboard')}
                    />
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
