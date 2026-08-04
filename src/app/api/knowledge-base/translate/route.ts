import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

type Language = 'en' | 'zh' | 'th' | 'vi' | 'ko' | 'ja';

const LANGUAGE_PROMPTS: Record<Language, string> = {
  en: 'Keep in English',
  zh: 'Translate to Simplified Chinese',
  th: 'Translate to Thai',
  vi: 'Translate to Vietnamese',
  ko: 'Translate to Korean',
  ja: 'Translate to Japanese',
};

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and targetLanguage required' },
        { status: 400 }
      );
    }

    if (targetLanguage === 'en' || !text || text.length < 5) {
      return NextResponse.json({ translatedText: text });
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${LANGUAGE_PROMPTS[targetLanguage as Language]} the following text, preserving formatting:\n\n${text}`,
        },
      ],
    });

    const translatedText = response.content[0].type === 'text' ? response.content[0].text : text;

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error?.message },
      { status: 500 }
    );
  }
}
