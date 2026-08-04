import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  description: string;
  price: number;
  leadTime: string;
  applicableModels: string[];
  minStockLevel: number;
  reorderQuantity: number;
  weight: number;
  supplier: string;
}

export interface PartInventoryLocation {
  quantity: number;
  lastRestocked: string;
  nextShipment: string | null;
}

export interface Location {
  address: string;
  country: string;
  region: string;
  capacity: number;
}

export interface SparePartsCatalog {
  parts: SparePart[];
  locations: Record<string, Location>;
  inventory: Record<string, Record<string, PartInventoryLocation>>;
}

let catalog: SparePartsCatalog | null = null;

function loadCatalog(): SparePartsCatalog {
  if (catalog) return catalog;

  try {
    const paths = [
      join(process.cwd(), 'data', 'spare-parts-catalog.json'),
      join(process.cwd(), 'public', 'data', 'spare-parts-catalog.json'),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        const loaded = JSON.parse(readFileSync(path, 'utf-8')) as SparePartsCatalog;
        catalog = loaded;
        return loaded;
      }
    }

    throw new Error('Spare parts catalog not found');
  } catch (e) {
    console.error('Error loading spare parts catalog:', e);
    const empty: SparePartsCatalog = {
      parts: [],
      locations: {},
      inventory: {},
    };
    return empty;
  }
}

export function getPartsByModel(model: string): SparePart[] {
  const cat = loadCatalog();
  return cat.parts.filter((p) =>
    p.applicableModels.some(
      (m) => m.toLowerCase() === model.toLowerCase()
    )
  );
}

export function getInventoryByLocation(locationId: string): Array<{
  part: SparePart;
  stock: PartInventoryLocation;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}> {
  const cat = loadCatalog();
  const locationInv = cat.inventory[locationId] || {};

  return Object.entries(locationInv).map(([partId, stock]) => {
    const part = cat.parts.find((p) => p.id === partId);
    const status =
      stock.quantity === 0
        ? 'out-of-stock'
        : stock.quantity < part!.minStockLevel
        ? 'low-stock'
        : 'in-stock';

    return {
      part: part!,
      stock,
      status,
    };
  });
}

export function getLowStockAlerts(): Array<{
  location: string;
  part: SparePart;
  quantity: number;
  minRequired: number;
}> {
  const cat = loadCatalog();
  const alerts: any[] = [];

  for (const [locationId, partInventory] of Object.entries(cat.inventory)) {
    for (const [partId, stock] of Object.entries(partInventory)) {
      const part = cat.parts.find((p) => p.id === partId);
      if (!part) continue;

      if (stock.quantity < part.minStockLevel) {
        alerts.push({
          location: locationId,
          part,
          quantity: stock.quantity,
          minRequired: part.minStockLevel,
        });
      }
    }
  }

  return alerts;
}

export function estimatePartAvailability(
  partId: string,
  quantity: number
): { available: boolean; nearestLocation?: string; leadTime?: string } {
  const cat = loadCatalog();
  const part = cat.parts.find((p) => p.id === partId);

  if (!part) return { available: false };

  for (const [locationId, partInventory] of Object.entries(cat.inventory)) {
    const stock = partInventory[partId];
    if (stock && stock.quantity >= quantity) {
      return { available: true, nearestLocation: locationId };
    }
  }

  return { available: false, leadTime: part.leadTime };
}
