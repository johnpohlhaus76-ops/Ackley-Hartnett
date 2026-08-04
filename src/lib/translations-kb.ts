import { Anthropic } from '@anthropic-ai/sdk';

const client = new Anthropic();

export type Language = 'en' | 'zh' | 'th' | 'vi' | 'ko' | 'ja';

export const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  zh: { name: '中文', flag: '🇨🇳' },
  th: { name: 'ไทย', flag: '🇹🇭' },
  vi: { name: 'Việt Nam', flag: '🇻🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  ja: { name: '日本語', flag: '🇯🇵' },
};

const LANGUAGE_PROMPTS: Record<Language, string> = {
  en: 'Keep in English',
  zh: 'Translate to Simplified Chinese',
  th: 'Translate to Thai',
  vi: 'Translate to Vietnamese',
  ko: 'Translate to Korean',
  ja: 'Translate to Japanese',
};

export async function translateText(text: string, targetLanguage: Language): Promise<string> {
  if (targetLanguage === 'en') return text;
  if (!text || text.length < 5) return text;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${LANGUAGE_PROMPTS[targetLanguage]} the following text, preserving formatting:\n\n${text}`,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : text;
  } catch (error) {
    console.error(`Translation to ${targetLanguage} failed:`, error);
    return text;
  }
}

export async function translateQuestion(question: string, targetLanguage: Language): Promise<string> {
  if (targetLanguage === 'en') return question;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `${LANGUAGE_PROMPTS[targetLanguage]}: ${question}`,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : question;
  } catch (error) {
    console.error(`Question translation failed:`, error);
    return question;
  }
}

export function getLanguageName(lang: Language): string {
  return LANGUAGES[lang]?.name || 'English';
}

export function getLanguageFlag(lang: Language): string {
  return LANGUAGES[lang]?.flag || '🌐';
}
