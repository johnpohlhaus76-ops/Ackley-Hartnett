import { NextRequest, NextResponse } from 'next/server'

// Kyle's system prompt - Machine Selection Expert
const KYLE_SYSTEM_PROMPT = `You are Kyle, Ackley Hartnett's Machine Selection Expert.

Your role:
- Help customers select the right Ackley machine for their needs
- Answer questions about machine specifications, pricing, and features
- Compare Ackley offerings to competitors objectively
- Provide ROI justification for equipment purchases
- Reference customer success stories and market data

Key Ackley Machines:
- Delta: $171,600, 50,000-70,000 pph (Ink Printing)
- VIP: $161,260, 50,000-60,000 pph (Universal Platform)
- Servo Drum: $404,560, 120,000 pph (High-Speed)
- H-Track: 120,000-180,000 pph (Ultra-High-Speed)
- GPS: 180,000-225,000 pph (Ultra-High-Speed)
- Cantilever Ramp: 250,000 pph (High-Speed Ramp)
- IBM/Model B: $394,872, 250,000-300,000 pph (Industrial)
- Adjustable Ramp: 800,000 pph (Fastest)

Top Competitors:
- CMS Laser (USA): TD-140 at 140,000 pph - HIGH THREAT
- Qualicaps (Japan): QUALIS-Pro with 3D inspection - MODERATE-HIGH THREAT
- Enclony (Korea): 400,000 pph UV laser - MODERATE THREAT
- Yenchen (Taiwan): 20,000-30,000 pph - MODERATE THREAT
- Ceres Wuhan (China): 50,000 pph - MODERATE (price competitor)
- Tri-Star (USA): UV laser specialist - LOW THREAT
- Printing International (Belgium): Pad printing (not laser) - LOW THREAT

Ackley Advantages:
- Complete integrated solutions (printing + drilling + inspection)
- NIR spectroscopy (unique technology)
- 50+ years pharmaceutical expertise
- US-based service and support
- Full cGMP/FDA documentation
- Large installed base at major pharma companies

When answering:
1. Ask clarifying questions about their needs (volume, precision, product type)
2. Recommend specific Ackley models
3. Compare to competitors when relevant
4. Provide pricing and ROI information
5. Reference customer examples

Tone: Friendly, expert, consultative - help them make the best decision

Always be honest about strengths and weaknesses.`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Format conversation history for context
    const formattedHistory = conversationHistory
      .map((msg: any) => `${msg.role === 'user' ? 'Customer' : 'Kyle'}: ${msg.content}`)
      .join('\n')

    // For now, return a helpful response based on keywords
    // In production, this would call Claude API or another LLM
    const response = generateKyleResponse(message, formattedHistory)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Kyle API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateKyleResponse(message: string, history: string): string {
  const lower = message.toLowerCase()

  // Machine selection responses
  if (lower.includes('500') || lower.includes('high volume')) {
    return `Great question! For 500,000+ tablets per hour, I'd recommend our top-tier machines:

1. **Adjustable Ramp** - 800,000 pph (Our fastest!)
2. **Model C** - 300,000 pph
3. **IBM/Model B** - 250,000-300,000 pph ($394,872)

These are designed for ultra-high-speed pharmaceutical production. The Adjustable Ramp is particularly popular with major pharmaceutical companies for high-volume branded drugs.

What specific application are you looking at? (ink printing, laser marking, drilling?) This will help me narrow down the best option.`
  }

  if (lower.includes('vip') && (lower.includes('compare') || lower.includes('vs') || lower.includes('competitor'))) {
    return `Excellent question! Our VIP platform is unique because it integrates printing, vision inspection, and rejection all-in-one.

**VIP Advantages:**
- Speed: 50,000-60,000 pph
- Complete turnkey solution (feeding + printing + inspection)
- Recipe-driven changeover
- Full validation packages
- Price: $161,260

**vs. CMS TD-140** (highest competitor threat):
- CMS is faster (140,000 pph) but drilling-only
- VIP is more versatile (printing + inspection)
- VIP has better pharmaceutical validation support

**vs. Qualicaps QUALIS-Pro** (newest competitor):
- Qualicaps just launched 3D inspection integration (Nov 2025)
- VIP has proven track record with major pharma
- Both offer similar speeds (~50-400K pph range)

The choice depends on your specific needs. Are you looking for printing, drilling, or integrated solutions?`
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
    return `Here's our pricing for key Ackley machines:

**Ink Printing:**
- Delta: $171,600 (50-70K pph)
- VIP: $161,260 (50-60K pph)
- Servo Drum: $404,560 (120K pph)

**Industrial/High-Speed:**
- IBM/Model B: $394,872 (250-300K pph)
- Adjustable Ramp: Custom pricing (800K pph)

**R&D/Lab:**
- R&D Laser: $160,160 (5K pph)

The total cost includes the equipment plus validation documentation (IQ/OQ/PQ) which is critical for pharmaceutical manufacturing.

What's your production volume requirement? This will help me recommend the most cost-effective option.`
  }

  if (lower.includes('oros') || lower.includes('laser drill') || lower.includes('controlled release')) {
    return `Perfect! OROS (osmotic pump technology) applications are where Ackley really shines.

Our **VIP Laser Drill + NIR** system is the industry standard for OROS:
- Precision drilling up to 60,000 pph
- NIR spectroscopy verifies membrane integrity BEFORE drilling
- Prevents catastrophic batch failures
- Used by major customers: Janssen (Concerta), Catalent, Pfizer

**Why we're the best for OROS:**
- Industry's ONLY system with NIR spectroscopy
- 50+ years OROS experience
- Full pharmaceutical validation support
- Proven reliability with billions of OROS tablets

**Competitors:**
- CMS TD-140: Faster (140K pph) but no NIR - riskier
- Yenchen: Cheaper but slower (20-30K pph)
- Qualicaps: New QUALIS-Pro system, unproven in field

For OROS, NIR spectroscopy is critical. It's not just about speed - it's about preventing batch failures.

What OROS drug are you manufacturing? I can provide customer references.`
  }

  if (lower.includes('cylinder') || lower.includes('caplet') || lower.includes('softgel')) {
    return `Great! Different tablet shapes have different requirements.

**For Cylinders/Capsules:**
- VIP Platform is ideal (can handle multiple shapes)
- Servo Drum for high-volume (120K pph)

**For Softgels:**
- Requires UV laser to avoid damage (no heat)
- Qualicaps Qualis Lite CO2 is their specialty
- Our UV laser systems can also handle this

**For Caplets:**
- H-Track or GPS for high-volume
- or Cantilever Ramp for flexible speed

Each product type has unique challenges. Tell me:
1. How many tablets/hour?
2. Current product type?
3. Color/coating challenges?

This helps me recommend the perfect machine.`
  }

  // Default helpful response
  return `Great question! I'd love to help you find the right Ackley machine.

To give you the best recommendation, I need to understand:
1. **Production volume:** How many tablets/hour? (e.g., 100K, 500K, 800K+)
2. **Technology:** Ink printing, laser marking, laser drilling, or integrated?
3. **Product type:** Tablets, capsules, softgels? Any special coatings?
4. **Application:** Generic drugs, branded pharmaceuticals, OROS controlled-release?
5. **Budget/Timeline:** Rough budget range?

With this info, I can recommend specific Ackley models and compare them to competitors.

Or ask me about:
- Specific machine specs
- Competitor comparisons
- Pricing and ROI
- Customer references
- Technical specifications`
}
