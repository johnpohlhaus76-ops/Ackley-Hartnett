'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LanguageCode, DEFAULT_LANGUAGE, LANGUAGES } from './languages'
import { translations } from './translations'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get language from localStorage or browser preference
    const saved = localStorage.getItem('language') as LanguageCode | null
    const browserLang = navigator.language.split('-')[0] as LanguageCode | null
    const lang = saved || (browserLang && browserLang in LANGUAGES ? browserLang : DEFAULT_LANGUAGE)
    setLanguageState(lang)
    setMounted(true)
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let current: any = translations[language]
    for (const k of keys) {
      current = current?.[k]
    }
    return current || key
  }

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
