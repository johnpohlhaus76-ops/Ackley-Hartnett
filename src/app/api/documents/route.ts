import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/lib/document-generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const document = generateDocument({
      type: body.type || 'proposal',
      customer: body.customer,
      items: body.items || [],
      date: body.date,
      dueDate: body.dueDate,
      notes: body.notes,
      referenceNumber: body.referenceNumber,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}
