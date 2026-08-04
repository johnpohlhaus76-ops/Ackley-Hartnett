// Real-Time Vessel Tracking & Shipping Intelligence
// Strait of Hormuz, Red Sea, and critical shipping routes

export interface Vessel {
  id: string;
  name: string;
  type: 'tanker' | 'container' | 'bulk-carrier' | 'cargo';
  flag: string; // Ship's nationality
  position: {
    lat: number;
    lng: number;
  };
  destination: string;
  origin: string;
  speed: number; // knots
  cargo: string;
  cargoValue: number; // USD millions
  status: 'transit' | 'waiting' | 'diverted' | 'delayed';
  eta: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface ShippingCorridor {
  name: string;
  type: 'strait' | 'canal' | 'route';
  coordinates: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  dailyVolume: number; // Vessels per day
  tankerDaily: number; // Oil tankers per day
  containerDaily: number; // Container ships per day
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  avgTransitTime: number; // Hours
  alternativeRoute?: string;
  alternativeTransitTime?: number; // Hours
}

export interface MarketplaceData {
  timestamp: string;
  corridors: ShippingCorridor[];
  vessels: Vessel[];
  statistics: {
    totalVesselsTracked: number;
    totalCargoValue: number; // USD billions
    affectedVessels: number;
    diverted: number;
    delayed: number;
  };
}

export function getShippingCorridors(): ShippingCorridor[] {
  return [
    {
      name: 'Strait of Hormuz',
      type: 'strait',
      coordinates: {
        north: 26.5,
        south: 25.8,
        east: 57.0,
        west: 55.5,
      },
      dailyVolume: 287, // Vessels per day average
      tankerDaily: 95, // Oil tankers
      containerDaily: 65,
      riskLevel: 'critical',
      avgTransitTime: 24,
      alternativeRoute: 'via Suez Canal & Red Sea',
      alternativeTransitTime: 14 * 24, // 14 days
    },
    {
      name: 'Red Sea - Bab el-Mandeb',
      type: 'strait',
      coordinates: {
        north: 13.2,
        south: 12.5,
        east: 43.5,
        west: 42.8,
      },
      dailyVolume: 210,
      tankerDaily: 45,
      containerDaily: 85,
      riskLevel: 'high',
      avgTransitTime: 4,
      alternativeRoute: 'Cape of Good Hope',
      alternativeTransitTime: 7 * 24, // 7 days added
    },
    {
      name: 'Suez Canal',
      type: 'canal',
      coordinates: {
        north: 30.5,
        south: 29.5,
        east: 33.0,
        west: 31.9,
      },
      dailyVolume: 45,
      tankerDaily: 15,
      containerDaily: 20,
      riskLevel: 'medium',
      avgTransitTime: 12,
    },
    {
      name: 'Persian Gulf Exits',
      type: 'route',
      coordinates: {
        north: 27.0,
        south: 25.5,
        east: 56.5,
        west: 54.0,
      },
      dailyVolume: 350,
      tankerDaily: 130,
      containerDaily: 95,
      riskLevel: 'critical',
      avgTransitTime: 48,
    },
  ];
}

export function getTrackedVessels(): Vessel[] {
  const now = new Date();

  return [
    // Strait of Hormuz - Northbound
    {
      id: 'vessel_horn_001',
      name: 'Pacific Endeavor',
      type: 'tanker',
      flag: 'Panama',
      position: { lat: 26.1, lng: 56.2 },
      destination: 'Rotterdam, Netherlands',
      origin: 'Ras Tanura, Saudi Arabia',
      speed: 12.5,
      cargo: 'Crude Oil (300k barrels)',
      cargoValue: 25.2,
      status: 'transit',
      eta: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
      risk: 'high',
    },
    {
      id: 'vessel_horn_002',
      name: 'Global Trade Navigator',
      type: 'container',
      flag: 'Singapore',
      position: { lat: 26.15, lng: 56.5 },
      destination: 'Port Said, Egypt',
      origin: 'Jebel Ali, UAE',
      speed: 18.2,
      cargo: 'Electronics & Consumer Goods',
      cargoValue: 45.8,
      status: 'transit',
      eta: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
      risk: 'high',
    },
    {
      id: 'vessel_horn_003',
      name: 'Petromax Atlantic',
      type: 'tanker',
      flag: 'Marshall Islands',
      position: { lat: 26.0, lng: 55.9 },
      destination: 'Singapore',
      origin: 'Kharg Island, Iran',
      speed: 11.8,
      cargo: 'Light Crude (280k barrels)',
      cargoValue: 23.5,
      status: 'waiting',
      eta: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      risk: 'critical',
    },
    {
      id: 'vessel_horn_004',
      name: 'Emirates Bridge',
      type: 'bulk-carrier',
      flag: 'UAE',
      position: { lat: 26.2, lng: 56.8 },
      destination: 'Hambantota, Sri Lanka',
      origin: 'Fujairah, UAE',
      speed: 13.2,
      cargo: 'Grain & Agricultural Products',
      cargoValue: 12.4,
      status: 'transit',
      eta: new Date(now.getTime() + 96 * 60 * 60 * 1000).toISOString(),
      risk: 'medium',
    },

    // Red Sea Bound
    {
      id: 'vessel_red_001',
      name: 'Suez Express',
      type: 'container',
      flag: 'Egypt',
      position: { lat: 18.5, lng: 41.2 },
      destination: 'Port Said, Egypt',
      origin: 'Djibouti',
      speed: 19.5,
      cargo: 'Container Mix (8,500 TEU)',
      cargoValue: 68.9,
      status: 'transit',
      eta: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(),
      risk: 'high',
    },
    {
      id: 'vessel_red_002',
      name: 'Red Sea Guardian',
      type: 'tanker',
      flag: 'Saudi Arabia',
      position: { lat: 16.8, lng: 40.5 },
      destination: 'Suez Canal',
      origin: 'Jizan, Saudi Arabia',
      speed: 10.2,
      cargo: 'LNG & Petrochemicals',
      cargoValue: 34.2,
      status: 'transit',
      eta: new Date(now.getTime() + 42 * 60 * 60 * 1000).toISOString(),
      risk: 'high',
    },
    {
      id: 'vessel_red_003',
      name: 'Cape Explorer',
      type: 'container',
      flag: 'Denmark',
      position: { lat: 8.2, lng: 38.8 },
      destination: 'Singapore',
      origin: 'Singapore',
      speed: 17.8,
      cargo: 'Container Mix (12,000 TEU)',
      cargoValue: 92.3,
      status: 'diverted',
      eta: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      risk: 'critical',
    },

    // Suez Canal
    {
      id: 'vessel_suez_001',
      name: "Pharaoh's Pride",
      type: 'container',
      flag: 'Greece',
      position: { lat: 30.4, lng: 32.0 },
      destination: 'Hamburg, Germany',
      origin: 'Hong Kong',
      speed: 14.2,
      cargo: 'Container Mix (10,000 TEU)',
      cargoValue: 75.5,
      status: 'transit',
      eta: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
      risk: 'medium',
    },
    {
      id: 'vessel_suez_002',
      name: 'Nile Petroleum',
      type: 'tanker',
      flag: 'Greece',
      position: { lat: 30.1, lng: 32.2 },
      destination: 'Rotterdam',
      origin: 'Kuwait',
      speed: 12.0,
      cargo: 'Crude Oil (250k barrels)',
      cargoValue: 21.0,
      status: 'transit',
      eta: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      risk: 'medium',
    },
  ];
}

export function getVesselStatistics() {
  const vessels = getTrackedVessels();
  const corridors = getShippingCorridors();

  const totalVessels = vessels.length;
  const affectedVessels = vessels.filter((v) => v.risk === 'high' || v.risk === 'critical').length;
  const divertedVessels = vessels.filter((v) => v.status === 'diverted').length;
  const delayedVessels = vessels.filter((v) => v.status === 'delayed').length;

  const totalCargoValue = vessels.reduce((sum, v) => sum + v.cargoValue, 0);

  const tankers = vessels.filter((v) => v.type === 'tanker');
  const containers = vessels.filter((v) => v.type === 'container');

  const dailyTankerThroughput = corridors.reduce((sum, c) => sum + c.tankerDaily, 0);
  const dailyVolume = corridors.reduce((sum, c) => sum + c.dailyVolume, 0);

  const oilVolume = tankers.reduce((sum, v) => sum + v.cargoValue, 0);

  return {
    totalVessels,
    affectedVessels,
    divertedVessels,
    delayedVessels,
    totalCargoValue,
    tankerCount: tankers.length,
    containerCount: containers.length,
    avgRisk: vessels.reduce((sum, v) => sum + (['low', 'medium', 'high', 'critical'].indexOf(v.risk) + 1), 0) / vessels.length,
    dailyTankerThroughput,
    dailyVolume,
    estimatedOilValue: oilVolume,
    atRiskCargo: vessels.filter((v) => v.risk === 'critical').reduce((sum, v) => sum + v.cargoValue, 0),
  };
}

export function getMarketplaceData(): MarketplaceData {
  const stats = getVesselStatistics();

  return {
    timestamp: new Date().toISOString(),
    corridors: getShippingCorridors(),
    vessels: getTrackedVessels(),
    statistics: {
      totalVesselsTracked: stats.totalVessels,
      totalCargoValue: stats.totalCargoValue / 1000, // Convert to billions
      affectedVessels: stats.affectedVessels,
      diverted: stats.divertedVessels,
      delayed: stats.delayedVessels,
    },
  };
}
