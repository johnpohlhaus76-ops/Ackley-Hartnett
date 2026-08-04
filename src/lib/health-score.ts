import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface HealthScoreBreakdown {
  machineRecency: number;
  orderFrequency: number;
  conversionRate: number;
  engagement: number;
  overallScore: number;
  riskLevel: 'at-risk' | 'healthy' | 'premium';
  recommendations: string[];
}

export interface CustomerHealth {
  customerId: string;
  customerName: string;
  score: HealthScoreBreakdown;
  lastUpdated: string;
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

function calculateMachineRecency(lastShippedDate: string): number {
  const lastDate = new Date(lastShippedDate);
  const now = new Date();
  const yearsAgo = (now.getTime() - lastDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  if (yearsAgo < 1) return 100;
  if (yearsAgo < 3) return 80;
  if (yearsAgo < 5) return 60;
  if (yearsAgo < 7) return 40;
  if (yearsAgo < 10) return 20;
  return 0;
}

function calculateOrderFrequency(
  customerId: string,
  machines: any[],
  quotes: any[]
): number {
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365.25 * 24 * 60 * 60 * 1000);

  const ordersThisYear = quotes.filter((q) => {
    const qDate = new Date(q['Quote Date'] || q.quoteDate);
    return (
      qDate > oneYearAgo &&
      (q.Customer === customerId || q.customer === customerId)
    );
  }).length;

  const machineCount = machines.filter(
    (m) => m.Customer === customerId || m.customer === customerId
  ).length;

  const benchmark = Math.max(machineCount * 0.5, 1);
  const frequency = ordersThisYear / benchmark;

  if (frequency > 2) return 100;
  if (frequency > 1) return 80;
  if (frequency > 0.5) return 60;
  if (frequency > 0.25) return 40;
  return 20;
}

function calculateConversionRate(
  customerId: string,
  quotes: any[]
): number {
  const customerQuotes = quotes.filter(
    (q) => q.Customer === customerId || q.customer === customerId
  );

  if (customerQuotes.length === 0) return 50;

  const accepted = customerQuotes.filter(
    (q) => q.Status === 'accepted' || q.status === 'accepted'
  ).length;

  const rate = accepted / customerQuotes.length;

  if (rate > 0.6) return 100;
  if (rate > 0.4) return 80;
  if (rate > 0.3) return 60;
  if (rate > 0.2) return 40;
  return 20;
}

function calculateEngagement(
  customerId: string,
  quotes: any[]
): number {
  const customerQuotes = quotes.filter(
    (q) => q.Customer === customerId || q.customer === customerId
  );

  if (customerQuotes.length === 0) return 30;

  const lastQuote = customerQuotes.sort(
    (a, b) =>
      new Date(b['Quote Date'] || b.quoteDate).getTime() -
      new Date(a['Quote Date'] || a.quoteDate).getTime()
  )[0];

  const lastDate = new Date(lastQuote['Quote Date'] || lastQuote.quoteDate);
  const now = new Date();
  const daysSince = (now.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000);

  if (daysSince < 30) return 100;
  if (daysSince < 90) return 70;
  if (daysSince < 180) return 40;
  return 20;
}

export function calculateHealthScore(
  customerId: string,
  customerName: string
): CustomerHealth {
  const machines = loadJSON('machines-sold.json');
  const quotes = loadJSON('quotes-2025.json');

  const customerMachines = machines.filter(
    (m) => m.Customer === customerId || m.customer === customerId
  );

  if (customerMachines.length === 0) {
    return {
      customerId,
      customerName,
      score: {
        machineRecency: 0,
        orderFrequency: 0,
        conversionRate: 0,
        engagement: 0,
        overallScore: 0,
        riskLevel: 'at-risk',
        recommendations: ['No installed machines found', 'Initiate outreach campaign'],
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  const lastMachine = customerMachines.sort(
    (a, b) =>
      new Date(b.Shipped || b.shipped).getTime() -
      new Date(a.Shipped || a.shipped).getTime()
  )[0];

  const recency = calculateMachineRecency(lastMachine.Shipped || lastMachine.shipped);
  const frequency = calculateOrderFrequency(customerId, machines, quotes);
  const conversion = calculateConversionRate(customerId, quotes);
  const engagement = calculateEngagement(customerId, quotes);

  const overallScore = Math.round(
    recency * 0.4 + frequency * 0.3 + conversion * 0.2 + engagement * 0.1
  );

  let riskLevel: 'at-risk' | 'healthy' | 'premium';
  if (overallScore >= 71) riskLevel = 'premium';
  else if (overallScore >= 31) riskLevel = 'healthy';
  else riskLevel = 'at-risk';

  const recommendations: string[] = [];
  if (recency < 40) recommendations.push('Old installed base - consider upgrades');
  if (frequency < 40) recommendations.push('Low order frequency - increase engagement');
  if (conversion < 40) recommendations.push('Low quote acceptance - review pricing');
  if (engagement < 40) recommendations.push('Inactive account - schedule check-in');

  return {
    customerId,
    customerName,
    score: {
      machineRecency: recency,
      orderFrequency: frequency,
      conversionRate: conversion,
      engagement,
      overallScore,
      riskLevel,
      recommendations: recommendations.length > 0 ? recommendations : ['Strong customer'],
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function calculateBulkHealthScores(): CustomerHealth[] {
  const machines = loadJSON('machines-sold.json');
  const quotes = loadJSON('quotes-2025.json');

  // Group machines by customer to get actual customer list
  const customerMap = new Map<string, any[]>();
  machines.forEach((m: any) => {
    const cust = m.Customer || m.customer;
    if (!customerMap.has(cust)) {
      customerMap.set(cust, []);
    }
    customerMap.get(cust)!.push(m);
  });

  return Array.from(customerMap.entries())
    .map(([customerId, plantMachines]) => {
      // Recalculate with actual data from machines and quotes
      const customerQuotes = quotes.filter((q) => (q.Customer || q.customer) === customerId);
      const lastMachine = plantMachines.sort(
        (a, b) =>
          new Date(b.Shipped || b.shipped).getTime() -
          new Date(a.Shipped || a.shipped).getTime()
      )[0];

      const recency = calculateMachineRecency(lastMachine.Shipped || lastMachine.shipped);
      const frequency = calculateOrderFrequency(customerId, machines, quotes);
      const conversion = calculateConversionRate(customerId, quotes);
      const engagement = calculateEngagement(customerId, quotes);

      const overallScore = Math.round(
        recency * 0.4 + frequency * 0.3 + conversion * 0.2 + engagement * 0.1
      );

      let riskLevel: 'at-risk' | 'healthy' | 'premium';
      if (overallScore >= 71) riskLevel = 'premium';
      else if (overallScore >= 31) riskLevel = 'healthy';
      else riskLevel = 'at-risk';

      const recommendations: string[] = [];
      if (recency < 40) recommendations.push('Old installed base - consider upgrades');
      if (frequency < 40) recommendations.push('Low order frequency - increase engagement');
      if (conversion < 40) recommendations.push('Low quote acceptance - review pricing');
      if (engagement < 40) recommendations.push('Inactive account - schedule check-in');

      return {
        customerId,
        customerName: customerId,
        score: {
          machineRecency: recency,
          orderFrequency: frequency,
          conversionRate: conversion,
          engagement,
          overallScore,
          riskLevel,
          recommendations: recommendations.length > 0 ? recommendations : ['Strong customer'],
        },
        lastUpdated: new Date().toISOString(),
      };
    })
    .sort((a, b) => b.score.overallScore - a.score.overallScore);
}

let healthScoreCache: Map<string, { data: CustomerHealth; timestamp: number }> = new Map();

export function getHealthScore(customerId: string, customerName: string = ''): CustomerHealth {
  const cached = healthScoreCache.get(customerId);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.data;
  }

  const score = calculateHealthScore(customerId, customerName);
  healthScoreCache.set(customerId, { data: score, timestamp: Date.now() });
  return score;
}
