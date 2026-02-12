'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import Logo from './logo';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const navLinks = [
  { href: '/#services', label: 'Services' },
  { href: '/about', label: 'À propos' },
  { href: '/safety', label: 'Cadre & Sécurité' },
  { href: '/pricing', label: 'Tarifs' },
  { href: '/#testimonials', label: 'Témoignages' },
  { href: '/#contact', label: 'Contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'bg-background/80 shadow-md backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
        
        {/* Navigation desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Boutons d'authentification - Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">
                <User className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Inscription</Link>
              </Button>
            </>
          )}
        </div>

        {/* Menu mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Link href="/">
                  <Logo />
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                
                {/* Boutons d'authentification - Mobile */}
                <div className="flex flex-col gap-3 border-t pt-6">
                  {isAuthenticated ? (
                    <Button asChild className="w-full">
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">Connexion</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/signup">Inscription</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
