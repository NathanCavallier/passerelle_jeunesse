import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'Passerelle Jeunesse | Accompagnement & Mobilité pour Jeunes',
  description: 'Service professionnel d\'accompagnement et de transport pour jeunes. Sécurité, bienveillance et confiance au service des familles et organisations.',
  keywords: ['accompagnement jeunes', 'transport scolaire', 'mobilité enfants', 'garde d\'enfants', 'sécurité', 'Metz', 'Lorraine'],
  authors: [{ name: 'Passerelle Jeunesse' }],
  creator: 'Passerelle Jeunesse',
  publisher: 'Passerelle Jeunesse',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://jeunesse.imogo.org',
    title: 'Passerelle Jeunesse | Accompagnement & Mobilité pour Jeunes',
    description: 'Service professionnel d\'accompagnement et de transport pour jeunes.',
    siteName: 'Passerelle Jeunesse',
    images: [
      {
        url: '/images/logo.png',
        width: 1024,
        height: 1024,
        alt: 'Passerelle Jeunesse Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Passerelle Jeunesse',
    description: 'Service professionnel d\'accompagnement et de transport pour jeunes.',
    images: ['/images/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="1024x1024" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("font-body antialiased")}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
