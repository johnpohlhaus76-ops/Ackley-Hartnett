import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getDocument } from '@/lib/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const doc = getDocument(id);
      if (!doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json(doc);
    }

    const documents = getDocuments();
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to get documents', details: error?.message },
      { status: 500 }
    );
  }
}
