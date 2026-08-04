import { NextResponse } from 'next/server';
import { getSmartAlerts, getAlertStats } from '@/lib/smart-alerts';

export async function GET() {
  try {
    const alerts = getSmartAlerts();
    const stats = getAlertStats();

    return NextResponse.json({
      alerts,
      stats,
    });
  } catch (error) {
    console.error('Smart alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to load smart alerts' },
      { status: 500 }
    );
  }
}
