import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceAlerts, getAlertsByCountry, getAlertStats } from '@/lib/maintenance-logic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'all';
    const country = searchParams.get('country');

    if (view === 'stats') {
      const stats = getAlertStats();
      return NextResponse.json(stats);
    }

    if (view === 'by-country') {
      const byCountry = getAlertsByCountry();
      return NextResponse.json(byCountry);
    }

    const alerts = getMaintenanceAlerts();
    const filtered = country ? alerts.filter((a) => a.country === country) : alerts;

    return NextResponse.json({
      alerts: filtered,
      count: filtered.length,
      total: alerts.length,
    });
  } catch (error) {
    console.error('Maintenance alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to load maintenance alerts' },
      { status: 500 }
    );
  }
}
