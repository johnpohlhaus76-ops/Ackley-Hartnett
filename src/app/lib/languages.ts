export const LANGUAGES = {
  en: { name: 'English', native: 'English', flag: '🇺🇸' },
  de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  zh: { name: 'Chinese', native: '中文', flag: '🇨🇳' },
  ja: { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  th: { name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
  vi: { name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  ko: { name: 'Korean', native: '한국어', flag: '🇰🇷' },
  gsw: { name: 'Swiss German', native: 'Schweizerdeutsch', flag: '🇨🇭' },
  pt: { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  bn: { name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  nl: { name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
