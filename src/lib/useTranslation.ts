'use client';

import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = context.translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : (defaultValue || key);
  };

  return {
    t,
    language: context.language,
    setLanguage: context.setLanguage,
    languages: context.languages,
  };
}
