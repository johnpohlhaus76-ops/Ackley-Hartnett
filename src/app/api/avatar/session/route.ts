import { NextRequest, NextResponse } from 'next/server';
import { createHeyGenSession, HEYGEN_AVATARS } from '@/lib/heygen-client';

export async function POST(request: NextRequest) {
  try {
    const { language = 'english' } = await request.json();

    const session = await createHeyGenSession({
      avatarId: HEYGEN_AVATARS.wei_lin.id,
      language,
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: session.sessionId,
        accessToken: session.accessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create avatar session' },
      { status: 500 }
    );
  }
}
