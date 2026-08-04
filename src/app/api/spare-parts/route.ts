import { NextRequest, NextResponse } from 'next/server';
import {
  getPartsByModel,
  getInventoryByLocation,
  getLowStockAlerts,
  estimatePartAvailability,
} from '@/lib/spare-parts';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'by-model') {
      const model = searchParams.get('model');
      if (!model) return NextResponse.json({ error: 'model required' }, { status: 400 });
      const parts = getPartsByModel(model);
      return NextResponse.json({ parts });
    }

    if (action === 'by-location') {
      const locationId = searchParams.get('locationId');
      if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 });
      const inventory = getInventoryByLocation(locationId);
      return NextResponse.json({ inventory });
    }

    if (action === 'low-stock-alerts') {
      const alerts = getLowStockAlerts();
      return NextResponse.json({ alerts, count: alerts.length });
    }

    if (action === 'check-availability') {
      const partId = searchParams.get('partId');
      const quantity = parseInt(searchParams.get('quantity') || '1');
      if (!partId) return NextResponse.json({ error: 'partId required' }, { status: 400 });
      const availability = estimatePartAvailability(partId, quantity);
      return NextResponse.json(availability);
    }

    return NextResponse.json({ error: 'action parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Spare parts error:', error);
    return NextResponse.json(
      { error: 'Spare parts lookup failed' },
      { status: 500 }
    );
  }
}
