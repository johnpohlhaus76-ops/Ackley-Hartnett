'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Quote {
  Estimate: string;
  Customer: string;
  Status: string;
  'Total Price': number;
  'Quote Date': string;
}

interface Order {
  'Serial Number': string;
  Customer: string;
  status?: string;
  Shipped?: string;
}

export default function QuotesOrdersManagement() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'orders'>('quotes');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const quotesRes = await fetch('/api/quotes').catch(() => null);
      const ordersRes = await fetch('/api/orders').catch(() => null);

      if (quotesRes?.ok) {
        const data = await quotesRes.json();
        setQuotes(Array.isArray(data) ? data : data.quotes || []);
      }

      if (ordersRes?.ok) {
        const data = await ordersRes.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = (quote: Quote) => {
    setSelectedItem(quote);
    setFormData({
      estimateId: quote.Estimate,
      status: quote.Status,
      totalPrice: quote['Total Price'],
      customer: quote.Customer,
    });
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedItem(order);
    setFormData({
      orderId: order['Serial Number'],
      status: order.status || 'pending',
      customer: order.Customer,
    });
  };

  const handleUpdateQuote = async () => {
    if (!formData.estimateId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/quotes/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Quote ${formData.estimateId} updated!` });
        setSelectedItem(null);
        loadData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!formData.orderId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Order ${formData.orderId} updated!` });
        setSelectedItem(null);
        loadData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/portal/accounts-360-pro" className="text-sm text-gray-400 hover:text-gray-200">
              ← Back to Portal
            </Link>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              📊 Quotes & Orders Management
            </h1>
            <p className="text-gray-300 text-lg">Update quotes and order statuses in real-time</p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Section */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700/50">
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-4 py-3 font-semibold border-b-2 transition ${
                  activeTab === 'quotes'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                📋 Quotes ({quotes.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-3 font-semibold border-b-2 transition ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                📦 Orders ({orders.length})
              </button>
            </div>

            {/* Quotes List */}
            {activeTab === 'quotes' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quotes.slice(0, 20).map((quote) => (
                  <button
                    key={quote.Estimate}
                    onClick={() => handleSelectQuote(quote)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedItem?.Estimate === quote.Estimate
                        ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'
                        : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-100">#{quote.Estimate}</div>
                        <div className="text-sm text-gray-400">{quote.Customer}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold px-2 py-1 rounded ${
                          quote.Status === 'accepted'
                            ? 'bg-green-600 text-white'
                            : quote.Status === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                        }`}>
                          {quote.Status}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">${quote['Total Price'].toFixed(2)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Orders List */}
            {activeTab === 'orders' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.slice(0, 20).map((order) => (
                  <button
                    key={order['Serial Number']}
                    onClick={() => handleSelectOrder(order)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedItem?.['Serial Number'] === order['Serial Number']
                        ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'
                        : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-100">SN: {order['Serial Number']}</div>
                        <div className="text-sm text-gray-400">{order.Customer}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold px-2 py-1 rounded ${
                          order.status === 'delivered'
                            ? 'bg-green-600 text-white'
                            : order.status === 'cancelled'
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                        }`}>
                          {order.status || 'pending'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Panel */}
          <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl h-fit">
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              {activeTab === 'quotes' ? '✏️ Edit Quote' : '✏️ Edit Order'}
            </h2>

            {selectedItem ? (
              <div className="space-y-4">
                {activeTab === 'quotes' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Quote ID</label>
                      <input
                        type="text"
                        value={formData.estimateId}
                        disabled
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                      >
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Total Price</label>
                      <input
                        type="number"
                        value={formData.totalPrice}
                        onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Notes</label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm h-20"
                        placeholder="Add notes..."
                      />
                    </div>

                    <button
                      onClick={handleUpdateQuote}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 rounded-lg font-semibold text-white transition"
                    >
                      {loading ? 'Updating...' : 'Update Quote'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Order ID</label>
                      <input
                        type="text"
                        value={formData.orderId}
                        disabled
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Tracking Number</label>
                      <input
                        type="text"
                        value={formData.trackingNumber || ''}
                        onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                        placeholder="e.g., FDX123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Expected Delivery</label>
                      <input
                        type="date"
                        value={formData.expectedDelivery || ''}
                        onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-gray-300 text-sm"
                      />
                    </div>

                    <button
                      onClick={handleUpdateOrder}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 rounded-lg font-semibold text-white transition"
                    >
                      {loading ? 'Updating...' : 'Update Order'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select a {activeTab === 'quotes' ? 'quote' : 'order'} to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
