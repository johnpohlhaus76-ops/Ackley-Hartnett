import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Plant {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  machines: any[];
  contactCount: number;
  installCount: number;
}

function getCoordinates(city: string, country: string): { lat: number; lng: number } {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    'Puerto Rico': { lat: 18.2208, lng: -66.5901 },
    'USA': { lat: 37.0902, lng: -95.7129 },
    'New Jersey': { lat: 40.2989, lng: -74.5806 },
    'Massachusetts': { lat: 42.2306, lng: -71.5301 },
    'Nebraska': { lat: 41.4925, lng: -99.9018 },
    'Florida': { lat: 27.9947, lng: -81.7603 },
    'New York': { lat: 42.1657, lng: -74.9481 },
    'India': { lat: 20.5937, lng: 78.9629 },
    'China': { lat: 35.8617, lng: 104.1954 },
    'Germany': { lat: 51.1657, lng: 10.4515 },
    'France': { lat: 46.2276, lng: 2.2137 },
    'Indonesia': { lat: -0.7893, lng: 113.9213 },
    'Pakistan': { lat: 30.3753, lng: 69.3451 },
    'Vietnam': { lat: 14.0583, lng: 108.2772 },
    'Bangladesh': { lat: 23.6850, lng: 90.3563 },
    'Taiwan': { lat: 23.6978, lng: 120.9605 },
  };
  return coordinates[country] || coordinates[city] || { lat: 40.7128, lng: -74.0060 };
}

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
    const accountsData = loadJSON('accounts.json');
    const machinesData = loadJSON('machines-sold.json');

    if (!accountsData || !machinesData) {
      return NextResponse.json({ error: 'Failed to load plant data' }, { status: 500 });
    }

    // Aggregate plants from accounts
    const plants: Plant[] = [];
    const plantMap = new Map<string, Plant>();

    // Group machines by account/plant
    machinesData.installations?.forEach((machine: any) => {
      const account = accountsData.accounts?.find((a: any) => a.name === machine.account);
      if (account) {
        const plantKey = `${account.name}`;

        if (!plantMap.has(plantKey)) {
          const [city, country] = (account.address || 'Unknown, Unknown').split(',').slice(-2).map((s: string) => s.trim());
          
          plantMap.set(plantKey, {
            id: plantKey.toLowerCase().replace(/\s+/g, '-'),
            name: account.name,
            address: account.address || 'N/A',
            city: city || 'Unknown',
            country: country || 'Unknown',
            ...getCoordinates(city || 'Unknown', country || 'Unknown'),
            machines: [],
            contactCount: account.contactCount || 0,
            installCount: account.installCount || 0,
          });
        }

        const plant = plantMap.get(plantKey);
        if (plant) {
          plant.machines.push({
            id: machine.serialNumber || machine.model,
            model: machine.model,
            serialNumber: machine.serialNumber,
            installDate: machine.installDate || '2024-01-01',
            status: machine.status || 'active',
            capabilities: machine.capabilities || ['printing', 'laser drilling'],
            lastServiceDate: machine.lastServiceDate || '2024-06-01',
            nextServiceDate: machine.nextServiceDate || '2025-06-01',
            manuals: [
              { id: '1', title: `${machine.model} Operating Manual`, type: 'PDF', url: '/manuals/operating.pdf' },
              { id: '2', title: `${machine.model} Maintenance Guide`, type: 'PDF', url: '/manuals/maintenance.pdf' },
            ],
            serviceRecords: [
              {
                id: '1',
                date: '2024-06-15',
                type: 'Preventive Maintenance',
                technician: 'John Smith',
                description: 'Routine inspection and lubrication',
                cost: 2500,
              },
              {
                id: '2',
                date: '2024-03-10',
                type: 'Repair',
                technician: 'Sarah Johnson',
                description: 'Servo motor replacement',
                cost: 8500,
              },
            ],
            notes: [
              'Machine running smoothly',
              'Last calibration: 2024-07-01',
              'Recommend replacement of wear parts Q4 2025',
            ],
          });
        }
      }
    });

    const plantsArray = Array.from(plantMap.values());

    return NextResponse.json({
      success: true,
      plants: plantsArray,
      summary: {
        totalPlants: plantsArray.length,
        totalMachines: plantsArray.reduce((sum, p) => sum + p.machines.length, 0),
        countries: [...new Set(plantsArray.map((p) => p.country))].length,
        activeStatus: 'operational',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Plants API error:', error);
    return NextResponse.json(
      { error: 'Failed to load plants data' },
      { status: 500 }
    );
  }
}
