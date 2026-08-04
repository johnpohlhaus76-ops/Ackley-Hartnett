export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return Response.json({ success: false, error: 'Text required' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return Response.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'rachel';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return Response.json(
        { success: false, error: 'Text-to-speech conversion failed' },
        { status: response.status }
      );
    }

    // Return audio as blob
    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Speak error:', error);
    return Response.json(
      { success: false, error: error.message || 'Speech generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    success: true,
    message: 'Wei Lin Text-to-Speech API',
    usage: 'POST with { text: "your message" }',
    returns: 'MP3 audio stream',
  });
}
