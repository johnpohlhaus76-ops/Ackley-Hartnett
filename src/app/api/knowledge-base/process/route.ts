import { NextRequest, NextResponse } from 'next/server';
import { addDocument } from '@/lib/knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { title, type, url, transcript, description } = await request.json();

    if (!title || !type || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, url' },
        { status: 400 }
      );
    }

    const content = transcript || description || '';
    const doc = await addDocument(title, type, url, content, transcript);

    return NextResponse.json({
      success: true,
      document: doc,
    });
  } catch (error: any) {
    console.error('Process document error:', error);
    return NextResponse.json(
      { error: 'Failed to process document', details: error?.message },
      { status: 500 }
    );
  }
}
