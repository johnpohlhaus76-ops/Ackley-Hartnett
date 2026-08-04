import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface UpdateQuoteRequest {
  estimateId: string; // Quote ID
  status?: 'sent' | 'accepted' | 'rejected' | 'expired';
  totalPrice?: number;
  notes?: string;
  customer?: string;
  items?: any[];
  expiryDate?: string;
}

function getQuotesPath() {
  const paths = [
    join(process.cwd(), 'public', 'data', 'quotes-2025.json'),
    '/Users/ptg/Ackley-Hartnett/public/data/quotes-2025.json',
  ];
  return paths.find((p) => existsSync(p)) || paths[0];
}

export async function POST(request: Request) {
  try {
    const body: UpdateQuoteRequest = await request.json();

    if (!body.estimateId) {
      return Response.json(
        { success: false, error: 'estimateId is required' },
        { status: 400 }
      );
    }

    const quotesPath = getQuotesPath();
    const quotes = JSON.parse(readFileSync(quotesPath, 'utf-8'));

    const quoteIndex = quotes.findIndex((q: any) => q.Estimate === body.estimateId);

    if (quoteIndex === -1) {
      return Response.json(
        { success: false, error: `Quote ${body.estimateId} not found` },
        { status: 404 }
      );
    }

    const originalQuote = quotes[quoteIndex];

    // Update fields
    if (body.status) quotes[quoteIndex].Status = body.status;
    if (body.totalPrice !== undefined) quotes[quoteIndex]['Total Price'] = body.totalPrice;
    if (body.notes !== undefined) quotes[quoteIndex].Notes = body.notes;
    if (body.customer) quotes[quoteIndex].Customer = body.customer;
    if (body.items) quotes[quoteIndex].items = body.items;
    if (body.expiryDate) quotes[quoteIndex]['Expiry Date'] = body.expiryDate;

    // Add update timestamp
    quotes[quoteIndex].lastUpdated = new Date().toISOString();

    // Write back to file
    writeFileSync(quotesPath, JSON.stringify(quotes, null, 2));

    return Response.json({
      success: true,
      message: `Quote ${body.estimateId} updated successfully`,
      previousValues: originalQuote,
      updatedValues: quotes[quoteIndex],
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
    message: 'Quote Update API',
    usage: {
      method: 'POST',
      body: {
        estimateId: 'string (required)',
        status: 'sent | accepted | rejected | expired',
        totalPrice: 'number',
        notes: 'string',
        customer: 'string',
        items: 'array',
        expiryDate: 'string (YYYY-MM-DD)',
      },
      example: {
        estimateId: '12345',
        status: 'accepted',
        totalPrice: 5500,
        notes: 'Customer approved, waiting signature',
      },
    },
  });
}
