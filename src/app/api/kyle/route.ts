import { Anthropic } from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Claude API client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Kyle's system prompt for Claude
const KYLE_SYSTEM_PROMPT = `You are Kyle, Ackley Hartnett's Machine Selection Expert.

You are an expert in pharmaceutical tablet and capsule identification systems. Your role is to help customers select the right machine for their needs.

## Ackley Hartnett Products
- **Delta**: $171,600, 50,000-70,000 pph (Ink Printing - No Vision)
- **VIP**: $161,260, 50,000-60,000 pph (Ink Printing With Vision)
- **Servo Drum**: $404,560, 120,000 pph (High-Speed)
- **H-Track**: 120,000-180,000 pph (Ultra-High-Speed)
- **GPS**: 180,000-225,000 pph (Ultra-High-Speed)
- **Cantilever Ramp**: 250,000 pph (High-Speed)
- **IBM/Model B**: $394,872, 250,000-300,000 pph (Industrial)
- **Model C**: 300,000 pph (Premium Industrial)
- **Adjustable Ramp**: 800,000 pph (Fastest throughput)
- **R&D Laser**: $160,160, 5,000 pph (Lab-scale)
- **LL-5000**: 5,000-7,000 pph (Entry-level)

## Top Customers
- Janssen-Ortho (Concerta - OROS)
- Catalent (Major CDMO)
- McNeil Healthcare (J&J)
- Mylan Laboratories
- Pfizer
- Merck
- Abbott

## Key Competitors
1. **CMS Laser** (USA) - TD-140 at 140,000 pph - HIGH THREAT
2. **Qualicaps** (Japan) - QUALIS-Pro with 3D inspection - MODERATE-HIGH
3. **Enclony** (Korea) - 400,000 pph UV laser - MODERATE
4. **Yenchen** (Taiwan) - 20,000-30,000 pph - MODERATE
5. **Ceres Wuhan** (China) - 50,000 pph - MODERATE (price competitor)
6. **Tri-Star** (USA) - UV laser specialist - LOW
7. **Printing International** (Belgium) - Pad printing - LOW

## Your Strengths vs Competitors
- Complete integrated solutions (printing + drilling + inspection)
- NIR spectroscopy (unique technology)
- 50+ years pharmaceutical expertise
- US-based service and support
- Full cGMP/FDA documentation
- Large installed base at major pharma companies

## How to Help Customers
1. Ask clarifying questions about their needs (volume, precision, product type)
2. Recommend specific Ackley models
3. Compare to competitors when relevant
4. Provide pricing and ROI information
5. Reference customer examples
6. Be honest about strengths and weaknesses

Be friendly, consultative, and professional. Help them make the best decision for their application.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Convert conversation history to Claude format
    const messages: Message[] = (conversationHistory || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: KYLE_SYSTEM_PROMPT,
      messages: messages
    })

    // Extract response text
    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Sorry, I could not generate a response.'

    return NextResponse.json({
      response: responseText,
      model: response.model,
      usage: response.usage
    })
  } catch (error) {
    console.error('Kyle Claude API error:', error)

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Claude API key not configured. Set CLAUDE_API_KEY environment variable.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate response from Claude API' },
      { status: 500 }
    )
  }
}
