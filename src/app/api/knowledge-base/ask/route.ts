import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion, searchDocuments } from '@/lib/knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Get relevant documents first
    const relevantDocs = searchDocuments(question, 5);
    const answer = await answerQuestion(question);

    return NextResponse.json({
      success: true,
      question,
      answer,
      relevantDocuments: relevantDocs.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        summary: d.summary,
      })),
    });
  } catch (error: any) {
    console.error('Ask error:', error);
    return NextResponse.json(
      { error: 'Failed to answer question', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST a question to ask the knowledge base',
    example: { question: 'What are the specifications?' },
  });
}
