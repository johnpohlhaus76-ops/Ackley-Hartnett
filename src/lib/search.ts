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
const INDEX_TTL = 3600000;

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
  const accountsData = loadJSON('accounts.json');
  const customers = Array.isArray(accountsData) ? accountsData : (accountsData as any)?.accounts || [];
  const quotes = loadJSON('quotes-2025.json');
  const documents = loadJSON('datasheets.json') || [];

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

  if (types.includes('customer')) {
    for (const customer of index.customers) {
      const score = scoreMatch(customer, query, ['name', 'city', 'state', 'country']);

      if (score > 0) {
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

  if (types.includes('quote')) {
    for (const quote of index.quotes) {
      const score = scoreMatch(quote, query, ['Customer', 'Address', 'Contact', 'Salesperson']);

      if (score > 0) {
        results.push({
          id: quote.Estimate || quote.id,
          type: 'quote',
          title: `Quote ${quote.Estimate || quote.id} - ${quote.Customer}`,
          subtitle: `Status: ${quote.Status} | Value: $${quote['Total Price']?.toFixed(2) || '0'}`,
          metadata: quote,
          score,
          matches: [quote.Customer],
        });
      }
    }
  }

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

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

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
