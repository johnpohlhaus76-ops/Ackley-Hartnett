'use client';

import { useState, useEffect } from 'react';
import { Building2, Cpu, ShoppingCart, FileText, Upload, Truck, ChevronDown, ChevronUp, Filter } from 'lucide-react';

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
  metrics: {
    totalMachines: number;
    activeMachines: number;
    totalOrders: number;
    totalOrderValue: number;
    totalQuoteValue: number;
    pendingPOs: number;
  };
}

export default function Accounts360Page() {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string>('machines');
  const [activeTab, setActiveTab] = useState<'machines' | 'orders' | 'quotes' | 'uploads' | 'pos'>('machines');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | '30days' | '90days' | '1year'>('all');

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const res = await fetch('/api/plants/operations');
      const data = await res.json();
      if (data.success) {
        setPlants(data.plants);
        if (data.plants?.length > 0) {
          setSelectedPlant(data.plants[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load plants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Loading plant data...</p>
      </div>
    );
  }

  const getDateRangeFilter = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (filterDateRange === 'all') return true;
    if (filterDateRange === '30days') return daysAgo <= 30;
    if (filterDateRange === '90days') return daysAgo <= 90;
    if (filterDateRange === '1year') return daysAgo <= 365;
    return true;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-6 sticky top-0 z-10 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="text-blue-600" size={32} />
          Accounts 360
        </h1>
        <p className="text-gray-600 mt-1">Plant operations, machines, orders, quotes & POs</p>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Plant Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Plant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => setSelectedPlant(plant)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPlant?.id === plant.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className="font-semibold text-gray-900">{plant.name}</p>
                <p className="text-sm text-gray-600">{plant.country}</p>
                <p className="text-xs text-gray-500 mt-1">{plant.metrics.totalMachines} machines</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Plant Details */}
        {selectedPlant && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Machines</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{selectedPlant.metrics.totalMachines}</p>
                <p className="text-xs text-blue-600 mt-1">{selectedPlant.metrics.activeMachines} active</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium">Orders</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{selectedPlant.metrics.totalOrders}</p>
                <p className="text-xs text-green-600 mt-1">${(selectedPlant.metrics.totalOrderValue / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">Quotes</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{selectedPlant.quotes.length}</p>
                <p className="text-xs text-purple-600 mt-1">${(selectedPlant.metrics.totalQuoteValue / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium">Pending POs</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{selectedPlant.metrics.pendingPOs}</p>
                <p className="text-xs text-orange-600 mt-1">Draft or ordered</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
              {['machines', 'orders', 'quotes', 'uploads', 'pos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'machines' && <Cpu className="inline mr-2" size={16} />}
                  {tab === 'orders' && <ShoppingCart className="inline mr-2" size={16} />}
                  {tab === 'quotes' && <FileText className="inline mr-2" size={16} />}
                  {tab === 'uploads' && <Upload className="inline mr-2" size={16} />}
                  {tab === 'pos' && <Truck className="inline mr-2" size={16} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Machines Tab */}
            {activeTab === 'machines' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold">Serial #</th>
                        <th className="px-4 py-3 text-left font-semibold">Model</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Install Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Last Service</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedPlant.machines.map((machine: any) => (
                        <tr key={machine.serialNumber} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-blue-600">{machine.serialNumber}</td>
                          <td className="px-4 py-3">{machine.model}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              machine.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {machine.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(machine.installDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {machine.lastService ? new Date(machine.lastService).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {selectedPlant.orders
                  .filter((order: any) => getDateRangeFilter(order.orderDate))
                  .map((order: any) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{order.items.join(', ')}</p>
                      <p className="text-lg font-bold text-gray-900">${order.value.toLocaleString()}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Quotes Tab */}
            {activeTab === 'quotes' && (
              <div className="space-y-4">
                {selectedPlant.quotes.map((quote: any) => (
                  <div key={quote.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{quote.quoteNumber}</h3>
                        <p className="text-sm text-gray-600">{quote.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        quote.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : quote.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Expires: {new Date(quote.expiryDate).toLocaleDateString()}</p>
                      <p className="text-lg font-bold text-gray-900">${quote.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uploads Tab */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                {selectedPlant.uploads.map((upload: any) => (
                  <div key={upload.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{upload.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{upload.description}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {upload.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(upload.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={upload.fileUrl}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* POs Tab */}
            {activeTab === 'pos' && (
              <div className="space-y-4">
                {selectedPlant.pos.map((po: any) => (
                  <div key={po.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{po.poNumber}</h3>
                        <p className="text-sm text-gray-600">{po.vendor}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        po.status === 'received'
                          ? 'bg-green-100 text-green-800'
                          : po.status === 'ordered'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {po.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {po.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.description} (x{item.quantity})</span>
                          <span className="text-gray-900 font-medium">${item.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t flex justify-between">
                      <span className="text-sm font-medium text-gray-700">{po.category.toUpperCase()}</span>
                      <p className="text-lg font-bold text-gray-900">${po.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
