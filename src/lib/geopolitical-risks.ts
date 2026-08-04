// Geopolitical Risk & Conflict Tracking
// Middle East tensions, supply chain impact, commodity correlations

export interface ConflictZone {
  id: string;
  region: string;
  countries: string[];
  status: 'active' | 'simmering' | 'escalating' | 'de-escalating';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  keyPlayers: string[];
  timeline: {
    date: string;
    event: string;
    impact: string;
  }[];
  supplyChainImpact: {
    affected: string[];
    riskFactors: string[];
  };
}

export interface GeopoliticalData {
  conflicts: ConflictZone[];
  riskMap: Record<string, number>; // Country -> risk score 0-100
  shippingRoutes: {
    name: string;
    status: 'open' | 'restricted' | 'closed';
    risk: number;
    alternatives: string[];
    volume: string;
  }[];
  commodityCorrelation: {
    commodity: string;
    priceImpact: number; // % impact when tensions rise
    primaryRegion: string;
    basePrice: number;
    crisisPrice: number;
  }[];
  timestamp: string;
}

export function getGeopoliticalConflicts(): ConflictZone[] {
  const now = new Date();

  return [
    {
      id: 'iran-us-israel',
      region: 'Iran-Israel-US Tensions',
      countries: ['Iran', 'Israel', 'USA', 'Saudi Arabia', 'UAE'],
      status: 'escalating',
      riskLevel: 'critical',
      description: 'Ongoing proxy conflicts, nuclear program tensions, regional power struggle',
      keyPlayers: [
        'Islamic Republic of Iran',
        'State of Israel',
        'United States',
        'Saudi Arabia',
        'UAE',
        'Hezbollah',
        'Hamas',
        'Houthis (Yemen)',
      ],
      timeline: [
        {
          date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Drone and missile attacks reported',
          impact: 'Oil prices spike 2-3%, shipping insurance increases',
        },
        {
          date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Naval exercises in Persian Gulf',
          impact: 'Strait of Hormuz transit concerns, natural gas supplies affected',
        },
        {
          date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Regional meeting diplomatic efforts',
          impact: 'Temporary de-escalation, oil prices stabilize',
        },
      ],
      supplyChainImpact: {
        affected: ['Oil', 'Natural Gas', 'LNG', 'Shipping Insurance', 'Port Operations'],
        riskFactors: [
          'Strait of Hormuz bottleneck (35% global oil)',
          'Nuclear escalation uncertainty',
          'Proxy force coordination',
          'Naval blockade risks',
        ],
      },
    },
    {
      id: 'saudi-iran-rivalry',
      region: 'Saudi Arabia-Iran Rivalry',
      countries: ['Saudi Arabia', 'Iran', 'Yemen', 'Lebanon', 'Syria', 'Iraq'],
      status: 'simmering',
      riskLevel: 'high',
      description: 'Sunni-Shia power struggle, proxy wars, oil market dominance competition',
      keyPlayers: [
        'Saudi Arabia (ARAMCO)',
        'Islamic Republic of Iran',
        'Yemen Houthis',
        'Iraqi militias',
        'Lebanese Hezbollah',
        'Syria Assad regime',
      ],
      timeline: [
        {
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'OPEC+ meeting tensions over production cuts',
          impact: 'Oil price volatility, market uncertainty',
        },
        {
          date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Port of Hodeidah humanitarian concerns',
          impact: 'Food/medicine access limited, global aid costs increase',
        },
        {
          date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Oil tanker attacks in Red Sea',
          impact: 'Shipping routes rerouted (longer, costlier), insurance spikes',
        },
      ],
      supplyChainImpact: {
        affected: ['Oil', 'Shipping Routes', 'Port Operations', 'Humanitarian Goods'],
        riskFactors: [
          'Red Sea piracy & blockade',
          'Yemen humanitarian crisis',
          'Oil production capacity control',
          'OPEC coordination breakdown',
        ],
      },
    },
    {
      id: 'israel-palestine-hamas',
      region: 'Israel-Palestine Conflict',
      countries: ['Israel', 'Palestine', 'Gaza', 'West Bank', 'Egypt', 'Jordan'],
      status: 'active',
      riskLevel: 'high',
      description: 'Israeli-Palestinian tensions, Gaza humanitarian crisis, regional polarization',
      keyPlayers: [
        'State of Israel',
        'Palestine Authority',
        'Hamas',
        'Palestinian Factions',
        'Egypt',
        'Jordan',
        'Arab States',
      ],
      timeline: [
        {
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Ceasefire negotiations ongoing',
          impact: 'Commodity markets await clarity, shipping premiums steady',
        },
        {
          date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Cross-border escalations reported',
          impact: 'Regional tensions spike, investor risk appetite declines',
        },
        {
          date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Humanitarian aid corridors established',
          impact: 'Partial relief, but structural issues remain',
        },
      ],
      supplyChainImpact: {
        affected: ['Humanitarian Goods', 'Construction Materials', 'Medical Supplies'],
        riskFactors: [
          'Gaza access restrictions',
          'Port and border closures',
          'Regional anti-Israel sentiment',
          'US aid coordination',
        ],
      },
    },
    {
      id: 'uae-iran-tensions',
      region: 'UAE-Iran Maritime Disputes',
      countries: ['UAE', 'Iran', 'Qatar', 'Bahrain', 'Saudi Arabia'],
      status: 'simmering',
      riskLevel: 'medium',
      description: 'Islands sovereignty disputes, maritime boundaries, naval presence',
      keyPlayers: [
        'United Arab Emirates',
        'Islamic Republic of Iran',
        'Qatar',
        'Bahrain',
        'GCC Coalition',
      ],
      timeline: [
        {
          date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Joint GCC maritime patrols',
          impact: 'Deterrent messaging, no direct market impact yet',
        },
        {
          date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Iranian naval exercises near disputed islands',
          impact: 'Increased insurance costs for Gulf shipping',
        },
      ],
      supplyChainImpact: {
        affected: ['LNG from Qatar', 'Port Operations', 'Shipping Insurance'],
        riskFactors: [
          'Strategic island control',
          'Naval escalation risks',
          'Qatar gas exports disruption potential',
        ],
      },
    },
    {
      id: 'egypt-suez-canal',
      region: 'Egypt Suez Canal Security',
      countries: ['Egypt', 'Israel', 'Saudi Arabia'],
      status: 'simmering',
      riskLevel: 'high',
      description: 'Critical shipping chokepoint, regional spillover from conflicts, piracy concerns',
      keyPlayers: ['Egypt', 'Suez Canal Authority', 'Regional naval forces', 'International shipping'],
      timeline: [
        {
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'No incidents reported, transit normal',
          impact: 'Global shipping flows freely, 12% of world trade',
        },
        {
          date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Security drills conducted',
          impact: 'Precautionary measures, minimal disruption',
        },
        {
          date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Regional tensions spike monitoring',
          impact: 'Insurance premiums increase by 2-5%',
        },
      ],
      supplyChainImpact: {
        affected: [
          'All containerized cargo',
          'Oil shipments',
          'LNG',
          'Agricultural exports',
          'Automotive trade',
        ],
        riskFactors: [
          '12% of global trade transits daily',
          'Vessel jam-up cascade risk',
          'Economic domino effect',
        ],
      },
    },
    {
      id: 'yemen-oman-red-sea',
      region: 'Yemen-Oman Red Sea Piracy',
      countries: ['Yemen', 'Oman', 'Saudi Arabia', 'Egypt'],
      status: 'active',
      riskLevel: 'high',
      description: 'Houthi maritime attacks, piracy, shipping route closures, humanitarian crisis',
      keyPlayers: ['Yemen Houthis', 'Oman', 'Saudi Arabia', 'International shipping'],
      timeline: [
        {
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Vessels redirected around Cape of Good Hope',
          impact: '+15 days transit time, +$50-100k additional fuel per vessel',
        },
        {
          date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Container ship attacked, cargo disrupted',
          impact: 'Shipping insurance spikes 3-5%, costs passed to consumers',
        },
        {
          date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'International naval presence increased',
          impact: 'Partial stabilization, but threat persists',
        },
      ],
      supplyChainImpact: {
        affected: ['All Red Sea shipping', 'Suez Canal alternatives', 'Shipping insurance'],
        riskFactors: [
          'Houthi drone/missile capability',
          'Longer reroute (Africa circumnavigation)',
          'Increased fuel consumption',
          'Container equipment stranded',
        ],
      },
    },
  ];
}

