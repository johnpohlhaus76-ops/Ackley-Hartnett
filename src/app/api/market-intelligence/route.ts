import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedMarketData } from '@/lib/market-apis';

export const revalidate = 3600; // Cache for 1 hour

// In-memory cache with TTL
const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMinutes = 60) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMinutes * 60 * 1000,
  });
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'market-intelligence';

    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch fresh data
    const marketData = await getAggregatedMarketData();

    // Cache the result
    setCache(cacheKey, marketData, 60); // 1 hour cache

    return NextResponse.json({
      success: true,
      data: marketData,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Market intelligence API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market data',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'refresh') {
      // Force refresh cache
      cache.delete('market-intelligence');
      const marketData = await getAggregatedMarketData();
      setCache('market-intelligence', marketData, 60);

      return NextResponse.json({
        success: true,
        message: 'Market data refreshed',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Request failed', details: error?.message },
      { status: 500 }
    );
  }
}
