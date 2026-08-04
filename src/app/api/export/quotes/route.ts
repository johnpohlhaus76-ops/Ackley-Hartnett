import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function getQuotesPath() {
  const paths = [
    join(process.cwd(), 'public', 'data', 'quotes-2025.json'),
    '/Users/ptg/Ackley-Hartnett/public/data/quotes-2025.json',
  ];
  return paths.find((p) => existsSync(p)) || paths[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json

    const quotesPath = getQuotesPath();
    const quotes = JSON.parse(readFileSync(quotesPath, 'utf-8'));

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Estimate', 'Customer', 'Status', 'Total Price', 'Quote Date'];
      const csvRows = quotes.map((q: any) =>
        [q.Estimate, q.Customer, q.Status, q['Total Price'], q['Quote Date']].map((v) => `"${v}"`).join(',')
      );

      const csv = [headers.join(','), ...csvRows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="quotes-export.csv"',
        },
      });
    } else {
      // Return JSON
      return Response.json({
        success: true,
        totalRecords: quotes.length,
        data: quotes,
        exportDate: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
