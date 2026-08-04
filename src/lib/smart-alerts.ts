import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export type AlertType = 'quote-expiry' | 'inactive-customer' | 'order-shipped' | 'low-inventory' | 'overdue-maintenance';

export interface SmartAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  relatedCustomer?: string;
  relatedMachine?: string;
  actionRequired: boolean;
  createdAt: string;
  metadata: Record<string, any>;
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

export function generateSmartAlerts(): SmartAlert[] {
  const quotes = loadJSON('quotes-2025.json');
  const machines = loadJSON('machines-sold.json');
  const now = new Date();
  const alerts: SmartAlert[] = [];

  // Quote expiry alerts
  for (const quote of quotes) {
    if (quote.Status === 'sent') {
      const quoteDate = new Date(quote['Quote Date'] || quote.quoteDate);
      const daysOld = (now.getTime() - quoteDate.getTime()) / (24 * 60 * 60 * 1000);

      if (daysOld > 20) {
        alerts.push({
          id: `alert_quote_${quote.Estimate}`,
          type: 'quote-expiry',
          title: `Quote ${quote.Estimate} expiring soon`,
          message: `Quote for ${quote.Customer} expires in ${Math.max(0, 30 - Math.floor(daysOld))} days`,
          severity: daysOld > 28 ? 'critical' : 'high',
          relatedCustomer: quote.Customer,
          actionRequired: true,
          createdAt: new Date().toISOString(),
          metadata: {
            quoteNumber: quote.Estimate,
            customer: quote.Customer,
            value: quote['Total Price'],
            daysOld: Math.floor(daysOld),
          },
        });
      }
    }
  }

  // Inactive customer alerts (no quotes in 90+ days)
  const customerQuoteDates: Record<string, number> = {};
  const validCustomers = new Set<string>();

  for (const quote of quotes) {
    const customer = quote.Customer || quote.customer;
    if (!customer || typeof customer !== 'string') continue; // Skip invalid customers

    validCustomers.add(customer);
    const quoteDate = new Date(quote['Quote Date'] || quote.quoteDate).getTime();
    if (!customerQuoteDates[customer] || quoteDate > customerQuoteDates[customer]) {
      customerQuoteDates[customer] = quoteDate;
    }
  }

  for (const [customer, lastQuoteTime] of Object.entries(customerQuoteDates)) {
    if (!validCustomers.has(customer) || !customer || customer === 'null') continue; // Skip invalid IDs

    const daysSinceContact = (now.getTime() - lastQuoteTime) / (24 * 60 * 60 * 1000);
    if (daysSinceContact > 90) {
      alerts.push({
        id: `alert_inactive_${customer.replace(/\s+/g, '_')}`,
        type: 'inactive-customer',
        title: `${customer} has been inactive`,
        message: `No activity for ${Math.floor(daysSinceContact)} days. Schedule customer check-in.`,
        severity: daysSinceContact > 180 ? 'critical' : daysSinceContact > 120 ? 'high' : 'medium',
        relatedCustomer: customer,
        actionRequired: true,
        createdAt: new Date().toISOString(),
        metadata: {
          customer,
          daysSinceContact: Math.floor(daysSinceContact),
          lastContact: new Date(lastQuoteTime).toISOString(),
        },
      });
    }
  }

  // Overdue maintenance alerts (machines 15+ years old with no recent service)
  for (const machine of machines) {
    const shipDate = new Date(machine.Shipped || machine.shipped);
    const ageYears = (now.getTime() - shipDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (ageYears > 15) {
      alerts.push({
        id: `alert_maintenance_${machine['Serial Number']}`,
        type: 'overdue-maintenance',
        title: `Maintenance overdue for ${machine.Customer}`,
        message: `Machine SN ${machine['Serial Number']} is ${Math.floor(ageYears)} years old and needs service.`,
        severity: ageYears > 20 ? 'critical' : 'high',
        relatedCustomer: machine.Customer,
        relatedMachine: String(machine['Serial Number']),
        actionRequired: true,
        createdAt: new Date().toISOString(),
        metadata: {
          customer: machine.Customer,
          machineAge: Math.floor(ageYears),
          serialNumber: machine['Serial Number'],
          lastService: machine.lastService,
        },
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

let alertsCache: { data: SmartAlert[]; timestamp: number } | null = null;
const CACHE_TTL = 3600000;

export function getSmartAlerts(): SmartAlert[] {
  if (alertsCache && Date.now() - alertsCache.timestamp < CACHE_TTL) {
    return alertsCache.data;
  }

  const alerts = generateSmartAlerts();
  alertsCache = { data: alerts, timestamp: Date.now() };
  return alerts;
}

export function getAlertStats() {
  const alerts = getSmartAlerts();
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    byType: {
      quoteExpiry: alerts.filter((a) => a.type === 'quote-expiry').length,
      inactiveCustomers: alerts.filter((a) => a.type === 'inactive-customer').length,
      maintenanceOverdue: alerts.filter((a) => a.type === 'overdue-maintenance').length,
    },
  };
}
