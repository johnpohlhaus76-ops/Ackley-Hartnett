import { NextRequest, NextResponse } from 'next/server'

// Tim's system prompt - Technical Support Expert
const TIM_SYSTEM_PROMPT = `You are Tim, Ackley Hartnett's Technical Support Expert.

Your role:
- Provide technical specifications and maintenance guidance
- Troubleshoot machine issues and performance problems
- Explain how machines work and design advantages
- Guide customers on 21 CFR Part 11 and validation requirements
- Compare Ackley technical advantages to competitors
- Reference manuals and technical documentation

Ackley Technical Specialties:
1. **NIR Spectroscopy** (Unique to Ackley Laser Drill)
   - Verifies osmotic membrane integrity BEFORE drilling
   - Prevents catastrophic batch failures
   - 2020 Medicine Maker Innovation Award finalist

2. **Laser Drilling (OROS)**
   - Precision apertures: 0.4-1.2mm ± 0.05mm tolerance
   - Depth control: Through coating only
   - Output: Up to 60,000 tablets/hour
   - Industry standard for controlled-release

3. **Vision Inspection Systems**
   - 5+ megapixel cameras
   - 360° inspection capability
   - OCR/OCV verification
   - Automatic rejection
   - 21 CFR Part 11 compliant

4. **Ink Printing (Rotogravure)**
   - Superior print quality vs. pad printing
   - FDA-approved edible inks
   - 50+ year proven technology
   - Robust mechanical design

Competitive Technical Advantages:
- vs. CMS TD-140: NIR spectroscopy prevents drilling errors
- vs. Scantech Laser: No NIR capability - riskier
- vs. Videojet: Turnkey pharmaceutical systems vs. industrial lasers
- vs. Qualicaps: Proven track record vs. new technology (QUALIS-Pro)
- vs. Tri-Star: Purpose-built pharmaceutical vs. custom engineering

Compliance & Documentation:
- Full cGMP validation packages
- IQ/OQ/PQ documentation
- GAMP 5 compliance
- 21 CFR Part 11 data logging
- FDA submission support

When answering:
1. Provide technical accuracy
2. Explain the "why" behind design choices
3. Reference innovations and patents
4. Connect to compliance needs
5. Troubleshoot systematically

Tone: Technical but accessible, helpful, compliance-focused`

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
      .map((msg: any) => `${msg.role === 'user' ? 'Technician' : 'Tim'}: ${msg.content}`)
      .join('\n')

    // Generate Tim's response based on keywords
    const response = generateTimResponse(message, formattedHistory)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Tim API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateTimResponse(message: string, history: string): string {
  const lower = message.toLowerCase()

  // NIR Spectroscopy questions
  if (lower.includes('nir') || lower.includes('spectroscopy')) {
    return `Excellent question! NIR (Near-Infrared) Spectroscopy is Ackley's proprietary innovation in laser drilling.

**How it Works:**
- Dual NIR spectrometers scan each tablet BEFORE drilling
- Verifies osmotic membrane integrity
- Rejects tablets with membrane defects
- Prevents drilling defective tablets (saves entire batches)

**Why It Matters:**
- OROS tablets must have perfect membranes for controlled release
- A single defective tablet can cause batch failure
- NIR detects problems at the micron level
- Saves millions in validation rework

**Competitive Advantage:**
- Ackley: ONLY system with integrated NIR
- Scantech: No NIR - drilling errors missed until testing
- CMS/Yenchen: No NIR capability
- Qualicaps: New QUALIS-Pro has 3D inspection but different technology

**Awards:**
- 2020 Medicine Maker Innovation Award finalist
- Patent-protected process

This is why pharmaceutical companies choose Ackley for OROS - the risk prevention alone justifies the investment.`
  }

  if (lower.includes('vip') && (lower.includes('spec') || lower.includes('specification'))) {
    return `Perfect! Here are the technical specifications for the VIP Laser Drill + NIR:

**Drilling Specifications:**
- Technology: Precision CO2 laser drilling
- Maximum Output: 60,000 tablets/hour
- Aperture Size: 0.4mm - 1.2mm diameter
- Tolerance: ±0.05mm (extremely precise)
- Depth Control: Through coating only (doesn't penetrate core)

**Membrane Verification:**
- NIR Spectrometers: Dual units
- Detection: Osmotic membrane integrity
- Process: Pre-drilling verification
- Rejection: Automatic for defective tablets

**Vision Inspection:**
- Cameras: 5+ megapixel
- Coverage: 360° inspection capability
- Verification: 100% post-drill aperture verification
- Rejection: Automatic defect removal

**Data Logging:**
- 21 CFR Part 11 compliant
- Real-time SPC (Statistical Process Control)
- Recipe-driven operation
- Remote diagnostics capability

**Pharmaceutical Design:**
- Feeding: Precision automatic orientation
- Changeover: Recipe-driven (minutes vs. hours)
- Validation: Full IQ/OQ/PQ packages included
- Documentation: GAMP 5 compliant

**Performance:**
- Throughput: 60,000 tablets/hour for OROS
- Reliability: 24/7 production validated
- Service: US-based support network

Is there a specific spec you want to dive deeper on?`
  }

  if (lower.includes('maintenance') || lower.includes('schedule') || lower.includes('service')) {
    return `Great question! Proper maintenance ensures maximum uptime and reliability.

**Daily Maintenance:**
- Check laser cooling system temperature
- Inspect tablet feeding system for debris
- Clean vision system camera lenses
- Verify data logging system status

**Weekly Maintenance:**
- Clean all optics (laser windows, mirrors)
- Inspect aperture cleaning mechanisms
- Check fume extraction filters
- Test automatic rejection system

**Monthly Maintenance:**
- Full system inspection
- Lubrication of moving parts
- Calibration check on vision system
- Backup data logs

**Quarterly Maintenance:**
- CO2 laser tube inspection
- Cooling system deep clean
- Vision system recalibration
- Replace consumable filters

**Annual Validation:**
- Full IQ/OQ revalidation
- Regulatory documentation update
- Performance testing vs. baseline
- Safety system inspection

**Critical Components to Monitor:**
- CO2 Laser Power Output (degrades over time)
- Cooling System Efficiency
- Vision System Accuracy
- Mechanical Tolerances

For detailed maintenance schedules, refer to your machine manual or contact us for a maintenance plan customized to your production volume.

What maintenance issue are you experiencing?`
  }

  if (lower.includes('21 cfr') || lower.includes('compliance') || lower.includes('validation') || lower.includes('gamp')) {
    return `Excellent focus on compliance! Ackley machines are built for pharmaceutical regulatory requirements.

**21 CFR Part 11 Compliance:**
- Electronic Records & Signatures
- Ackley systems: Fully compliant
- Data Logging: Automated, tamper-proof
- Audit Trail: Complete user activity tracking
- Security: User authentication required

**GAMP 5 Compliance:**
- Good Automated Manufacturing Practice
- Ackley systems: Category 3 validation (configured)
- Documentation: IQ (Installation) / OQ (Operation) / PQ (Performance)
- Risk Assessment: Pre-validated risk analysis
- Lifecycle: Full software validation approach

**Validation Documentation Included:**
- Installation Qualification (IQ)
- Operational Qualification (OQ)
- Performance Qualification (PQ)
- Change Control Procedures
- Maintenance Validation

**FDA Submission Support:**
- We support your regulatory submissions
- Full traceability documentation
- Performance validation data
- Regulatory history

**Common Validation Questions:**
1. **Do you include validation?** Yes - full IQ/OQ/PQ packages
2. **How long is validation?** 3-6 months typically
3. **Can we use your validation for multiple sites?** Yes, with site-specific addendums
4. **What about method changes?** Change control documented

**Required from Your Side:**
- Raw data acceptance criteria
- Process parameters confirmation
- Training completion documentation
- Approved Procedures manual

Would you like help with your validation plan or have specific compliance concerns?`
  }

  if (lower.includes('troubleshoot') || lower.includes('error') || lower.includes('problem') || lower.includes('issue')) {
    return `Let me help troubleshoot! To diagnose the issue, I need more details:

**For Laser Drilling Issues:**
1. What's the symptom? (No drilling, inconsistent depth, poor quality)
2. What's your error message? (System codes help)
3. When did it start? (Suddenly or gradual)
4. Affected tablets - all or just some? (Batch-specific?)
5. Recent changes? (Maintenance, settings, operator)

**For Printing Issues:**
1. Print quality problem? (Fading, misalignment, color)
2. Speed reduced? (How much?)
3. Changeover time increased?
4. Ink circulation issues?

**For Vision Inspection Issues:**
1. Detection failures? (Missing defects)
2. False rejects? (Rejecting good tablets)
3. Camera focus problems?
4. Software errors?

**For General Performance:**
1. Is it a safety stop? (Red light)
2. Warning? (Yellow light)
3. Data logging errors?

Once you provide details, I can:
- Diagnose the root cause
- Recommend solutions
- Schedule service if needed
- Provide calibration procedures

What specific issue are you experiencing?`
  }

  if (lower.includes('competitor') || lower.includes('vs') || lower.includes('compare')) {
    return `Good question! Here's how Ackley compares technically:

**vs. CMS TD-140** (Highest Competitor)
- Their Speed: 140,000 pph (faster)
- Our Advantage: NIR spectroscopy (they lack this)
- Our advantage: Integrated inspection + rejection
- Their limitation: Drilling-only, not integrated

**vs. Scantech Laser** (China, Growing)
- Their Speed: 200,000 pph claimed
- Their Cost: 40-60% cheaper
- Our Advantage: NIR technology, pharmaceutical validation
- Our Track Record: 50+ years vs. their claims

**vs. Videojet** (Industrial Lasers)
- Their Application: Packaging marking
- Our Application: Bulk pharmaceutical printing
- Our Advantage: Turnkey pharmaceutical systems
- Their Limitation: Not optimized for loose tablets

**vs. Qualicaps QUALIS-Pro** (Newest Threat)
- Their Innovation: 3D inspection integration (Nov 2025)
- Our Advantage: Proven pharmaceutical track record
- Issue: QUALIS-Pro is brand new - unproven
- Our Strength: Millions of validated tablets

**Overall Technical Advantages:**
1. NIR Spectroscopy (unique)
2. Pharmaceutical-specific design
3. Full validation packages
4. 50+ year proven reliability
5. US manufacturing quality

The key difference: We're pharmaceutical specialists, not industrial laser providers.

Which competitor are you evaluating against?`
  }

  // Default response
  return `Great question! I'm here to help with technical details.

I can help with:
- **Machine Specifications:** VIP, Servo Drum, Laser Drill, Vision Systems
- **NIR Spectroscopy:** How it prevents batch failures
- **Maintenance:** Daily, weekly, monthly, annual schedules
- **Compliance:** 21 CFR Part 11, GAMP 5, validation packages
- **Troubleshooting:** Diagnostic steps for issues
- **Competitor Comparison:** Technical advantages vs. others
- **Performance Data:** Speed, precision, throughput
- **Regulatory Support:** FDA submissions, documentation

What technical aspect would you like to explore?

Or ask me:
- "What are VIP specs?"
- "How does NIR work?"
- "Maintenance schedule?"
- "How do we ensure compliance?"
- "How does Ackley compare to [competitor]?"
- "Troubleshoot [specific issue]?"

I'm here to help!`
}
