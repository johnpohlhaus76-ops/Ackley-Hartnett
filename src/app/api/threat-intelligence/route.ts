import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 minute cache

async function getThreats() {
  const threats = [
    {
      name: "Russia-Ukraine War",
      severity: "critical",
      locations: ["Ukraine", "Russia", "Moldova"],
      description: "Ongoing conflict with significant military engagement. Black Sea blockade affecting global grain supplies. Drone warfare, artillery bombardment, potential nuclear escalation risk.",
      impact: "Oil +2.4%, Grain prices +15%, European energy crisis, Supply chain disruption",
      lastUpdate: new Date().toISOString(),
      casualties: "500K+",
      displacement: "6M+ refugees"
    },
    {
      name: "Iran-USA Tensions",
      severity: "high",
      locations: ["Iran", "USA", "Persian Gulf", "Strait of Hormuz"],
      description: "Escalating sanctions, proxy conflicts, drone attacks on tankers. Iran nuclear program negotiations stalled. US carrier presence heightened. Strait of Hormuz blockade threats affecting 21.4M barrels/day of oil.",
      impact: "Oil prices volatile, Insurance premiums +3%, Shipping delays +30%",
      lastUpdate: new Date().toISOString(),
      drones: "Houthi drone attacks on shipping +47%",
      tankerTraffic: "21.4M barrels/day at risk"
    },
    {
      name: "China-Taiwan Tensions",
      severity: "high",
      locations: ["Taiwan", "China", "South China Sea"],
      description: "Military exercises by China, Taiwan strait blockade threats. US support for Taiwan. Semiconductor supply chain at risk (TSMC). $3.4T annual trade through South China Sea.",
      impact: "Chip shortage risk, Electronics prices +8%, Tech stocks -2.3%",
      lastUpdate: new Date().toISOString(),
      chipSupply: "65% global advanced chips at risk",
      tradeRoute: "$3.4T/year at risk"
    },
    {
      name: "Israel-Hamas-Hezbollah",
      severity: "critical",
      locations: ["Israel", "Gaza", "Lebanon", "Syria"],
      description: "Active military operations, cross-border attacks, rocket fire. Potential regional escalation with Iran backing Hezbollah. Oil refinery risks in Bahrain, UAE.",
      impact: "Oil +3.2%, Defense stocks +2.1%, Regional destabilization",
      lastUpdate: new Date().toISOString(),
      casualties: "50K+ in Gaza",
      evacuation: "1.5M+ displaced"
    },
    {
      name: "Yemen Houthi Crisis",
      severity: "high",
      locations: ["Yemen", "Red Sea", "Suez Canal"],
      description: "Houthi drone and missile attacks on commercial shipping in Red Sea. Iran-backed militia targeting Israel-bound vessels. 12% of global trade transits Red Sea.",
      impact: "Shipping costs +40%, Suez transit delays, Insurance +5%",
      lastUpdate: new Date().toISOString(),
      attacks: "47 vessels attacked",
      delays: "Average 12 day route extension"
    },
    {
      name: "Saudi Arabia Regional Security",
      severity: "medium",
      locations: ["Saudi Arabia", "Yemen", "Persian Gulf"],
      description: "Oil infrastructure at risk from Houthi attacks and drone strikes. ARAMCO facilities threatened. OPEC+ production cuts create scarcity. Cybersecurity concerns.",
      impact: "Oil supply concerns, ARAMCO stock volatility, Energy prices",
      lastUpdate: new Date().toISOString(),
      production: "9M+ barrels/day at risk",
      costPerBarrel: "+$5-8 risk premium"
    }
  ];

  return threats;
}

export async function GET() {
  try {
    const threats = await getThreats();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      threats,
      summary: {
        criticalThreats: threats.filter(t => t.severity === "critical").length,
        highThreats: threats.filter(t => t.severity === "high").length,
        avgOilImpact: "+2.8%",
        affectedTrade: "$3.4T+ annually",
        keyChokepoints: [
          "Strait of Hormuz (21.4M barrels/day)",
          "Suez Canal (12% global trade)",
          "Taiwan Strait (65% advanced semiconductors)",
          "Black Sea (grain exports blocked)"
        ]
      },
      nextUpdate: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Threat intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threat intelligence' },
      { status: 500 }
    );
  }
}
