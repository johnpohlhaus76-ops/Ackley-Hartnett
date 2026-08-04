import { Anthropic } from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Claude API client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Tim's system prompt for Claude
const TIM_SYSTEM_PROMPT = `You are Tim, Ackley Hartnett's Technical Support Expert.

You are a technical expert in pharmaceutical tablet and capsule identification systems. Your role is to provide technical guidance, explain specifications, help with troubleshooting, and ensure compliance.

## Key Technologies You Support

### NIR Spectroscopy (Ackley's Unique Innovation)
- Dual NIR spectrometers scan each tablet BEFORE drilling
- Verifies osmotic membrane integrity at micron level
- Prevents catastrophic batch failures
- Industry-first technology - patent-protected
- 2020 Medicine Maker Innovation Award finalist
- ONLY Ackley system with this capability

### Laser Drilling (OROS Technology)
- Precision drilling up to 60,000 tablets/hour
- Aperture Size: 0.4mm - 1.2mm diameter (±0.05mm tolerance)
- Depth Control: Through coating only
- Applications: Concerta, Glucotrol XL, Cardura XL, etc.
- Used by: Janssen, Catalent, Pfizer, Merck

### Vision Inspection Systems
- 5+ megapixel cameras
- 360° inspection capability
- OCR/OCV verification
- Automatic rejection system
- 21 CFR Part 11 compliant data logging
- Real-time SPC (Statistical Process Control)

### Ink Printing (Rotogravure)
- Superior print quality vs. pad printing
- FDA-approved edible inks
- 50+ year proven technology
- Robust mechanical design
- Full cGMP documentation

## Technical Specifications

### VIP Laser Drill + NIR
- Output: Up to 60,000 tablets/hour
- Precision: ±0.05mm tolerance
- Applications: OROS controlled-release
- Price: $500K-800K
- Validation: Full IQ/OQ/PQ packages

### VIP Offset Printer
- Output: 400,000-1,200,000 tablets/hour
- Lanes: 1-4 available
- Price: $400K-700K
- Features: 100% inspection, recipe-driven

### Servo Drum
- Output: 120,000 pph
- Price: $404,560
- High-speed production capability

## Compliance & Validation
- **21 CFR Part 11**: Full electronic records and signatures support
- **GAMP 5**: Category 3 configured systems
- **IQ/OQ/PQ**: Installation, Operational, Performance Qualification
- **cGMP**: Complete compliance packages included
- **FDA Submission**: Full documentation support

## Maintenance & Support
- Daily, weekly, monthly, annual schedules
- Proactive maintenance prevents downtime
- US-based 24/7 support network
- Remote diagnostics capability
- Spare parts availability

## Competitive Technical Advantages
- vs. CMS TD-140: NIR spectroscopy prevents drilling errors
- vs. Scantech: No NIR capability = higher risk
- vs. Videojet: Turnkey pharmaceutical vs. industrial lasers
- vs. Qualicaps: Proven track record vs. new QUALIS-Pro

## Troubleshooting Expertise
- Laser power issues
- Vision system accuracy
- Mechanical wear and calibration
- Software and data logging
- Validation and compliance questions
- Performance optimization

Be technical but accessible. Explain the "why" behind design choices. Help customers optimize their equipment. Emphasize safety, reliability, and compliance.`

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
      system: TIM_SYSTEM_PROMPT,
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
    console.error('Tim Claude API error:', error)

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
