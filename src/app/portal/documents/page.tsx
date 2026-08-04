'use client';

import { useState } from 'react';
import { Download, Plus, X } from 'lucide-react';

interface DocumentItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function DocumentGeneratorPage() {
  const [docType, setDocType] = useState<'proposal' | 'purchase-order' | 'invoice'>('proposal');
  const [customer, setCustomer] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState('');
  const [generated, setGenerated] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    setItems(updated);
  };

  const generateDoc = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: docType,
          customer,
          items,
          referenceNumber: refNumber,
          notes,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const data = await res.json();
      setGenerated(data);
    } catch (error) {
      console.error('Failed to generate document:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadHTML = () => {
    if (!generated?.html) return;
    const blob = new Blob([generated.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docType}_${Date.now()}.html`;
    link.click();
  };

  const docTypeLabels: Record<string, string> = {
    proposal: '📋 Proposal',
    'purchase-order': '📦 Purchase Order',
    invoice: '💵 Invoice',
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = total * 0.08;
  const grandTotal = total + tax;

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Generator</h1>
        <p className="text-gray-600">Create proposals, purchase orders, and invoices instantly</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(docTypeLabels).map(([type, label]) => (
          <button
            key={type}
            onClick={() => {
              setDocType(type as any);
              setGenerated(null);
            }}
            className={`p-4 border-2 rounded-lg font-medium transition-colors ${
              docType === type
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!generated ? (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes or special instructions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  />
                </div>

                <button
                  onClick={generateDoc}
                  disabled={!customer || items.some((i) => !i.description)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate Document'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-700">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value))}
                        placeholder="Qty"
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                        placeholder="Unit Price"
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                        disabled
                        className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Preview</h3>
            <button
              onClick={downloadHTML}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Download size={18} />
              Download as HTML
            </button>
          </div>
          <iframe
            srcDoc={generated.html}
            className="w-full"
            style={{ height: '600px' }}
            title="Document Preview"
          />
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              onClick={() => setGenerated(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
