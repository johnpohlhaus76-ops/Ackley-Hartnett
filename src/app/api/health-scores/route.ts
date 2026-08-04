import { NextRequest, NextResponse } from 'next/server';
import { getHealthScore, calculateBulkHealthScores } from '@/lib/health-score';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const bulk = searchParams.get('bulk') === 'true';

    if (bulk) {
      const scores = calculateBulkHealthScores();
      return NextResponse.json({ scores });
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId required' },
        { status: 400 }
      );
    }

    const score = getHealthScore(customerId);
    return NextResponse.json({ score });
  } catch (error) {
    console.error('Health score error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}
