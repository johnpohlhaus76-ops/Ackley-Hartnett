import { NextResponse } from 'next/server';
import { getPlantMetrics, getPlantPerformanceStats } from '@/lib/plant-performance';

export async function GET() {
  try {
    const metrics = getPlantMetrics();
    const stats = getPlantPerformanceStats();

    return NextResponse.json({
      metrics,
      stats,
    });
  } catch (error) {
    console.error('Plant performance error:', error);
    return NextResponse.json(
      { error: 'Failed to load plant metrics' },
      { status: 500 }
    );
  }
}
