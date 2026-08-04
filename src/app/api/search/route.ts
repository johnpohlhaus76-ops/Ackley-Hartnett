import { NextRequest, NextResponse } from 'next/server';
import { search, SearchResult } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const type = searchParams.getAll('type') as any[];
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!q || q.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters',
      });
    }

    const results: SearchResult[] = search(q, {
      limit,
      types: type.length > 0 ? type : undefined,
      filters: {
        country: country || undefined,
      },
    });

    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, types, filters, limit } = body;

    const results = search(q, { types, filters, limit });

    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
