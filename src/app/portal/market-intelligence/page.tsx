'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, Globe, DollarSign, Zap, AlertTriangle } from 'lucide-react';

interface MarketData {
  commodities: {
    gold: { price: number; change: number; timestamp: string };
    silver: { price: number; change: number; timestamp: string };
    oil: { price: number; change: number; timestamp: string };
    naturalGas: { price: number; change: number; timestamp: string };
    copper: { price: number; change: number; timestamp: string };
    fertilizer: { price: number; change: number; timestamp: string };
  };
  forex: Record<string, { rate: number; change: number; timestamp: string }>;
  news: Array<{
    title: string;
    description: string;
    source: string;
    category: 'business' | 'war' | 'commodity' | 'policy';
    impact: 'high' | 'medium' | 'low';
    publishedAt: string;
  }>;
  tariffs: Record<
    string,
    {
      countryName: string;
      generalTariff: number;
      pharmaEquipmentTariff: number;
      metalsTariff: number;
    }
  >;
  timestamp: string;
}

export default function MarketIntelligencePage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'commodities' | 'forex' | 'news' | 'tariffs'>('commodities');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3600000); // Refresh every hour
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/market-intelligence');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/market-intelligence', {
        method: 'POST',
        body: JSON.stringify({ action: 'refresh' }),
      });
      await loadData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-3 text-blue-600" size={32} />
          <p className="text-gray-600">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-6 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Globe className="text-blue-600" size={32} />
              Market Intelligence
            </h1>
            <p className="text-gray-600 mt-1">Commodities, FX, News & Tariffs</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-8 sticky top-20 bg-white z-10">
        <div className="max-w-7xl mx-auto flex gap-6">
          {(['commodities', 'forex', 'news', 'tariffs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Commodities Tab */}
        {selectedTab === 'commodities' && data && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Gold', value: data.commodities.gold, unit: '$/oz', icon: '⚪' },
              { name: 'Silver', value: data.commodities.silver, unit: '$/oz', icon: '🔶' },
              { name: 'Oil', value: data.commodities.oil, unit: '$/barrel', icon: '🛢️' },
              { name: 'Natural Gas', value: data.commodities.naturalGas, unit: '$/MMBtu', icon: '💨' },
              { name: 'Copper', value: data.commodities.copper, unit: '$/lb', icon: '🟦' },
              { name: 'Fertilizer', value: data.commodities.fertilizer, unit: '$/tonne', icon: '🌾' },
            ].map((commodity) => (
              <div key={commodity.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600">{commodity.icon} {commodity.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{commodity.value.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{commodity.unit}</p>
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  commodity.value.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {commodity.value.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(commodity.value.change).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Forex Tab */}
        {selectedTab === 'forex' && data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.forex).map(([currency, { rate, change }]) => (
              <div key={currency} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600">USD/{currency}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{rate.toFixed(4)}</p>
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(change).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tariffs Tab */}
        {selectedTab === 'tariffs' && data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Country</th>
                  <th className="px-4 py-3 text-left font-semibold">General Tariff</th>
                  <th className="px-4 py-3 text-left font-semibold">Pharma Equipment</th>
                  <th className="px-4 py-3 text-left font-semibold">Metals</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(data.tariffs).map(([code, tariff]) => (
                  <tr key={code} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{tariff.countryName}</td>
                    <td className="px-4 py-3">{tariff.generalTariff.toFixed(1)}%</td>
                    <td className="px-4 py-3">{tariff.pharmaEquipmentTariff.toFixed(1)}%</td>
                    <td className="px-4 py-3">{tariff.metalsTariff.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* News Tab */}
        {selectedTab === 'news' && data && (
          <div className="space-y-4">
            {data.news.slice(0, 20).map((article, idx) => {
              const iconMap = {
                war: <AlertTriangle className="text-red-600" size={20} />,
                policy: <AlertCircle className="text-orange-600" size={20} />,
                commodity: <TrendingUp className="text-blue-600" size={20} />,
                business: <DollarSign className="text-green-600" size={20} />,
              };

              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{iconMap[article.category]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{article.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          article.impact === 'high'
                            ? 'bg-red-100 text-red-800'
                            : article.impact === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {article.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-4 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto text-xs text-gray-600">
          <p>Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Never'}</p>
          <p>Data updates automatically every hour from free market data APIs</p>
        </div>
      </footer>
    </div>
  );
}
