import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_BASE_URL = 'https://api.heygen.com/v1';

interface HeyGenAvatarConfig {
  avatarId: string;
  language: string;
  voiceId?: string;
}

interface HeyGenSessionResponse {
  data: {
    session_id: string;
    access_token: string;
    video_session_url?: string;
  };
}

interface HeyGenSynthResponse {
  data: {
    video_url: string;
    duration: number;
  };
}

export async function createHeyGenSession(
  config: HeyGenAvatarConfig
): Promise<{ sessionId: string; accessToken: string }> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  try {
    const response = await axios.post<HeyGenSessionResponse>(
      `${HEYGEN_BASE_URL}/interactive.sessions.new`,
      {
        version: 'QUALITY',
        avatar_id: config.avatarId,
        language: config.language,
        voice: {
          voice_id: config.voiceId || 'default',
        },
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      sessionId: response.data.data.session_id,
      accessToken: response.data.data.access_token,
    };
  } catch (error) {
    console.error('HeyGen session creation error:', error);
    throw new Error('Failed to create HeyGen session');
  }
}

export async function synthesizeAvatarVideo(
  text: string,
  config: HeyGenAvatarConfig
): Promise<string> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  try {
    const response = await axios.post<HeyGenSynthResponse>(
      `${HEYGEN_BASE_URL}/video.generate`,
      {
        aspect_ratio: '9:16',
        avatar_id: config.avatarId,
        caption: false,
        dimension: {
          width: 3840,
          height: 2160,
        },
        language: config.language,
        script: {
          type: 'text',
          content: text,
        },
        voice: {
          voice_id: config.voiceId || 'default',
        },
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.video_url;
  } catch (error) {
    console.error('HeyGen video synthesis error:', error);
    throw new Error('Failed to synthesize avatar video');
  }
}

export const HEYGEN_AVATARS = {
  wei_lin: {
    id: 'Avatar_4hm0xgihfx', // Asian female avatar (you'll need to replace with your actual HeyGen avatar ID)
    name: 'Wei Lin',
    description: 'Professional Asian Sales Representative',
  },
};

export const HEYGEN_VOICES = {
  english: 'en_us_c3po',
  chinese: 'zh_cn_female_01',
  japanese: 'ja_jp_female_01',
  korean: 'ko_kr_female_01',
  spanish: 'es_es_female_01',
  german: 'de_de_female_01',
  thai: 'th_th_female_01',
  vietnamese: 'vi_vn_female_01',
  italian: 'it_it_female_01',
  portuguese: 'pt_br_female_01',
};
