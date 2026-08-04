'use client';

import { useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  generatedAt: string;
  summary: any;
  data: any;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('revenue');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Track revenue by customer and time period',
      icon: '💰',
    },
    {
      id: 'customer',
      title: 'Customer Report',
      description: 'Analyze customer metrics and performance',
      icon: '👥',
    },
    {
      id: 'machine-utilization',
      title: 'Machine Utilization',
      description: 'Global machine deployment and utilization analysis',
      icon: '⚙️',
    },
    {
      id: 'sales-performance',
      title: 'Sales Performance',
      description: 'Quote conversion and sales metrics',
      icon: '📈',
    },
  ];

  const loadReport = async (type: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?type=${type}`);
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: string) => {
    setSelectedReport(type);
    await loadReport(type);
  };

  const downloadReport = () => {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${report.type}_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download custom business reports</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleGenerateReport(type.id)}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              selectedReport === type.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl mb-2">{type.icon}</p>
            <h3 className="font-semibold text-gray-900">{type.title}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600">Generating report...</p>
      ) : report ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Generated {new Date(report.generatedAt).toLocaleString()}</p>
            </div>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Download size={18} />
              Download JSON
            </button>
          </div>

          {report.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(report.summary).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {typeof value === 'number' && key.includes('Rate')
                      ? `${value}%`
                      : typeof value === 'number' && key.includes('Revenue')
                      ? `$${(value / 1000).toFixed(0)}K`
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {report.data && (
            <div className="bg-gray-50 rounded p-4 border border-gray-200 max-h-96 overflow-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Detailed Data</h3>
              <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap word-break">
                {JSON.stringify(report.data, null, 2).substring(0, 1000)}...
              </pre>
              <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">View Full Data</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Select a report type to generate a report</p>
        </div>
      )}
    </div>
  );
}
