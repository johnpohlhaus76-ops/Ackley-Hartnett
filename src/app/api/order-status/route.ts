import { NextResponse } from 'next/server';
import { getOrderStatuses, getStatusStats } from '@/lib/order-status';

export async function GET() {
  try {
    const statuses = getOrderStatuses();
    const stats = getStatusStats();

    return NextResponse.json({
      statuses,
      stats,
    });
  } catch (error) {
    console.error('Order status error:', error);
    return NextResponse.json(
      { error: 'Failed to load order statuses' },
      { status: 500 }
    );
  }
}
