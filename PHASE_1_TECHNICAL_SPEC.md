# Phase 1 Technical Specification - Foundation Layer
**Duration**: Weeks 1-3  
**Deliverables**: Search engine, Health score calculator, Spare parts model  
**Constraint**: Economical, reuse existing patterns (plant-operations.ts, existing API routes)

---

## 1.1 ADVANCED FULL-TEXT SEARCH

### Detailed Requirements

**Search Targets** (4 data sources):
- **Machines**: serial #, model, customer, country, address, shipping date
- **Customers** (from accounts.json): company name, location, contacts
- **Quotes** (from quotes-2025.json): customer, description, salesperson
- **Documents** (from datasheets): name, file

**Search Algorithm** (Simple Scoring):
```typescript
// Scoring: exact match (100) > contains at start (50) > contains (10) > fuzzy (5)
type SearchScore = {
  document: any;
  type: 'machine' | 'customer' | 'quote' | 'document';
  score: number;
  matches: string[];
};

function searchScore(doc: any, query: string, fields: string[]): number {
  const q = query.toLowerCase();
  let score = 0;
  
  for (const field of fields) {
    const value = String(doc[field] || '').toLowerCase();
    if (value === q) score += 100;
    else if (value.startsWith(q)) score += 50;
    else if (value.includes(q)) score += 10;
  }
  
  return score;
}
```

### File: `/src/lib/search.ts`

```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SearchResult {
  id: string;
  type: 'machine' | 'customer' | 'quote' | 'document';
  title: string;
  subtitle?: string;
  metadata: Record<string, any>;
  score: number;
  matches: string[];
}

export interface SearchIndex {
  machines: any[];
  customers: any[];
  quotes: any[];
  documents: any[];
  timestamp: number;
}

let cachedIndex: SearchIndex | null = null;
const INDEX_TTL = 3600000; // 1 hour

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

export function buildSearchIndex(): SearchIndex {
  if (cachedIndex && Date.now() - cachedIndex.timestamp < INDEX_TTL) {
    return cachedIndex;
  }

  const machines = loadJSON('machines-sold.json');
  const customers = loadJSON('accounts.json')?.accounts || [];
  const quotes = loadJSON('quotes-2025.json');
  const documents = loadJSON('datasheets.json');

  cachedIndex = {
    machines: machines || [],
    customers,
    quotes: quotes || [],
    documents,
    timestamp: Date.now(),
  };

  return cachedIndex;
}

function scoreMatch(doc: any, query: string, fields: string[]): number {
  const q = query.toLowerCase();
  let score = 0;

  for (const field of fields) {
    const value = String(doc[field] || '').toLowerCase();
    if (value === q) score += 100;
    else if (value.startsWith(q)) score += 50;
    else if (value.includes(q)) score += 10;
  }

  return score;
}

export function search(
  query: string,
  options: {
    limit?: number;
    types?: ('machine' | 'customer' | 'quote' | 'document')[];
    filters?: {
      country?: string;
      status?: string;
      dateRange?: { from: string; to: string };
    };
  } = {}
): SearchResult[] {
  const { limit = 50, types = ['machine', 'customer', 'quote', 'document'], filters = {} } = options;
  const index = buildSearchIndex();
  const results: SearchResult[] = [];

  // Search machines
  if (types.includes('machine')) {
    for (const machine of index.machines) {
      const score = scoreMatch(machine, query, [
        'Serial Number',
        'serialNumber',
        'Customer',
        'customer',
        'Description',
        'model',
        'Country',
        'country',
        'Full Address',
        'address',
      ]);

      if (score > 0) {
        // Apply filters
        if (filters.country && machine.Country !== filters.country) continue;

        results.push({
          id: String(machine['Serial Number'] || machine.serialNumber),
          type: 'machine',
          title: `${machine.Customer || machine.customer} - SN: ${
            machine['Serial Number'] || machine.serialNumber
          }`,
          subtitle: `${machine.Description || machine.model} | ${
            machine.Country || machine.country
          }`,
          metadata: machine,
          score,
          matches: [machine.Customer || machine.customer],
        });
      }
    }
  }

  // Search customers
  if (types.includes('customer')) {
    for (const customer of index.customers) {
      const score = scoreMatch(customer, query, ['name', 'city', 'state', 'country']);

      if (score > 0) {
        // Apply filters
        if (filters.country && customer.country !== filters.country) continue;

        results.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: `${customer.city}, ${customer.state} | ${customer.country}`,
          metadata: customer,
          score,
          matches: [customer.name],
        });
      }
    }
  }

  // Search quotes
  if (types.includes('quote')) {
    for (const quote of index.quotes) {
      const score = scoreMatch(quote, query, ['Customer', 'Address', 'Contact', 'Salesperson']);

      if (score > 0) {
        results.push({
          id: quote.Estimate || quote.id,
          type: 'quote',
          title: `Quote ${quote.Estimate || quote.id} - ${quote.Customer}`,
          subtitle: `Status: ${quote.Status} | Value: $${quote['Total Price']?.toFixed(2)}`,
          metadata: quote,
          score,
          matches: [quote.Customer],
        });
      }
    }
  }

  // Search documents
  if (types.includes('document')) {
    for (const doc of index.documents) {
      const score = scoreMatch(doc, query, ['name', 'slug']);

      if (score > 0) {
        results.push({
          id: doc.slug,
          type: 'document',
          title: doc.name,
          subtitle: `Datasheet`,
          metadata: doc,
          score,
          matches: [doc.name],
        });
      }
    }
  }

  // Sort by score (descending) and return
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Export for use in components
export function useFacets() {
  const index = buildSearchIndex();
  const countries = new Set<string>();
  const models = new Set<string>();
  const statuses = new Set<string>();

  for (const machine of index.machines) {
    countries.add(machine.Country || machine.country);
    models.add(machine.Description || machine.model);
  }

  return {
    countries: Array.from(countries).sort(),
    models: Array.from(models).sort(),
    statuses: ['active', 'maintenance', 'inactive'],
  };
}
```

