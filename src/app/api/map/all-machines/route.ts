import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const revalidate = 3600; // 1 hour

interface Machine {
  serialNumber: string | number;
  customer: string;
  country: string;
  address: string;
  model: string;
  shipped: string;
  coords?: [number, number];
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  'USA': [37.0902, -95.7129],
  'Canada': [56.1304, -106.3468],
  'Mexico': [23.6345, -102.5528],
  'United Kingdom': [55.3781, -3.4360],
  'Germany': [51.1657, 10.4515],
  'France': [46.2276, 2.2137],
  'Italy': [41.8719, 12.5674],
  'Spain': [40.4637, -3.7492],
  'Netherlands': [52.1326, 5.2913],
  'Belgium': [50.5039, 4.4699],
  'Switzerland': [46.8182, 8.2275],
  'Austria': [47.5162, 14.5501],
  'Sweden': [60.1282, 18.6435],
  'Denmark': [56.2639, 9.5018],
  'Norway': [60.4720, 8.4689],
  'Finland': [61.9241, 25.7482],
  'Poland': [51.9194, 19.1451],
  'Czech Republic': [49.8175, 15.4730],
  'Hungary': [47.1625, 19.5033],
  'Romania': [45.9432, 24.9668],
  'Portugal': [39.3999, -8.2245],
  'Greece': [39.0742, 21.8243],
  'Japan': [36.2048, 138.2529],
  'South Korea': [35.9078, 127.7669],
  'China': [35.8617, 104.1954],
  'India': [20.5937, 78.9629],
  'Taiwan': [23.6978, 120.9605],
  'Singapore': [1.3521, 103.8198],
  'Thailand': [15.8700, 100.9925],
  'Malaysia': [4.2105, 101.6964],
  'Indonesia': [-0.7893, 113.9213],
  'Philippines': [12.8797, 121.7740],
  'Vietnam': [14.0583, 108.2772],
  'Australia': [-25.2744, 133.7751],
  'New Zealand': [-40.9006, 174.8860],
  'Brazil': [-14.2350, -51.9253],
  'Argentina': [-38.4161, -63.6167],
  'Chile': [-35.6751, -71.5430],
  'Colombia': [4.5709, -74.2973],
  'Peru': [-9.1900, -75.0152],
  'South Africa': [-30.5595, 22.9375],
  'Israel': [31.0461, 34.8516],
  'Saudi Arabia': [23.8859, 45.0792],
  'Turkey': [38.9637, 35.2433],
  'UAE': [23.4241, 53.8478],
  'Puerto Rico': [18.2208, -66.5901],
};

function loadJSON(fileName: string) {
  try {
    const paths = [
      join(process.cwd(), 'public', 'data', fileName),
      join('/tmp', fileName),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    }
    return null;
  } catch (e) {
    console.error(`Error loading ${fileName}:`, e);
    return null;
  }
}

export async function GET() {
  try {
    const machinesData = loadJSON('machines-sold.json');

    if (!machinesData) {
      return NextResponse.json(
        { error: 'Machines data not available', machines: [] },
        { status: 500 }
      );
    }

    const machines = Array.isArray(machinesData) ? machinesData : (machinesData.installations || []);

    const mappedMachines = machines.map((m: any) => {
      const country = m.Country || 'Unknown';
      const coords = COUNTRY_COORDS[country];

      return {
        serialNumber: m['Serial Number'] || m.serialNumber,
        customer: m.Customer || m.customer || 'Unknown',
        country,
        address: m['Full Address'] || m.address || 'Unknown',
        model: m.Description || m.model || 'Tablet Marking System',
        shipped: m.Shipped || m.shipped || 'Unknown',
        coords: coords || [0, 0],
      };
    });

    // Group by country
    const byCountry = new Map<string, { machines: Machine[]; coords: [number, number]; count: number }>();

    mappedMachines.forEach((m: Machine) => {
      if (!byCountry.has(m.country)) {
        byCountry.set(m.country, {
          machines: [],
          coords: COUNTRY_COORDS[m.country] || [0, 0],
          count: 0,
        });
      }
      const entry = byCountry.get(m.country)!;
      entry.machines.push(m);
      entry.count = entry.machines.length;
    });

    return NextResponse.json({
      success: true,
      totalMachines: mappedMachines.length,
      machines: mappedMachines,
      byCountry: Object.fromEntries(byCountry),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('All machines map API error:', error);
    return NextResponse.json(
      { error: 'Failed to load machines map data', machines: [] },
      { status: 500 }
    );
  }
}
