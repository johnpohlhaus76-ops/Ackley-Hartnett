'use client'

import { useState } from 'react'

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void
  currentLanguage: string
}

const LANGUAGES = {
  'en': { name: 'English', flag: '🇺🇸' },
  'zh': { name: '中文 (Chinese)', flag: '🇨🇳' },
  'ar': { name: 'العربية (Arabic)', flag: '🇸🇦' },
  'fr': { name: 'Français (French)', flag: '🇫🇷' },
  'de': { name: 'Deutsch (German)', flag: '🇩🇪' },
  'es': { name: 'Español (Spanish)', flag: '🇪🇸' },
  'ja': { name: '日本語 (Japanese)', flag: '🇯🇵' },
  'ko': { name: '한국어 (Korean)', flag: '🇰🇷' },
  'pt': { name: 'Português (Portuguese)', flag: '🇵🇹' },
  'ru': { name: 'Русский (Russian)', flag: '🇷🇺' },
  'it': { name: 'Italiano (Italian)', flag: '🇮🇹' },
  'nl': { name: 'Nederlands (Dutch)', flag: '🇳🇱' },
  'tr': { name: 'Türkçe (Turkish)', flag: '🇹🇷' },
  'vi': { name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  'id': { name: 'Bahasa Indonesia', flag: '🇮🇩' },
  'th': { name: 'ไทย (Thai)', flag: '🇹🇭' }
}

export default function LanguageSelector({ onLanguageChange, currentLanguage }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (lang: string) => {
    onLanguageChange(lang)
    setIsOpen(false)
  }

  const currentLang = LANGUAGES[currentLanguage as keyof typeof LANGUAGES] || LANGUAGES['en']

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 font-semibold text-gray-800 transition"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <span className="text-gray-600">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64 max-h-96 overflow-y-auto">
          {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition ${
                currentLanguage === code ? 'bg-blue-100 font-bold text-blue-700' : 'text-gray-800'
              }`}
            >
              <span className="mr-2">{flag}</span>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