### File: `/src/app/api/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { search, SearchResult } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const type = searchParams.getAll('type') as any[];
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!q || q.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters',
      });
    }

    const results: SearchResult[] = search(q, {
      limit,
      types: type.length > 0 ? type : undefined,
      filters: {
        country: country || undefined,
      },
    });

    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// POST for bulk search + advanced filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, types, filters, limit } = body;

    const results = search(q, { types, filters, limit });

    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

### File: `/src/app/portal/search/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SearchResult } from "@/lib/search";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const typeParams = selectedType.length
          ? selectedType.map((t) => `type=${t}`).join("&")
          : "";
        const url = `/api/search?q=${encodeURIComponent(query)}&${typeParams}&limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedType]);

  const typeOptions = [
    { value: "machine", label: "Machines", icon: "⚙️" },
    { value: "customer", label: "Customers", icon: "🏢" },
    { value: "quote", label: "Quotes", icon: "📄" },
    { value: "document", label: "Datasheets", icon: "📋" },
  ];

  const resultsByType = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Search</h1>
        <p className="text-gray-600">Search across all machines, customers, quotes, and documents</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer, serial #, model, location..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {typeOptions.map((type) => (
          <button
            key={type.value}
            onClick={() =>
              setSelectedType((prev) =>
                prev.includes(type.value)
                  ? prev.filter((t) => t !== type.value)
                  : [...prev, type.value]
              )
            }
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedType.includes(type.value)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {query && (
        <div>
          {loading && <p className="text-gray-500">Searching...</p>}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="text-gray-500">No results found for "{query}"</p>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Found <strong>{results.length}</strong> results
              </p>

              {Object.entries(resultsByType).map(([type, typeResults]) => (
                <div key={type} className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                    {type}s ({typeResults.length})
                  </h2>
                  <div className="space-y-2">
                    {typeResults.slice(0, 10).map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{result.title}</h3>
                            {result.subtitle && (
                              <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>
                            )}
                          </div>
                          <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={20} />
                        </div>
                      </div>
                    ))}
                    {typeResults.length > 10 && (
                      <p className="text-sm text-gray-500 pt-2">
                        +{typeResults.length - 10} more results
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query && (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">Start typing to search...</p>
        </div>
      )}
    </div>
  );
}
```

---

## 1.2 CUSTOMER HEALTH SCORE ENGINE

### Scoring Algorithm

```
Health Score = 0-100 (composite weighted score)

Components:
├─ Machine Recency (40%): Days since last install
│  └─ 0 years: 100 points
│  └─ 5 years: 50 points
│  └─ 10+ years: 0 points
│
├─ Order Frequency (30%): Orders per year vs industry avg
│  └─ >2x avg: 100 points
│  └─ avg: 70 points
│  └─ <0.5x avg: 10 points
│
├─ Quote-to-Order Conversion (20%): Accepted quotes / sent quotes
│  └─ >60%: 100 points
│  └─ 30-60%: 70 points
│  └─ <30%: 20 points
│
└─ Engagement (10%): Contact responsiveness proxy
   └─ Last contact <30 days: 100 points
   └─ Last contact <90 days: 70 points
   └─ Last contact >90 days: 20 points
```

### File: `/src/lib/health-score.ts`

