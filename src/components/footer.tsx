import Link from 'next/link';
import Logo from './logo';

const navLinks = [
  { href: '/poles', label: 'Services' },
  { href: '/about', label: 'À propos' },
  { href: '/safety', label: 'Cadre & Sécurité' },
  { href: '/pricing', label: 'Tarifs' },
  { href: '/avis', label: 'Témoignages' },
  { href: '/contact', label: 'Contact' },
];

const legalLinks = [
  { href: '/faq', label: 'FAQ' },
  { href: '/cgv', label: 'CGV' },
  { href: '/mentions-legales', label: 'Mentions légales' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/">
            <Logo isFooter />
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-background/70 transition-colors hover:text-background"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 border-t border-background/20 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-background/50 mb-4">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="transition-colors hover:text-background/80"
                >
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className="text-background/30">•</span>
                )}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-background/50">
            &copy; {currentYear} Passerelle Jeunesse. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
