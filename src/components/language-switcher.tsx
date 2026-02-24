/**
 * Sélecteur de langue
 * Permet de basculer entre français et allemand
 */

'use client';

import { useI18n, SUPPORTED_LOCALES, type Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
  const { locale, setLocale } = useI18n();
  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLocale?.flag} {currentLocale?.label}</span>
          <span className="sm:hidden">{currentLocale?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className={locale === loc.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{loc.flag}</span>
            {loc.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
