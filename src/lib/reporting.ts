import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export type ReportType = 'revenue' | 'customer' | 'machine-utilization' | 'sales-performance';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  data: any;
  summary: any;
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

export function generateRevenueReport(fromDate: string, toDate: string): Report {
  const quotes = loadJSON('quotes-2025.json');
  const from = new Date(fromDate);
  const to = new Date(toDate);

  // If no explicit dates provided, use last 90 days
  const useFrom = fromDate === '2025-01-01' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) : from;
  const useTo = to;

  const filtered = quotes.filter((q) => {
    const qDate = new Date(q['Quote Date'] || q.quoteDate);
    return qDate >= useFrom && qDate <= useTo;
  });

  const byMonth: Record<string, number> = {};
  filtered.forEach((q) => {
    const date = new Date(q['Quote Date'] || q.quoteDate);
    const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    byMonth[month] = (byMonth[month] || 0) + (q['Total Price'] || 0);
  });

  const topCustomers = Array.from(
    new Map(
      filtered.reduce(
        (acc, q) => {
          const cust = q.Customer;
          const existing = acc.get(cust) || 0;
          acc.set(cust, existing + (q['Total Price'] || 0));
          return acc;
        },
        new Map<string, number>()
      )
    )
  )
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10);

  const total = filtered.reduce((sum, q) => sum + (q['Total Price'] || 0), 0);

  return {
    id: `report_revenue_${Date.now()}`,
    type: 'revenue',
    title: 'Revenue Report',
    description: `Revenue analysis from ${fromDate} to ${toDate}`,
    generatedAt: new Date().toISOString(),
    dateRange: { from: fromDate, to: toDate },
    data: {
      byMonth,
      topCustomers,
      allTransactions: filtered.length,
    },
    summary: {
      totalRevenue: total,
      avgTransactionValue: filtered.length > 0 ? Math.round(total / filtered.length) : 0,
      topCustomer: topCustomers[0]?.[0],
      topCustomerValue: topCustomers[0]?.[1],
    },
  };
}

export function generateCustomerReport(fromDate: string, toDate: string): Report {
  const machines = loadJSON('machines-sold.json');
  const quotes = loadJSON('quotes-2025.json');
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const filteredQuotes = quotes.filter((q) => {
    const qDate = new Date(q['Quote Date'] || q.quoteDate);
    return qDate >= from && qDate <= to;
  });

  const customerMetrics: Record<
    string,
    {
      quoteCount: number;
      totalValue: number;
      machineCount: number;
      healthScore: number;
    }
  > = {};

  filteredQuotes.forEach((q) => {
    const cust = q.Customer;
    if (!customerMetrics[cust]) {
      customerMetrics[cust] = {
        quoteCount: 0,
        totalValue: 0,
        machineCount: 0,
        healthScore: 0,
      };
    }
    customerMetrics[cust].quoteCount++;
    customerMetrics[cust].totalValue += q['Total Price'] || 0;
  });

  machines.forEach((m) => {
    const cust = m.Customer || m.customer;
    if (customerMetrics[cust]) {
      customerMetrics[cust].machineCount++;
    }
  });

  const topCustomers = Object.entries(customerMetrics)
    .sort((a, b) => b[1].totalValue - a[1].totalValue)
    .slice(0, 20);

  return {
    id: `report_customer_${Date.now()}`,
    type: 'customer',
    title: 'Customer Report',
    description: `Customer metrics from ${fromDate} to ${toDate}`,
    generatedAt: new Date().toISOString(),
    dateRange: { from: fromDate, to: toDate },
    data: {
      customers: topCustomers,
      totalCustomers: Object.keys(customerMetrics).length,
    },
    summary: {
      totalCustomers: Object.keys(customerMetrics).length,
      totalRevenue: Object.values(customerMetrics).reduce((sum, c) => sum + c.totalValue, 0),
      avgQuotesPerCustomer:
        Object.keys(customerMetrics).length > 0
          ? Math.round(
              Object.values(customerMetrics).reduce((sum, c) => sum + c.quoteCount, 0) /
                Object.keys(customerMetrics).length
            )
          : 0,
    },
  };
}

export function generateMachineUtilizationReport(): Report {
  const machines = loadJSON('machines-sold.json');
  const quotes = loadJSON('quotes-2025.json');

  const byCountry: Record<string, { count: number; active: number; revenue: number }> = {};
  const byModel: Record<string, { count: number; revenue: number }> = {};

  machines.forEach((m) => {
    const country = m.Country || m.country;
    const model = m.Description || m.model;

    if (!byCountry[country]) byCountry[country] = { count: 0, active: 0, revenue: 0 };
    if (!byModel[model]) byModel[model] = { count: 0, revenue: 0 };

    byCountry[country].count++;
    byModel[model].count++;

    if (m.status === 'active') byCountry[country].active++;
  });

  quotes.forEach((q) => {
    const revenue = q['Total Price'] || 0;
    const cust = q.Customer;

    for (const [country, data] of Object.entries(byCountry)) {
      // Rough assignment
      data.revenue += revenue * 0.05; // Distributed estimate
    }
  });

  return {
    id: `report_utilization_${Date.now()}`,
    type: 'machine-utilization',
    title: 'Machine Utilization Report',
    description: 'Global machine utilization and distribution',
    generatedAt: new Date().toISOString(),
    dateRange: { from: '2025-01-01', to: new Date().toISOString() },
    data: {
      byCountry,
      byModel,
    },
    summary: {
      totalMachines: machines.length,
      activeMachines: machines.filter((m) => m.status === 'active').length,
      utilizationRate: Math.round(
        (machines.filter((m) => m.status === 'active').length / machines.length) * 100
      ),
      topCountry: Object.entries(byCountry).sort((a, b) => b[1].count - a[1].count)[0]?.[0],
      topModel: Object.entries(byModel).sort((a, b) => b[1].count - a[1].count)[0]?.[0],
    },
  };
}

export function generateSalesPerformanceReport(fromDate: string, toDate: string): Report {
  const quotes = loadJSON('quotes-2025.json');
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const filtered = quotes.filter((q) => {
    const qDate = new Date(q['Quote Date'] || q.quoteDate);
    return qDate >= from && qDate <= to;
  });

  const accepted = filtered.filter((q) => (q.Status || q.status) === 'accepted').length;
  const rejected = filtered.filter((q) => (q.Status || q.status) === 'rejected').length;
  const pending = filtered.filter((q) => (q.Status || q.status) === 'sent').length;

  const conversionRate = filtered.length > 0 ? Math.round((accepted / filtered.length) * 100) : 0;
  const totalValue = filtered.reduce((sum, q) => sum + (q['Total Price'] || 0), 0);

  return {
    id: `report_sales_${Date.now()}`,
    type: 'sales-performance',
    title: 'Sales Performance Report',
    description: `Sales metrics from ${fromDate} to ${toDate}`,
    generatedAt: new Date().toISOString(),
    dateRange: { from: fromDate, to: toDate },
    data: {
      totalQuotes: filtered.length,
      accepted,
      rejected,
      pending,
    },
    summary: {
      totalQuotes: filtered.length,
      conversionRate,
      totalRevenue: totalValue,
      avgDealSize: filtered.length > 0 ? Math.round(totalValue / filtered.length) : 0,
    },
  };
}
