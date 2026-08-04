import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_AVATAR_ID = process.env.HEYGEN_AVATAR_ID;

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'english' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    if (!HEYGEN_API_KEY || !HEYGEN_AVATAR_ID) {
      return NextResponse.json({ error: 'HeyGen not configured' }, { status: 500 });
    }

    // Generate video using HeyGen API v2
    const response = await axios.post(
      'https://api.heygen.com/v2/video.generate',
      {
        test: false,
        caption: false,
        dimension: {
          width: 3840,
          height: 2160,
        },
        duration: Math.ceil(text.split(' ').length / 3),
        persona: {
          avatar_id: HEYGEN_AVATAR_ID,
          voice: {
            voice_id: '9BWtsMINqrJLrRacOk9x',
          },
        },
        script: {
          type: 'text',
          input: text,
        },
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const videoUrl = response.data.data?.video_url || response.data.video_url;
    const videoId = response.data.data?.video_id || response.data.video_id;

    if (!videoUrl && !videoId) {
      throw new Error('No video URL returned from HeyGen');
    }

    // If we only have video_id, construct the URL
    const finalUrl = videoUrl || `https://stream.heygen.ai/videos/${videoId}`;

    return NextResponse.json({
      success: true,
      videoUrl: finalUrl,
      videoId: videoId,
      text,
      language,
    });
  } catch (error: any) {
    console.error('HeyGen error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return NextResponse.json(
      {
        error: 'Failed to generate avatar video',
        details: error.response?.data?.message || error.message,
      },
      { status: 500 }
    );
  }
}
