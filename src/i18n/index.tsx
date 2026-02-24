/**
 * Système d'internationalisation (i18n)
 * Support français (défaut) et allemand (Luxembourg)
 * 
 * Usage:
 *   const { t, locale, setLocale } = useI18n();
 *   t('common.login') → "Se connecter" (fr) / "Anmelden" (de)
 *   t('footer.copyright', { year: 2025 }) → "© 2025 Passerelle Jeunesse..."
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import fr from './locales/fr.json';
import de from './locales/de.json';

export type Locale = 'fr' | 'de';

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const dictionaries: Record<Locale, Record<string, any>> = { fr, de };

const DEFAULT_LOCALE: Locale = 'fr';
const LOCALE_STORAGE_KEY = 'pj-locale';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

/**
 * Résout une clé imbriquée dans un dictionnaire
 * Ex: getNestedValue(dict, 'common.login') → dict.common.login
 */
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpole les paramètres dans une chaîne
 * Ex: interpolate("© {year} PJ", { year: 2025 }) → "© 2025 PJ"
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Charger la locale depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
      if (saved && dictionaries[saved]) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // SSR ou localStorage indisponible
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!dictionaries[newLocale]) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // localStorage indisponible
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Chercher dans la locale active, puis fallback en français
    const value = getNestedValue(dictionaries[locale], key) 
      ?? getNestedValue(dictionaries[DEFAULT_LOCALE], key)
      ?? key;
    return interpolate(value, params);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook pour utiliser l'internationalisation
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook pour récupérer uniquement la fonction de traduction (léger)
 */
export function useTranslation() {
  const { t } = useI18n();
  return t;
}
