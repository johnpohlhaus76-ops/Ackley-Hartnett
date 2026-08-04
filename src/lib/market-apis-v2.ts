// Real-time Market Data APIs - Updated with live commodity & stock feeds
// Uses: CommodityPriceAPI, Finnhub, OilPriceAPI

export interface MarketDataV2 {
  commodities: {
    metals: Record<string, any>;
    energy: Record<string, any>;
    agriculture: Record<string, any>;
  };
  pharmaStocks: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    timestamp: string;
  }>;
  timestamp: string;
}

// CommodityPriceAPI: Real-time commodity prices
async function fetchCommodityPrices() {
  try {
    const commodities: Record<string, any> = {};
    const apiKey = process.env.COMMODITY_PRICE_API_KEY || '';

    if (!apiKey) {
      console.warn('CommodityPriceAPI key not configured - using fallback');
      return null;
    }

    // Fetch gold, silver, copper, oil, natural gas, wheat, corn
    const symbols = ['XAU', 'XAG', 'CU', 'CL', 'NG', 'ZWH', 'ZCH'];
    const baseUrl = 'https://api.commoditypriceapi.com/v1/prices';

    const response = await fetch(`${baseUrl}?api_key=${apiKey}&symbols=${symbols.join(',')}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || null;
    }
    return null;
  } catch (error) {
    console.error('CommodityPriceAPI error:', error);
    return null;
  }
}

// Finnhub: Real-time pharma stock prices
async function fetchPharmaStocks() {
  try {
    const apiKey = process.env.FINNHUB_API_KEY || '';

    if (!apiKey) {
      console.warn('Finnhub API key not configured');
      return [];
    }

    const pharmaSymbols = ['GILD', 'AMGN', 'REGN', 'BIIB', 'CELG', 'JNJ', 'PFE', 'MRK', 'ABBV', 'TMO'];
    const stocks = [];

    for (const symbol of pharmaSymbols) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
          { cache: 'no-store' }
        );

        if (response.ok) {
          const data = await response.json();
          stocks.push({
            symbol,
            name: symbol, // Finnhub quote doesn't include name, would need separate call
            price: data.c || 0,
            change: data.d || 0,
            changePercent: data.dp || 0,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error(`Failed to fetch ${symbol}:`, e);
      }
    }

    return stocks;
  } catch (error) {
    console.error('Finnhub error:', error);
    return [];
  }
}

// OilPriceAPI: Real-time oil & natural gas prices
async function fetchEnergyPrices() {
  try {
    const apiKey = process.env.OIL_PRICE_API_KEY || '';

    if (!apiKey) {
      console.warn('OilPriceAPI key not configured');
      return null;
    }

    const response = await fetch(`https://api.oilpriceapi.com/v1/brent?api_key=${apiKey}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || null;
    }
    return null;
  } catch (error) {
    console.error('OilPriceAPI error:', error);
    return null;
  }
}

// GoldAPI.io: Real-time precious metals
async function fetchPreciousMetals() {
  try {
    const apiKey = process.env.GOLD_API_KEY || '';

    if (!apiKey) {
      console.warn('GoldAPI key not configured');
      return null;
    }

    const response = await fetch(
      `https://api.goldapi.io/v2/spot/latest?currency=USD&key=${apiKey}`,
      { cache: 'no-store' }
    );

    if (response.ok) {
      const data = await response.json();
      return data.price || null;
    }
    return null;
  } catch (error) {
    console.error('GoldAPI error:', error);
    return null;
  }
}

export async function getMarketDataV2(): Promise<MarketDataV2 | null> {
  try {
    const [commodities, stocks, energy, metals] = await Promise.all([
      fetchCommodityPrices(),
      fetchPharmaStocks(),
      fetchEnergyPrices(),
      fetchPreciousMetals(),
    ]);

    return {
      commodities: {
        metals: metals || {},
        energy: energy || {},
        agriculture: commodities || {},
      },
      pharmaStocks: stocks || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Market data error:', error);
    return null;
  }
}

// Fallback: Mock data with real structure (when APIs not configured)
export function getMarketDataFallback(): MarketDataV2 {
  const now = new Date();
  return {
    commodities: {
      metals: {
        gold: {
          symbol: 'XAU',
          price: 2045.5,
          change: 12.3,
          changePercent: 0.61,
          timestamp: now.toISOString(),
        },
        silver: {
          symbol: 'XAG',
          price: 24.85,
          change: -0.42,
          changePercent: -1.67,
          timestamp: now.toISOString(),
        },
        copper: {
          symbol: 'CU',
          price: 3.95,
          change: 0.08,
          changePercent: 2.07,
          timestamp: now.toISOString(),
        },
      },
      energy: {
        wti: {
          symbol: 'CL',
          price: 78.45,
          change: 1.2,
          changePercent: 1.56,
          timestamp: now.toISOString(),
        },
        naturalGas: {
          symbol: 'NG',
          price: 2.65,
          change: -0.08,
          changePercent: -2.94,
          timestamp: now.toISOString(),
        },
      },
      agriculture: {
        wheat: {
          symbol: 'ZWH',
          price: 5.85,
          change: 0.12,
          changePercent: 2.09,
          timestamp: now.toISOString(),
        },
        corn: {
          symbol: 'ZCH',
          price: 4.22,
          change: -0.05,
          changePercent: -1.17,
          timestamp: now.toISOString(),
        },
        fertilizer: {
          symbol: 'UREA',
          price: 285.5,
          change: 2.1,
          changePercent: 0.74,
          timestamp: now.toISOString(),
        },
      },
    },
    pharmaStocks: [
      {
        symbol: 'GILD',
        name: 'Gilead Sciences',
        price: 94.23,
        change: 2.15,
        changePercent: 2.33,
        timestamp: now.toISOString(),
      },
      {
        symbol: 'AMGN',
        name: 'Amgen',
        price: 287.65,
        change: -1.23,
        changePercent: -0.43,
        timestamp: now.toISOString(),
      },
      {
        symbol: 'REGN',
        name: 'Regeneron',
        price: 1045.8,
        change: 12.5,
        changePercent: 1.21,
        timestamp: now.toISOString(),
      },
      {
        symbol: 'BIIB',
        name: 'Biogen',
        price: 235.45,
        change: -3.2,
        changePercent: -1.34,
        timestamp: now.toISOString(),
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        price: 156.78,
        change: 0.8,
        changePercent: 0.51,
        timestamp: now.toISOString(),
      },
    ],
    timestamp: now.toISOString(),
  };
}