```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface HealthScoreBreakdown {
  machineRecency: number;    // 0-100
  orderFrequency: number;    // 0-100
  conversionRate: number;    // 0-100
  engagement: number;        // 0-100
  overallScore: number;      // 0-100
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
  // Count orders in last 12 months
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

  // Benchmark: avg 0.5 quotes per machine per year
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

  if (customerQuotes.length === 0) return 50; // Neutral if no quotes

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

  if (customerQuotes.length === 0) return 30; // Low engagement if no quotes

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

  // Weighted average
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
  const accounts = loadJSON('accounts.json');
  const customers = accounts?.accounts || [];

  return customers.map((c) => calculateHealthScore(c.id, c.name)).sort(
    (a, b) => b.score.overallScore - a.score.overallScore
  );
}

// Cache for 1 hour
let healthScoreCache: Map<string, { data: CustomerHealth; timestamp: number }> = new Map();

export function getHealthScore(customerId: string): CustomerHealth {
  const cached = healthScoreCache.get(customerId);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.data;
  }

  const score = calculateHealthScore(customerId, customerId);
  healthScoreCache.set(customerId, { data: score, timestamp: Date.now() });
  return score;
}
```

### File: `/src/app/api/health-scores/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getHealthScore, calculateBulkHealthScores } from '@/lib/health-score';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const bulk = searchParams.get('bulk') === 'true';

    if (bulk) {
      const scores = calculateBulkHealthScores();
      return NextResponse.json({ scores });
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId required' },
        { status: 400 }
      );
    }

    const score = getHealthScore(customerId);
    return NextResponse.json({ score });
  } catch (error) {
    console.error('Health score error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}
```

---

## 1.3 SPARE PARTS INVENTORY DATA MODEL

### File: `/data/spare-parts-catalog.json`

```json
{
  "parts": [
    {
      "id": "SP-001",
      "partNumber": "AH-SEAL-PRIMARY-001",
      "name": "Primary Seal Assembly",
      "category": "Seals & Gaskets",
      "description": "Main sealing assembly for tablet compression",
      "price": 1250,
      "leadTime": "2-3 weeks",
      "applicableModels": ["FB1", "FB2", "TB200", "TB300"],
      "minStockLevel": 5,
      "reorderQuantity": 10,
      "weight": 2.5,
      "supplier": "Ackley-Hartnett Supply"
    },
    {
      "id": "SP-002",
      "partNumber": "AH-BELT-DRIVE-002",
      "name": "Drive Belt Assembly",
      "category": "Power Transmission",
      "description": "Main drive belt for machine rotation",
      "price": 850,
      "leadTime": "1-2 weeks",
      "applicableModels": ["FB1", "FB2"],
      "minStockLevel": 3,
      "reorderQuantity": 8,
      "weight": 1.2,
      "supplier": "Ackley-Hartnett Supply"
    },
    {
      "id": "SP-003",
      "partNumber": "AH-BEARING-MAIN-003",
      "name": "Main Bearing Assembly",
      "category": "Bearings",
      "description": "Primary bearing for main shaft",
      "price": 2100,
      "leadTime": "3-4 weeks",
      "applicableModels": ["TB200", "TB300", "TB500"],
      "minStockLevel": 2,
      "reorderQuantity": 5,
      "weight": 4.0,
      "supplier": "Ackley-Hartnett Supply"
    },
    {
      "id": "SP-004",
      "partNumber": "AH-VALVE-PRESS-004",
      "name": "Pressure Valve Assembly",
      "category": "Hydraulics",
      "description": "System pressure relief valve",
      "price": 1850,
      "leadTime": "2-3 weeks",
      "applicableModels": ["TB200", "TB300"],
      "minStockLevel": 4,
      "reorderQuantity": 8,
      "weight": 3.1,
      "supplier": "Ackley-Hartnett Supply"
    },
    {
      "id": "SP-005",
      "partNumber": "AH-PUMP-GEAR-005",
      "name": "Gear Pump Assembly",
      "category": "Pumps",
      "description": "Internal gear pump for circulation",
      "price": 3200,
      "leadTime": "4-5 weeks",
      "applicableModels": ["TB300", "TB500"],
      "minStockLevel": 1,
      "reorderQuantity": 3,
      "weight": 6.5,
      "supplier": "Ackley-Hartnett Supply"
    }
  ],
  "locations": {
    "location_USA_NJ": {
      "address": "Newark, NJ Warehouse",
      "country": "USA",
      "region": "Northeast",
      "capacity": 50000
    },
    "location_USA_CA": {
      "address": "Los Angeles, CA Warehouse",
      "country": "USA",
      "region": "West Coast",
      "capacity": 40000
    },
    "location_EU_NL": {
      "address": "Amsterdam, Netherlands Hub",
      "country": "Netherlands",
      "region": "Europe",
      "capacity": 30000
    },
    "location_APAC_SG": {
      "address": "Singapore Regional Center",
      "country": "Singapore",
      "region": "APAC",
      "capacity": 25000
    }
  },
  "inventory": {
    "location_USA_NJ": {
      "SP-001": {
        "quantity": 12,
        "lastRestocked": "2026-07-15",
        "nextShipment": "2026-09-01"
      },
      "SP-002": {
        "quantity": 5,
        "lastRestocked": "2026-06-10",
        "nextShipment": null
      },
      "SP-003": {
        "quantity": 2,
        "lastRestocked": "2026-08-01",
        "nextShipment": "2026-09-15"
      }
    },
    "location_USA_CA": {
      "SP-001": {
        "quantity": 8,
        "lastRestocked": "2026-07-20",
        "nextShipment": "2026-08-20"
      },
      "SP-002": {
        "quantity": 3,
        "lastRestocked": "2026-05-20",
        "nextShipment": "2026-09-10"
      },
      "SP-004": {
        "quantity": 1,
        "lastRestocked": "2026-07-01",
        "nextShipment": "2026-08-15"
      }
    }
  }
}
```

### File: `/src/lib/spare-parts.ts`

```typescript
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

export interface SpareParts Catalog {
  parts: SparePart[];
  locations: Record<string, Location>;
  inventory: Record<string, Record<string, PartInventoryLocation>>;
}

let catalog: SpareParts Catalog | null = null;

function loadCatalog(): SpareParts Catalog {
  if (catalog) return catalog;

  try {
    const paths = [
      join(process.cwd(), 'data', 'spare-parts-catalog.json'),
      join(process.cwd(), 'public', 'data', 'spare-parts-catalog.json'),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        catalog = JSON.parse(readFileSync(path, 'utf-8'));
        return catalog;
      }
    }

    throw new Error('Spare parts catalog not found');
  } catch (e) {
    console.error('Error loading spare parts catalog:', e);
    return {
      parts: [],
      locations: {},
      inventory: {},
    };
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
```

### File: `/src/app/api/spare-parts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  getPartsByModel,
  getInventoryByLocation,
  getLowStockAlerts,
  estimatePartAvailability,
} from '@/lib/spare-parts';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'by-model') {
      const model = searchParams.get('model');
      if (!model) return NextResponse.json({ error: 'model required' }, { status: 400 });
      const parts = getPartsByModel(model);
      return NextResponse.json({ parts });
    }

    if (action === 'by-location') {
      const locationId = searchParams.get('locationId');
      if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 });
      const inventory = getInventoryByLocation(locationId);
      return NextResponse.json({ inventory });
    }

    if (action === 'low-stock-alerts') {
      const alerts = getLowStockAlerts();
      return NextResponse.json({ alerts, count: alerts.length });
    }

    if (action === 'check-availability') {
      const partId = searchParams.get('partId');
      const quantity = parseInt(searchParams.get('quantity') || '1');
      if (!partId) return NextResponse.json({ error: 'partId required' }, { status: 400 });
      const availability = estimatePartAvailability(partId, quantity);
      return NextResponse.json(availability);
    }

    return NextResponse.json({ error: 'action parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Spare parts error:', error);
    return NextResponse.json(
      { error: 'Spare parts lookup failed' },
      { status: 500 }
    );
  }
}
```

---

## Types to Add to `/src/lib/types.ts`

```typescript
// Search
export interface SearchResult {
  id: string;
  type: 'machine' | 'customer' | 'quote' | 'document';
  title: string;
  subtitle?: string;
  metadata: Record<string, any>;
  score: number;
  matches: string[];
}

