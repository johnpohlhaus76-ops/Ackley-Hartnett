import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { aggregatePlantsFromMachines, generatePlantData } from '@/lib/plant-operations';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const plantId = searchParams.get('plantId');

    // Load machines data
    const machinesData = loadJSON('machines-sold.json');
    if (!machinesData) {
      return NextResponse.json(
        { error: 'Machines data not available' },
        { status: 500 }
      );
    }

    const machines = Array.isArray(machinesData) ? machinesData : (machinesData.installations || []);

    // Map machines to plants
    const plantMap = new Map<string, any[]>();

    machines.forEach((m: any) => {
      const customer = m.Customer || m.customer || 'Unknown';
      const country = m.Country || m.country || 'Unknown';

      if (!plantMap.has(customer)) {
        plantMap.set(customer, []);
      }

      plantMap.get(customer)!.push({
        serialNumber: m['Serial Number'] || m.serialNumber,
        model: m.Description || m.model || 'Tablet Marking System',
        customer,
        country,
        address: m['Full Address'] || m.address || 'Unknown',
        shipped: m.Shipped || m.shipped || '2024-01-01',
        status: 'active',
        installDate: m.Shipped || m.installDate || '2024-01-01',
      });
    });

    // Generate plant data with operations
    const plants = Array.from(plantMap.entries()).map(([plantName, plantMachines]) => {
      const country = plantMachines[0]?.country || 'Unknown';
      return generatePlantData(plantName, country, plantMachines);
    });

    // If specific plant requested, return only that plant
    if (plantId) {
      const plant = plants.find((p) => p.id === plantId);
      if (!plant) {
        return NextResponse.json(
          { error: 'Plant not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        plant,
      });
    }

    // Return all plants
    return NextResponse.json({
      success: true,
      plants,
      summary: {
        totalPlants: plants.length,
        totalMachines: plants.reduce((sum, p) => sum + p.machines.length, 0),
        totalOrders: plants.reduce((sum, p) => sum + p.orders.length, 0),
        totalQuotes: plants.reduce((sum, p) => sum + p.quotes.length, 0),
      },
    });
  } catch (error: any) {
    console.error('Plant operations API error:', error);
    return NextResponse.json(
      { error: 'Failed to load plant operations data', details: error?.message },
      { status: 500 }
    );
  }
}
