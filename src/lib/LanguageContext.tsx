'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, DEFAULT_LANGUAGE, LANGUAGES } from './i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, any>;
  languages: typeof LANGUAGES;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && LANGUAGES[saved]) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadTranslations = async () => {
      try {
        const module = await import(`./translations/${language}.json`);
        setTranslations(module.default || {});
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        const fallback = await import('./translations/en.json');
        setTranslations(fallback.default || {});
      }
    };

    loadTranslations();
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}
