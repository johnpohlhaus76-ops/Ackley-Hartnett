import { NextResponse } from 'next/server';

export const revalidate = 3600;

const weiLinVideos: Record<string, any> = {
  'en': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'English' },
  'zh-CN': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: '简体中文' },
  'ja': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: '日本語' },
  'ko': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: '한국어' },
  'es': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'Español' },
  'fr': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'Français' },
  'de': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'Deutsch' },
  'ar': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'العربية' },
  'pt': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'Português' },
  'vi': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'Tiếng Việt' },
  'th': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'ไทย' },
  'id': { videoUrl: 'https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4', language: 'Bahasa Indonesia' },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const data = weiLinVideos[language] || weiLinVideos['en'];

    return NextResponse.json({
      success: true,
      language,
      videoUrl: data.videoUrl,
      languageName: data.language,
      quality: '4K',
      avatar: 'Wei Lin',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
