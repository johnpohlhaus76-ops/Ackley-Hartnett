import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface MaintenanceAlert {
  id: string;
  machineId: string;
  customer: string;
  model: string;
  serialNumber: string;
  country: string;
  shipDate: string;
  ageYears: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  reasons: string[];
  actions: string[];
  lastService?: string;
}

function loadJSON(fileName: string): any[] {
  try {
    const paths = [
      join(process.cwd(), 'data', fileName),
      join(process.cwd(), 'public', 'data', fileName),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    }
    return [];
  } catch (e) {
    console.error(`Error loading ${fileName}:`, e);
    return [];
  }
}

export function calculateMaintenanceAlerts(): MaintenanceAlert[] {
  const machines = loadJSON('machines-sold.json');
  const alerts: MaintenanceAlert[] = [];

  const now = new Date();

  for (const machine of machines) {
    const shipDate = new Date(machine.Shipped || machine.shipped);
    const ageYears = (now.getTime() - shipDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    const reasons: string[] = [];
    let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';

    if (ageYears > 20) {
      reasons.push('Machine age: 20+ years - likely end-of-life');
      riskLevel = 'critical';
    } else if (ageYears > 15) {
      reasons.push('Machine age: 15+ years - major service recommended');
      riskLevel = 'high';
    } else if (ageYears > 10) {
      reasons.push('Machine age: 10+ years - preventative maintenance advised');
      riskLevel = 'medium';
    } else if (ageYears > 5) {
      reasons.push('Machine age: 5+ years - standard maintenance schedule');
      riskLevel = 'low';
    }

    const actions: string[] = [];
    if (riskLevel === 'critical') {
      actions.push('Schedule urgent service visit', 'Review spare parts inventory', 'Contact customer immediately');
    } else if (riskLevel === 'high') {
      actions.push('Schedule preventive maintenance', 'Order common spare parts', 'Plan upgrade consultation');
    } else if (riskLevel === 'medium') {
      actions.push('Schedule routine maintenance', 'Verify spare parts stock', 'Customer wellness check');
    }

    if (reasons.length > 0) {
      alerts.push({
        id: `alert_${machine['Serial Number'] || machine.serialNumber}`,
        machineId: String(machine['Serial Number'] || machine.serialNumber),
        customer: machine.Customer || machine.customer,
        model: machine.Description || machine.model,
        serialNumber: String(machine['Serial Number'] || machine.serialNumber),
        country: machine.Country || machine.country,
        shipDate: machine.Shipped || machine.shipped,
        ageYears: Math.round(ageYears * 10) / 10,
        riskLevel,
        reasons,
        actions,
      });
    }
  }

  return alerts.sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
}

let alertsCache: { data: MaintenanceAlert[]; timestamp: number } | null = null;
const CACHE_TTL = 3600000; // 1 hour

export function getMaintenanceAlerts(): MaintenanceAlert[] {
  if (alertsCache && Date.now() - alertsCache.timestamp < CACHE_TTL) {
    return alertsCache.data;
  }

  const alerts = calculateMaintenanceAlerts();
  alertsCache = { data: alerts, timestamp: Date.now() };
  return alerts;
}

export function getAlertsByCountry(): Record<string, MaintenanceAlert[]> {
  const alerts = getMaintenanceAlerts();
  return alerts.reduce(
    (acc, alert) => {
      if (!acc[alert.country]) acc[alert.country] = [];
      acc[alert.country].push(alert);
      return acc;
    },
    {} as Record<string, MaintenanceAlert[]>
  );
}

export function getAlertStats() {
  const alerts = getMaintenanceAlerts();
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.riskLevel === 'critical').length,
    high: alerts.filter((a) => a.riskLevel === 'high').length,
    medium: alerts.filter((a) => a.riskLevel === 'medium').length,
    low: alerts.filter((a) => a.riskLevel === 'low').length,
  };
}
