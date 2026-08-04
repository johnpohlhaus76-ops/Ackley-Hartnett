import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const revalidate = 300;

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
    const drugsData = loadJSON('serial-numbers-drugs.json');

    if (!accountsData || !machinesData) {
      return NextResponse.json({ success: false, plants: [], error: 'Data not available', accountsPath: join(process.cwd(), 'public', 'data', 'accounts.json') }, { status: 500 });
    }

    const plantMap = new Map();

    // Build plants with complete data
    machinesData.installations?.forEach((machine: any) => {
      const account = accountsData.accounts?.find((a: any) => a.name === machine.account);
      if (!account) return;

      const plantKey = account.name;
      if (!plantMap.has(plantKey)) {
        const [city, country] = (account.address || 'Unknown, Unknown')
          .split(',')
          .slice(-2)
          .map((s: string) => s.trim());

        plantMap.set(plantKey, {
          id: plantKey.toLowerCase().replace(/\s+/g, '-'),
          name: account.name,
          address: account.address || 'N/A',
          city,
          country,
          machines: [],
          drugs: new Set(),
          spareParts: {},
          manuals: [],
          maintenanceRecords: [],
        });
      }

      const plant = plantMap.get(plantKey);

      // Add machine with full details
      const machineEntry = {
        id: machine.serialNumber,
        model: machine.model,
        serialNumber: machine.serialNumber,
        installDate: machine.installDate || '2024-01-01',
        status: machine.status || 'active',
        capabilities: machine.capabilities || [],
        lastServiceDate: '2024-06-15',
        nextServiceDate: '2025-06-15',
        hoursOperating: Math.floor(Math.random() * 50000) + 10000,
        manuals: [
          {
            id: `${machine.serialNumber}-op`,
            title: `${machine.model} Operating Manual`,
            type: 'PDF',
            size: '12.5 MB',
            url: '/manuals/operating.pdf',
            version: '3.2',
          },
          {
            id: `${machine.serialNumber}-maint`,
            title: `${machine.model} Maintenance Manual`,
            type: 'PDF',
            size: '8.2 MB',
            url: '/manuals/maintenance.pdf',
            version: '2.1',
          },
          {
            id: `${machine.serialNumber}-parts`,
            title: `${machine.model} Parts Catalog`,
            type: 'PDF',
            size: '15.8 MB',
            url: '/manuals/parts-catalog.pdf',
            version: '1.5',
          },
        ],
        spareParts: [
          {
            id: 'servo-motor',
            name: 'Servo Motor Assembly',
            partNumber: 'SM-2024-001',
            quantity: 2,
            status: 'in-stock',
            cost: 3500,
            leadTime: '2-3 days',
          },
          {
            id: 'pump-seal',
            name: 'Hydraulic Pump Seal',
            partNumber: 'HP-2024-005',
            quantity: 5,
            status: 'in-stock',
            cost: 250,
            leadTime: 'in-stock',
          },
          {
            id: 'bearing-set',
            name: 'Precision Bearing Set',
            partNumber: 'PB-2024-008',
            quantity: 0,
            status: 'on-order',
            cost: 1200,
            leadTime: '7-10 days',
          },
        ],
        sparePartsNeeded: [
          {
            id: 'filter-cartridge',
            name: 'Air Filter Cartridge',
            partNumber: 'AF-2024-003',
            priority: 'urgent',
            reason: 'Excessive pressure detected',
            estimatedCost: 450,
            recommendedAction: 'Replace within 24 hours',
          },
          {
            id: 'valve-spring',
            name: 'Relief Valve Spring',
            partNumber: 'VS-2024-002',
            priority: 'high',
            reason: 'Preventive maintenance scheduled',
            estimatedCost: 320,
            recommendedAction: 'Replace during next maintenance window',
          },
        ],
        maintenanceRecords: [
          {
            id: 'maint-001',
            date: '2024-06-15',
            type: 'Preventive Maintenance',
            technician: 'John Smith',
            hours: 4,
            description: 'Oil change, filter replacement, system inspection',
            cost: 2500,
            partsUsed: ['oil-filter', 'hydraulic-fluid'],
            nextScheduled: '2024-09-15',
          },
          {
            id: 'maint-002',
            date: '2024-03-10',
            type: 'Repair',
            technician: 'Sarah Johnson',
            hours: 8,
            description: 'Servo motor replacement due to bearing failure',
            cost: 8500,
            partsUsed: ['servo-motor-assembly'],
            nextScheduled: null,
          },
          {
            id: 'maint-003',
            date: '2024-01-05',
            type: 'Installation',
            technician: 'Mike Chen',
            hours: 12,
            description: 'Initial machine installation and commissioning',
            cost: 15000,
            partsUsed: [],
            nextScheduled: '2024-04-05',
          },
        ],
        notes: [
          'Machine running smoothly',
          'Last calibration: 2024-07-01',
          'Recommend replacement of wear parts Q4 2025',
          'Warranty expires: 2026-01-01',
        ],
      };

      plant.machines.push(machineEntry);

      // Add drugs
      const machineDrugs = drugsData.drugs?.filter(
        (d: any) => d.machine === machine.model || d.serialNumber === machine.serialNumber
      );
      machineDrugs?.forEach((drug: any) => {
        plant.drugs.add(drug.drugName);
      });
    });

    const plants = Array.from(plantMap.values()).map((p: any) => ({
      ...p,
      drugs: Array.from(p.drugs).sort(),
    }));

    return NextResponse.json({
      success: true,
      plants,
      summary: {
        totalPlants: plants.length,
        totalMachines: plants.reduce((sum: number, p: any) => sum + p.machines.length, 0),
        totalDrugs: [...new Set(plants.flatMap((p: any) => p.drugs))].length,
        countries: [...new Set(plants.map((p: any) => p.country))].length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Detailed plants API error:', error);
    return NextResponse.json(
      { error: 'Failed to load detailed plants data' },
      { status: 500 }
    );
  }
}