export function getGeopoliticalRiskScores(): Record<string, number> {
  return {
    Iran: 85,
    Israel: 80,
    'Saudi Arabia': 65,
    UAE: 50,
    Egypt: 55,
    Yemen: 90,
    Lebanon: 75,
    Syria: 80,
    Iraq: 70,
    Oman: 35,
    Qatar: 45,
    Bahrain: 50,
    Jordan: 40,
    'United States': 30,
  };
}

export function getShippingRouteStatus() {
  return [
    {
      name: 'Strait of Hormuz (Iran-Oman)',
      status: 'open' as const,
      risk: 85,
      alternatives: ['Suez Canal', 'Red Sea/Indian Ocean'],
      volume: '35% global oil exports',
    },
    {
      name: 'Suez Canal (Egypt)',
      status: 'open' as const,
      risk: 65,
      alternatives: ['Cape of Good Hope (Africa)'],
      volume: '12% global trade',
    },
    {
      name: 'Red Sea (Yemen-Saudi-Egypt)',
      status: 'restricted' as const,
      risk: 80,
      alternatives: ['Reroute to Africa route (+15 days)'],
      volume: '10-12% global shipping',
    },
    {
      name: 'Persian Gulf (UAE-Qatar-Bahrain)',
      status: 'open' as const,
      risk: 70,
      alternatives: ['LNG reroute to Asia'],
      volume: 'LNG, oil, petrochemicals',
    },
  ];
}

export function getCommodityCorrelations() {
  return [
    {
      commodity: 'Crude Oil (Brent)',
      priceImpact: 3.5, // % per crisis escalation
      primaryRegion: 'Middle East',
      basePrice: 78.45,
      crisisPrice: 85.0,
    },
    {
      commodity: 'Natural Gas (Henry Hub)',
      priceImpact: 2.1,
      primaryRegion: 'Middle East / US',
      basePrice: 2.65,
      crisisPrice: 2.8,
    },
    {
      commodity: 'Shipping Insurance',
      priceImpact: 4.0,
      primaryRegion: 'Red Sea / Suez',
      basePrice: 100,
      crisisPrice: 140,
    },
    {
      commodity: 'Copper',
      priceImpact: 1.2,
      primaryRegion: 'Global supply chain',
      basePrice: 3.95,
      crisisPrice: 4.0,
    },
  ];
}

export function getGeopoliticalData(): GeopoliticalData {
  return {
    conflicts: getGeopoliticalConflicts(),
    riskMap: getGeopoliticalRiskScores(),
    shippingRoutes: getShippingRouteStatus(),
    commodityCorrelation: getCommodityCorrelations(),
    timestamp: new Date().toISOString(),
  };
}
