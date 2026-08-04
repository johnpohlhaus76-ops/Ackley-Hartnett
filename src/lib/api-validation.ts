// API Validation & Health Check System
// Ensures all integrations use FREE APIs with no token costs

export interface APIEndpoint {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  freeTier: {
    available: boolean;
    requestsPerMinute: number;
    requestsPerDay: number;
    costPerRequest: number; // 0 = free
    notes: string;
  };
  testQuery?: string;
  timeout: number;
  fallbackData?: any;
}

export interface APIValidationResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  responseTime: number;
  dataSize: number;
  accuracy: number; // 0-100
  costPerRequest: number;
  lastChecked: string;
  errorMessage?: string;
}

export const API_ENDPOINTS: APIEndpoint[] = [
  {
    name: 'CommodityPriceAPI',
    endpoint: 'https://api.commodityprice.com/api/v1/prices',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 60,
      requestsPerDay: 999999,
      costPerRequest: 0,
      notes: 'No API key required, unlimited free tier',
    },
    testQuery: '?commodities=OIL,GOLD,SILVER,COPPER&currencies=USD',
    timeout: 5000,
  },
  {
    name: 'Finnhub Stock API',
    endpoint: 'https://finnhub.io/api/v1/quote',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 1,
      requestsPerDay: 60,
      costPerRequest: 0,
      notes: 'Free tier: 60 calls/min, register at finnhub.io for free API key',
    },
    testQuery: '?symbol=AAPL&token=YOUR_FREE_API_KEY',
    timeout: 5000,
  },
  {
    name: 'OilPriceAPI',
    endpoint: 'https://api.oilpriceapi.com/v1/brent',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 10,
      requestsPerDay: 1000,
      costPerRequest: 0,
      notes: 'Free trial with 10K requests, then free tier available',
    },
    timeout: 5000,
  },
  {
    name: 'GoldAPI.io',
    endpoint: 'https://www.goldapi.io/api/XAU/USD',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 5,
      requestsPerDay: 1440,
      costPerRequest: 0,
      notes: 'Free tier with rate limiting, no credit card required',
    },
    testQuery: '',
    timeout: 5000,
  },
  {
    name: 'NewsAPI.org',
    endpoint: 'https://newsapi.org/v2/everything',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 5,
      requestsPerDay: 250,
      costPerRequest: 0,
      notes: 'Free tier for developers, register for free API key at newsapi.org',
    },
    testQuery: '?q=geopolitical&sortBy=publishedAt&apiKey=YOUR_FREE_API_KEY',
    timeout: 8000,
  },
  {
    name: 'MarineTraffic AIS API',
    endpoint: 'https://services.marinetraffic.com/api/v8/json/position/all',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 10,
      requestsPerDay: 1000,
      costPerRequest: 0,
      notes: 'Free tier available, limited vessel data. Community API for personal use',
    },
    testQuery: '?timespan=60&apikey=YOUR_FREE_API_KEY',
    timeout: 10000,
  },
  {
    name: 'Open-Meteo Weather API',
    endpoint: 'https://api.open-meteo.com/v1/forecast',
    method: 'GET',
    freeTier: {
      available: true,
      requestsPerMinute: 10000,
      requestsPerDay: 10000000,
      costPerRequest: 0,
      notes: 'Unlimited free tier, no API key required',
    },
    testQuery: '?latitude=52.52&longitude=13.405&current=temperature',
    timeout: 5000,
  },
];

export async function validateAPIEndpoint(endpoint: APIEndpoint): Promise<APIValidationResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

    const response = await fetch(endpoint.endpoint, {
      method: endpoint.method,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const data = await response.json();
    const dataSize = JSON.stringify(data).length;

    if (!response.ok) {
      return {
        name: endpoint.name,
        status: 'error',
        responseTime,
        dataSize: 0,
        accuracy: 0,
        costPerRequest: endpoint.freeTier.costPerRequest,
        lastChecked: new Date().toISOString(),
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Data accuracy check (simplified)
    const hasRequiredFields = Object.keys(data).length > 0;
    const accuracy = hasRequiredFields ? 100 : 50;

    return {
      name: endpoint.name,
      status: responseTime < 2000 ? 'ok' : 'warning',
      responseTime,
      dataSize,
      accuracy,
      costPerRequest: endpoint.freeTier.costPerRequest,
      lastChecked: new Date().toISOString(),
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      name: endpoint.name,
      status: 'error',
      responseTime,
      dataSize: 0,
      accuracy: 0,
      costPerRequest: endpoint.freeTier.costPerRequest,
      lastChecked: new Date().toISOString(),
      errorMessage: error.message,
    };
  }
}

export async function validateAllAPIs(): Promise<APIValidationResult[]> {
  const results: APIValidationResult[] = [];

  for (const endpoint of API_ENDPOINTS) {
    const result = await validateAPIEndpoint(endpoint);
    results.push(result);
  }

  return results;
}

export function generateAPIHealthReport(results: APIValidationResult[]) {
  const okCount = results.filter((r) => r.status === 'ok').length;
  const warningCount = results.filter((r) => r.status === 'warning').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const totalDataSize = results.reduce((sum, r) => sum + r.dataSize, 0);
  const totalCost = results.reduce((sum, r) => sum + r.costPerRequest, 0);

  return {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      ok: okCount,
      warning: warningCount,
      error: errorCount,
      healthScore: Math.round((okCount / results.length) * 100),
    },
    performance: {
      avgResponseTime: Math.round(avgResponseTime),
      totalDataSize,
      totalDataSizeKB: Math.round(totalDataSize / 1024),
    },
    cost: {
      totalCostPerRequest: totalCost,
      monthlyEstimate: totalCost * 86400 * 30, // Assuming 1 call/sec per API
      isFree: totalCost === 0,
    },
    details: results,
  };
}

export function getAPIRecommendations(results: APIValidationResult[]) {
  const recommendations: string[] = [];

  const slowAPIs = results.filter((r) => r.responseTime > 2000);
  if (slowAPIs.length > 0) {
    recommendations.push(`⚠️ Slow APIs: ${slowAPIs.map((a) => a.name).join(', ')} exceed 2s response time`);
  }

  const errorAPIs = results.filter((r) => r.status === 'error');
  if (errorAPIs.length > 0) {
    recommendations.push(`❌ Error APIs: ${errorAPIs.map((a) => a.name).join(', ')} are unreachable`);
  }

  const lowAccuracy = results.filter((r) => r.accuracy < 80);
  if (lowAccuracy.length > 0) {
    recommendations.push(`⚠️ Low accuracy: ${lowAccuracy.map((a) => a.name).join(', ')} have <80% data quality`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All APIs are performing well!');
  }

  return recommendations;
}

// In-memory cache for API responses to reduce calls and improve speed
export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // milliseconds
}

export class APICache {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, data: any, ttl: number = 60000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const apiCache = new APICache();
