import { NextRequest, NextResponse } from 'next/server';
import { synthesizeAvatarVideo, HEYGEN_AVATARS, HEYGEN_VOICES } from '@/lib/heygen-client';

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'english' } = await request.json();

    if (!text || typeof text !== 'string' || text.length === 0) {
      return NextResponse.json(
        { error: 'Text content required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    const videoUrl = await synthesizeAvatarVideo(text, {
      avatarId: HEYGEN_AVATARS.wei_lin.id,
      language,
      voiceId: HEYGEN_VOICES[language as keyof typeof HEYGEN_VOICES] || HEYGEN_VOICES.english,
    });

    return NextResponse.json(
      {
        success: true,
        videoUrl,
        language,
        text,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar video' },
      { status: 500 }
    );
  }
}
