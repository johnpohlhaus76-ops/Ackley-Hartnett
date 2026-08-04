import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function getMachinesPath() {
  const paths = [
    join(process.cwd(), 'public', 'data', 'machines-sold.json'),
    '/Users/ptg/Ackley-Hartnett/public/data/machines-sold.json',
  ];
  return paths.find((p) => existsSync(p)) || paths[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json

    const machinesPath = getMachinesPath();
    const orders = JSON.parse(readFileSync(machinesPath, 'utf-8'));

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Serial Number', 'Customer', 'Status', 'Model', 'Shipped', 'Country'];
      const csvRows = orders.map((o: any) =>
        [
          o['Serial Number'],
          o.Customer,
          o.status || 'pending',
          o.Description || o.model || '',
          o.Shipped || '',
          o.Country || '',
        ]
          .map((v) => `"${v}"`)
          .join(',')
      );

      const csv = [headers.join(','), ...csvRows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="orders-export.csv"',
        },
      });
    } else {
      // Return JSON
      return Response.json({
        success: true,
        totalRecords: orders.length,
        data: orders,
        exportDate: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
