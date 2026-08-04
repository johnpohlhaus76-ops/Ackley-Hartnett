'use client';

import { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, DollarSign, Box, Users, AlertCircle } from 'lucide-react';

interface PharmaStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface PlantData {
  id: string;
  name: string;
  country: string;
  address: string;
  machines: any[];
  orders: any[];
  quotes: any[];
  uploads: any[];
  pos: any[];
  contacts: any[];
  metrics: {
    totalMachines: number;
    activeMachines: number;
    totalOrders: number;
    totalOrderValue: number;
    totalQuoteValue: number;
    pendingPOs: number;
  };
}

export default function Accounts360ProPage() {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [pharmaStocks, setPharmaStocks] = useState<PharmaStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'machines' | 'orders' | 'quotes' | 'pos' | 'contacts'>('overview');

  useEffect(() => {
    loadData();
    const stockInterval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(stockInterval);
  }, []);

  const loadData = async () => {
    try {
      const [plantsRes, stocksRes] = await Promise.all([
        fetch('/api/plants/operations'),
        fetch('/api/pharma-stocks'), // New endpoint for pharma stocks
      ]);

      const plantsData = await plantsRes.json();
      const stocksData = await stocksRes.json();

      if (plantsData.success) {
        setPlants(plantsData.plants);
        if (plantsData.plants?.length > 0) {
          setSelectedPlant(plantsData.plants[0]);
        }
      }

      if (stocksData.stocks) {
        setPharmaStocks(stocksData.stocks);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getStockBgColor = (change: number) => {
    return change >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 min-h-screen">
      {/* Premium Header */}
      <header className="border-b border-blue-500/20 px-8 py-6 sticky top-0 z-20 backdrop-blur-xl bg-slate-900/95">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Accounts 360 Pro
                </h1>
                <p className="text-slate-400 text-sm">Enterprise plant operations dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 font-mono text-sm">
                {selectedPlant?.name || 'No plant selected'}
              </p>
              <p className="text-slate-500 text-xs">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <a
              href="/portal/war-room"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg font-semibold text-white text-sm transition-all duration-200"
            >
              🌍 War Room
            </a>
            <a
              href="/portal/market-pro"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white text-sm transition-all duration-200"
            >
              📈 Market Pro
            </a>
            <a
              href="/portal/api-test"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-white text-sm transition-all duration-200"
            >
              🔍 API Test
            </a>
          </div>

          {/* Live Pharma Stock Ticker */}
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 overflow-x-auto">
            <div className="flex gap-6 min-w-max">
              {pharmaStocks.slice(0, 5).map((stock) => (
                <div
                  key={stock.symbol}
                  className={`flex items-center gap-3 px-4 py-2 rounded border ${getStockBgColor(stock.change)}`}
                >
                  <div>
                    <p className="font-bold text-slate-100 text-sm">{stock.symbol}</p>
                    <p className="text-xs text-slate-400">${stock.price.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${getStockColor(stock.change)}`}>
                    {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-medium">{stock.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Plant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlant(plant)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                selectedPlant?.id === plant.id
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-blue-500/50 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-slate-500">{plant.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">{plant.metrics.totalMachines}</p>
                  <p className="text-xs text-slate-400">machines</p>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-700/50 rounded p-2">
                  <p className="text-xs text-slate-400">Active</p>
                  <p className="font-bold text-emerald-400">{plant.metrics.activeMachines}</p>
                </div>
                <div className="bg-slate-700/50 rounded p-2">
                  <p className="text-xs text-slate-400">Value</p>
                  <p className="font-bold text-cyan-400">${(plant.metrics.totalOrderValue / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedPlant && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group bg-gradient-to-br from-emerald-500/10 via-slate-800/50 to-slate-900/50 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Machines</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-2">
                      {selectedPlant.metrics.totalMachines}
                    </p>
                  </div>
                  <Box className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" size={24} />
                </div>
              </div>

              <div className="relative group bg-gradient-to-br from-blue-500/10 via-slate-800/50 to-slate-900/50 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Order Value</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">
                      ${(selectedPlant.metrics.totalOrderValue / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <DollarSign className="text-blue-500/50 group-hover:text-blue-400 transition-colors" size={24} />
                </div>
              </div>

              <div className="relative group bg-gradient-to-br from-cyan-500/10 via-slate-800/50 to-slate-900/50 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Active Orders</p>
                    <p className="text-3xl font-bold text-cyan-400 mt-2">
                      {selectedPlant.metrics.totalOrders}
                    </p>
                  </div>
                  <TrendingUp className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors" size={24} />
                </div>
              </div>

              <div className="relative group bg-gradient-to-br from-purple-500/10 via-slate-800/50 to-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Contacts</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">
                      {selectedPlant.contacts?.length || 0}
                    </p>
                  </div>
                  <Users className="text-purple-500/50 group-hover:text-purple-400 transition-colors" size={24} />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-700/50">
              <div className="flex gap-1 flex-wrap">
                {['overview', 'machines', 'orders', 'quotes', 'pos', 'contacts'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-slate-300 font-semibold mb-3">📍 Location</h4>
                    <p className="text-slate-400 text-sm">{selectedPlant.address}</p>
                  </div>
                  <div>
                    <h4 className="text-slate-300 font-semibold mb-3">📊 Performance</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-400">
                        Active: <span className="text-emerald-400 font-bold">{selectedPlant.metrics.activeMachines}</span> / {selectedPlant.metrics.totalMachines}
                      </p>
                      <p className="text-slate-400">
                        Quote Value: <span className="text-cyan-400 font-bold">${(selectedPlant.metrics.totalQuoteValue / 1000).toFixed(0)}K</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'machines' && (
                <div className="space-y-2">
                  {selectedPlant.machines?.slice(0, 5).map((machine: any, idx) => (
                    <div key={idx} className="bg-slate-700/40 border border-slate-600/50 rounded p-3">
                      <p className="text-slate-200 font-medium">SN: {machine.serialNumber}</p>
                      <p className="text-sm text-slate-400">{machine.model}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Other tabs similar implementation */}
              {['orders', 'quotes', 'pos', 'contacts'].includes(activeTab) && (
                <p className="text-slate-400 text-center py-8">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} data loading...
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
