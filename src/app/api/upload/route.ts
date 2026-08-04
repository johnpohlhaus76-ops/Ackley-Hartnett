import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: 100MB` },
        { status: 413 }
      );
    }

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    const prefix = isVideo ? 'videos/' : 'files/';
    const filename = `${prefix}${Date.now()}-${file.name}`;
    const result = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error('Upload error:', errorMsg);
    return NextResponse.json(
      { error: 'Upload failed', details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST a file to upload',
    maxSize: '100MB',
  });
}
