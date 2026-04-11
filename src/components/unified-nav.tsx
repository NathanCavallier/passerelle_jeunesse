'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export type AppType = 'portfolio' | 'passerelle' | 'imutask';

interface UnifiedNavProps {
  currentApp?: AppType;
  showLogin?: boolean;
  isAuthenticated?: boolean;
}

const APPS = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    href: 'https://portfolio.imogo.org',
  },
  {
    id: 'passerelle',
    name: 'Jeunesse',
    href: 'https://jeunesse.imogo.org',
  },
  {
    id: 'imutask',
    name: 'ImuTask',
    href: 'https://imutask.imogo.org',
  }
];

export function UnifiedNav({
  currentApp = 'passerelle',
  showLogin = true,
  isAuthenticated = false
}: UnifiedNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeApp = APPS.find(app => app.id === currentApp);

  return (
    <nav className="w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="https://imogo.org" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
            <span className="hidden sm:inline">IMOGO</span>
          </Link>

          {/* Desktop Apps Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {APPS.map((app) => (
              <a
                key={app.id}
                href={app.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeApp?.id === app.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                )}
              >
                {app.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-2">
            {showLogin && (
              <>
                {isAuthenticated ? (
                  <a
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Dashboard
                  </a>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                    >
                      Connexion
                    </a>
                    <a
                      href="/signup"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Inscription
                    </a>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {APPS.map((app) => (
              <a
                key={app.id}
                href={app.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeApp?.id === app.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                )}
              >
                {app.name}
              </a>
            ))}
            {showLogin && !isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <a
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center text-foreground/70 hover:text-foreground transition-colors"
                >
                  Connexion
                </a>
                <a
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Inscription
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
