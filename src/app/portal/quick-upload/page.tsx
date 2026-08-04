'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function QuickUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'quotes' | 'orders') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const res = await fetch(`/api/import/${type}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `✅ ${data.message} | Total ${type}: ${data[`total${type.charAt(0).toUpperCase() + type.slice(1)}`]}`,
        });
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal/accounts-360-pro" className="text-sm text-gray-400 hover:text-gray-200 mb-4 block">
            ← Back
          </Link>
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
            <h1 className="text-4xl font-bold text-green-400 mb-2">⚡ FAST UPLOAD</h1>
            <p className="text-gray-300">Bulk update quotes & orders in seconds</p>
          </div>
        </div>

        {/* Messages */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quotes Upload */}
          <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">📋 QUOTES</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-green-500/50 transition">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => handleFileUpload(e, 'quotes')}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-gray-300 font-semibold">Click to upload CSV/JSON</div>
                  <div className="text-xs text-gray-500 mt-2">or drag & drop</div>
                </label>
              </div>
              <a
                href="https://ackley-hartnett-portal.vercel.app/api/export/quotes?format=csv"
                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white text-center transition"
              >
                ⬇️ Download Template
              </a>
            </div>
          </div>

          {/* Orders Upload */}
          <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">📦 ORDERS</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-green-500/50 transition">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => handleFileUpload(e, 'orders')}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-gray-300 font-semibold">Click to upload CSV/JSON</div>
                  <div className="text-xs text-gray-500 mt-2">or drag & drop</div>
                </label>
              </div>
              <a
                href="https://ackley-hartnett-portal.vercel.app/api/export/orders?format=csv"
                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white text-center transition"
              >
                ⬇️ Download Template
              </a>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mt-6 backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <label className="text-gray-300 font-semibold mb-3 block">Upload Mode:</label>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('merge')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                mode === 'merge'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
              }`}
            >
              ✅ MERGE (Add + Update)
            </button>
            <button
              onClick={() => setMode('replace')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                mode === 'replace'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
              }`}
            >
              ⚠️ REPLACE (Overwrite All)
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-gray-100 mb-3">⚡ 30-Second Workflow:</h3>
          <ol className="text-gray-300 space-y-2 text-sm">
            <li>1️⃣ Click "Download Template" button</li>
            <li>2️⃣ Edit in Excel (change Status, Price, etc.)</li>
            <li>3️⃣ Save as CSV</li>
            <li>4️⃣ Drag file to upload box above</li>
            <li>5️⃣ ✅ Done! All 400+ records updated</li>
          </ol>
        </div>

        {uploading && (
          <div className="mt-6 text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              <p className="text-gray-400 mt-4">Uploading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
