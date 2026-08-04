import { NextResponse } from 'next/server';

// Real-time pharma stock data
const pharmaStocks = [
  { symbol: 'GILD', name: 'Gilead Sciences', sector: 'Antiviral' },
  { symbol: 'AMGN', name: 'Amgen', sector: 'Biologics' },
  { symbol: 'REGN', name: 'Regeneron', sector: 'Immunology' },
  { symbol: 'BIIB', name: 'Biogen', sector: 'Neurology' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Diversified' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Diversified' },
  { symbol: 'MRK', name: 'Merck', sector: 'Oncology' },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Immunology' },
  { symbol: 'TMO', name: 'Thermo Fisher', sector: 'Equipment' },
  { symbol: 'CELG', name: 'Celgene (BMS)', sector: 'Oncology' },
];

async function fetchFromFinnhub() {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      console.warn('Finnhub API key not configured');
      return null;
    }

    const stocks = [];

    for (const stock of pharmaStocks) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`,
          { cache: 'no-store' }
        );

        if (response.ok) {
          const data = await response.json();
          stocks.push({
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            price: data.c || 0,
            change: data.d || 0,
            changePercent: data.dp || 0,
            high: data.h || 0,
            low: data.l || 0,
            open: data.o || 0,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to fetch ${stock.symbol}:`, error);
      }
    }

    return stocks.length > 0 ? stocks : null;
  } catch (error) {
    console.error('Finnhub fetch error:', error);
    return null;
  }
}

// Fallback mock data (when API not configured)
function getMockData() {
  return pharmaStocks.map((stock) => {
    const basePrice = Math.random() * 300 + 50;
    const change = (Math.random() - 0.4) * 10;
    return {
      ...stock,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      high: parseFloat((basePrice * 1.02).toFixed(2)),
      low: parseFloat((basePrice * 0.98).toFixed(2)),
      open: parseFloat((basePrice - change).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  });
}

export async function GET() {
  try {
    const liveData = await fetchFromFinnhub();
    const stocks = liveData || getMockData();

    // Sort by change percent (top gainers first)
    stocks.sort((a: any, b: any) => b.changePercent - a.changePercent);

    return NextResponse.json({
      status: 'success',
      source: liveData ? 'Finnhub (Real-time)' : 'Mock (Fallback)',
      stocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Pharma stocks API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        stocks: getMockData(),
        timestamp: new Date().toISOString(),
      },
      { status: 200 } // Return 200 with mock data
    );
  }
}
