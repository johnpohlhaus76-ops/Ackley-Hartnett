'use client';

import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

interface OrderStatusItem {
  id: string;
  type: 'order' | 'po';
  number: string;
  customer: string;
  items: string[];
  value: number;
  status: string;
  progress: number;
  createdDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  lastUpdated: string;
  trackingNumber?: string;
}

export default function OrderStatusPage() {
  const [statuses, setStatuses] = useState<OrderStatusItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'order' | 'po'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/order-status');
        const data = await res.json();
        setStatuses(data.statuses || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to load statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = filterType === 'all' ? statuses : statuses.filter((s) => s.type === filterType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'received':
      case 'invoiced':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'shipped':
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
      case 'ordered':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped':
      case 'in-transit':
        return <Truck size={20} className="text-blue-600" />;
      case 'delivered':
      case 'received':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <Package size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order & PO Status</h1>
        <p className="text-gray-600">Real-time tracking of all orders and purchase orders</p>
      </div>

      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total POs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPOs}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Delivered</p>
            <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">In Transit</p>
            <p className="text-2xl font-bold text-blue-900">{stats.inTransit}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading order status...</p>
      ) : (
        <div>
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('order')}
              className={`px-4 py-2 rounded ${
                filterType === 'order' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setFilterType('po')}
              className={`px-4 py-2 rounded ${
                filterType === 'po' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              POs
            </button>
          </div>

          <div className="space-y-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.number}</h3>
                      <p className="text-sm text-gray-600">for {item.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-1">${(item.value / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Items</p>
                    <p className="font-medium text-gray-900">{item.items.length} items</p>
                  </div>
                  {item.expectedDelivery && (
                    <div>
                      <p className="text-gray-600 text-xs">Expected</p>
                      <p className="font-medium text-gray-900">{new Date(item.expectedDelivery).toLocaleDateString()}</p>
                    </div>
                  )}
                  {item.trackingNumber && (
                    <div>
                      <p className="text-gray-600 text-xs">Tracking</p>
                      <p className="font-medium text-gray-900">{item.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
