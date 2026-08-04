'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Zap } from 'lucide-react';

interface MarketData {
  commodities: {
    metals: Record<string, any>;
    energy: Record<string, any>;
    agriculture: Record<string, any>;
  };
  pharmaStocks: any[];
  timestamp: string;
}

export default function MarketProPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [pharmaStocks, setPharmaStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const [marketRes, stocksRes] = await Promise.all([
        fetch('/api/market-intelligence'),
        fetch('/api/pharma-stocks'),
      ]);

      const marketJson = await marketRes.json();
      const stocksJson = await stocksRes.json();

      setMarketData(marketJson);
      setPharmaStocks(stocksJson.stocks || []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const getChangeColor = (change: number) => (change >= 0 ? 'text-emerald-400' : 'text-red-400');
  const getChangeBg = (change: number) => (change >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30');

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-16 h-16 text-blue-500/50 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300 font-semibold">Loading live market data...</p>
          <p className="text-slate-500 text-sm mt-2">Connecting to real-time feeds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 min-h-screen">
      {/* Premium Header */}
      <header className="border-b border-blue-500/20 px-8 py-6 sticky top-0 z-20 backdrop-blur-xl bg-slate-900/95">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Market Intelligence Pro
              </h1>
              <p className="text-slate-400 mt-1">Real-time commodities, energy, and pharma stocks</p>
            </div>
            <button
              onClick={loadMarketData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-300 hover:bg-blue-600/30 transition-colors"
            >
              <RefreshCw size={18} className="animate-spin-slow" />
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-4">Last updated: {lastUpdate}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Pharma Stock Ticker */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">💊 Pharma & Biotech Stocks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {pharmaStocks.slice(0, 10).map((stock) => (
              <div
                key={stock.symbol}
                className={`relative group p-4 rounded-xl border-2 transition-all backdrop-blur-sm overflow-hidden ${getChangeBg(stock.changePercent)}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-50 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-100">{stock.symbol}</p>
                      <p className="text-xs text-slate-400 mt-1">{stock.sector}</p>
                    </div>
                    {stock.changePercent >= 0 ? (
                      <TrendingUp size={16} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-cyan-300">${stock.price.toFixed(2)}</p>
                  <p className={`text-sm font-semibold ${getChangeColor(stock.changePercent)}`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commodities Grid */}
        {marketData && (
          <>
            {/* Precious Metals */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">🥇 Precious Metals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(marketData.commodities.metals).map(([key, metal]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-6 rounded-xl border-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 ${getChangeBg(metal.changePercent)}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 capitalize">{key}</h3>
                        <p className="text-xs text-slate-500 mt-1">Spot Price (USD/oz)</p>
                      </div>
                      {metal.changePercent >= 0 ? (
                        <TrendingUp size={20} className="text-emerald-400" />
                      ) : (
                        <TrendingDown size={20} className="text-red-400" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-cyan-400 mb-2">${metal.price?.toFixed(2) || 'N/A'}</p>
                    <div className="flex justify-between text-sm">
                      <span className={`font-semibold ${getChangeColor(metal.changePercent)}`}>
                        {metal.changePercent > 0 ? '+' : ''}{metal.changePercent?.toFixed(2) || '0'}%
                      </span>
                      <span className="text-slate-400">{metal.change?.toFixed(2) || '0'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Energy Markets */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">⚡ Energy Markets</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(marketData.commodities.energy).map(([key, commodity]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-6 rounded-xl border-2 bg-gradient-to-br from-orange-900/20 to-slate-900/50 border-orange-500/30`}
                  >
                    <h3 className="text-lg font-bold text-slate-100 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</h3>
                    <p className="text-3xl font-bold text-orange-400 mb-2">
                      ${commodity.price?.toFixed(2) || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-400">{commodity.changePercent?.toFixed(2) || '0'}% change</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Agriculture */}
            <section>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">🌾 Agriculture & Fertilizer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(marketData.commodities.agriculture).map(([key, commodity]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-6 rounded-xl border-2 bg-gradient-to-br from-green-900/20 to-slate-900/50 border-green-500/30`}
                  >
                    <h3 className="text-lg font-bold text-slate-100 capitalize mb-2">{key}</h3>
                    <p className="text-3xl font-bold text-green-400 mb-2">${commodity.price?.toFixed(2) || 'N/A'}</p>
                    <p className="text-sm text-slate-400">{commodity.changePercent?.toFixed(2) || '0'}% change</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
