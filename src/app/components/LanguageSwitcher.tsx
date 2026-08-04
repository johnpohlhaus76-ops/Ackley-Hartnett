'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/lib/LanguageContext'
import { LANGUAGES, LanguageCode } from '@/app/lib/languages'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = LANGUAGES[language]

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.native}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code as LanguageCode)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  language === code
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.native}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
