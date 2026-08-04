import { NextRequest, NextResponse } from 'next/server';

const activeSessions = new Map<string, Set<string>>();

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Initialize session if it doesn't exist
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Set());
    }

    const session = activeSessions.get(sessionId)!;
    const participantId = `participant_${Date.now()}`;
    session.add(participantId);

    // For WebSocket support, we would use Vercel Functions WebSocket support
    // For now, return session info
    return NextResponse.json({
      sessionId,
      participantId,
      participants: Array.from(session),
      message: 'Screen share session active. Use this session ID to connect other users.',
    });
  } catch (error: any) {
    console.error('Screen share error:', error);
    return NextResponse.json(
      { error: 'Failed to create screen share session', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, action, participant } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    let session = activeSessions.get(sessionId);
    if (!session) {
      session = new Set();
      activeSessions.set(sessionId, session);
    }

    if (action === 'join' && participant) {
      session.add(participant);
    } else if (action === 'leave' && participant) {
      session.delete(participant);
      if (session.size === 0) {
        activeSessions.delete(sessionId);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      participants: Array.from(session),
    });
  } catch (error: any) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: error?.message },
      { status: 500 }
    );
  }
}
