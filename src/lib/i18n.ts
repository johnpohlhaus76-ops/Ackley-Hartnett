export const LANGUAGES = {
  en: { name: 'English', native: 'English', flag: '🇺🇸' },
  'zh-CN': { name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
  'zh-TW': { name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼' },
  ja: { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', native: '한국어', flag: '🇰🇷' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇸🇦', rtl: true },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  it: { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  vi: { name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  id: { name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  tl: { name: 'Filipino', native: 'Tagalog', flag: '🇵🇭' },
  'sg-EN': { name: 'Singaporean English', native: 'Singapore English', flag: '🇸🇬' },
  th: { name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  el: { name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷' },
  hi: { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  bn: { name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
} as const;

export type Language = keyof typeof LANGUAGES;
export const DEFAULT_LANGUAGE: Language = 'en';
