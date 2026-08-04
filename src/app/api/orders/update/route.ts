import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface UpdateOrderRequest {
  orderId: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customer?: string;
  totalValue?: number;
  shipDate?: string;
  expectedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
}

function getMachinesPath() {
  const paths = [
    join(process.cwd(), 'public', 'data', 'machines-sold.json'),
    '/Users/ptg/Ackley-Hartnett/public/data/machines-sold.json',
  ];
  return paths.find((p) => existsSync(p)) || paths[0];
}

export async function POST(request: Request) {
  try {
    const body: UpdateOrderRequest = await request.json();

    if (!body.orderId) {
      return Response.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const machinesPath = getMachinesPath();
    const machines = JSON.parse(readFileSync(machinesPath, 'utf-8'));

    const orderIndex = machines.findIndex(
      (m: any) => m['Serial Number'] === body.orderId || m.id === body.orderId
    );

    if (orderIndex === -1) {
      return Response.json(
        { success: false, error: `Order ${body.orderId} not found` },
        { status: 404 }
      );
    }

    const originalOrder = machines[orderIndex];

    // Update fields
    if (body.status) machines[orderIndex].status = body.status;
    if (body.customer) machines[orderIndex].Customer = body.customer;
    if (body.totalValue !== undefined) machines[orderIndex].totalValue = body.totalValue;
    if (body.shipDate) machines[orderIndex].Shipped = body.shipDate;
    if (body.expectedDelivery) machines[orderIndex].expectedDelivery = body.expectedDelivery;
    if (body.trackingNumber) machines[orderIndex].trackingNumber = body.trackingNumber;
    if (body.notes) machines[orderIndex].notes = body.notes;

    // Add update timestamp
    machines[orderIndex].lastUpdated = new Date().toISOString();

    // Write back to file
    writeFileSync(machinesPath, JSON.stringify(machines, null, 2));

    return Response.json({
      success: true,
      message: `Order ${body.orderId} updated successfully`,
      previousValues: originalOrder,
      updatedValues: machines[orderIndex],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return Response.json({
    success: true,
    message: 'Order Update API',
    usage: {
      method: 'POST',
      body: {
        orderId: 'string (required)',
        status: 'pending | confirmed | processing | shipped | delivered | cancelled',
        customer: 'string',
        totalValue: 'number',
        shipDate: 'string (YYYY-MM-DD)',
        expectedDelivery: 'string (YYYY-MM-DD)',
        trackingNumber: 'string',
        notes: 'string',
      },
      example: {
        orderId: '12345',
        status: 'shipped',
        trackingNumber: 'FDX987654321',
        expectedDelivery: '2026-08-10',
      },
    },
  });
}
