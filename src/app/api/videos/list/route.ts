import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: 'videos/',
      limit: 100,
    });

    const videos = blobs.map((blob) => ({
      name: blob.pathname.replace('videos/', ''),
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list videos' }, { status: 500 });
  }
}
