import { NextRequest, NextResponse } from 'next/server';
import { getHealthScore, calculateBulkHealthScores } from '@/lib/health-score';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const bulk = searchParams.get('bulk') === 'true';

    // Return bulk scores by default if no customerId provided
    if (bulk || !customerId) {
      const scores = calculateBulkHealthScores();
      return NextResponse.json({
        success: true,
        scores,
        total: scores.length,
        timestamp: new Date().toISOString()
      });
    }

    const score = getHealthScore(customerId);
    return NextResponse.json({
      success: true,
      score,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health score error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}
