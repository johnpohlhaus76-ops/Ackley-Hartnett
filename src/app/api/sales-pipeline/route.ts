import { NextResponse } from 'next/server';
import { getSalesPipeline, getPipelineMetrics } from '@/lib/sales-pipeline';

export async function GET() {
  try {
    const pipeline = getSalesPipeline();
    const metrics = getPipelineMetrics();

    return NextResponse.json({
      pipeline,
      metrics,
    });
  } catch (error) {
    console.error('Sales pipeline error:', error);
    return NextResponse.json(
      { error: 'Failed to load sales pipeline' },
      { status: 500 }
    );
  }
}