// Health Score
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

// Spare Parts
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
```

---

## Implementation Checklist for Phase 1

- [ ] Create `/src/lib/search.ts` with full-text search logic
- [ ] Create `/src/app/api/search/route.ts` API endpoint
- [ ] Create `/src/app/portal/search/page.tsx` UI page
- [ ] Create `/src/lib/health-score.ts` scoring algorithm
- [ ] Create `/src/app/api/health-scores/route.ts` API endpoint
- [ ] Create `/data/spare-parts-catalog.json` with sample data
- [ ] Create `/src/lib/spare-parts.ts` inventory functions
- [ ] Create `/src/app/api/spare-parts/route.ts` API endpoint
- [ ] Update `/src/lib/types.ts` with new interfaces
- [ ] Update `/src/components/Sidebar.tsx` to add Search link
- [ ] Test search with sample queries
- [ ] Test health scores for top 10 customers
- [ ] Test spare parts by model & location

---

## Testing Commands

```bash
# Test search API
curl "http://localhost:3000/api/search?q=smith&type=machine&type=customer&limit=20"

# Test health scores
curl "http://localhost:3000/api/health-scores?customerId=405&bulk=false"

# Bulk health scores
curl "http://localhost:3000/api/health-scores?bulk=true"

# Spare parts by model
curl "http://localhost:3000/api/spare-parts?action=by-model&model=FB1"

# Low stock alerts
curl "http://localhost:3000/api/spare-parts?action=low-stock-alerts"
```
