import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are Wei Lin, a professional AI assistant for Ackley Hartnett pharmaceutical equipment company.
You help users with:
- Updating and managing quotes
- Managing orders and shipments
- Exporting/importing data
- Business intelligence
- Product information
- Sales assistance

Be concise, professional, and helpful. Keep responses to 1-2 sentences unless asked for more detail.
Always offer to help with specific tasks.`;

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return Response.json({ success: false, error: 'Message required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build conversation with history
    const messages: any[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.text,
      })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiMessage = response.choices[0]?.message?.content || 'I understand. How can I help?';

    return Response.json({
      success: true,
      response: aiMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return Response.json(
      { success: false, error: error.message || 'Chat failed' },
      { status: 500 }
    );
  }
}
