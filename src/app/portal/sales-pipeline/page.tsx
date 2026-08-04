'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

interface PipelineCustomer {
  customerId: string;
  customerName: string;
  value: number;
  quoteCount: number;
  healthScore: number;
  lastActivity: string;
  daysInStage: number;
}

interface PipelineStage {
  stage: string;
  customers: PipelineCustomer[];
  count: number;
  totalValue: number;
  avgValue: number;
}

export default function SalesPipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const res = await fetch('/api/sales-pipeline');
        const data = await res.json();
        setPipeline(data.pipeline || []);
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Failed to load pipeline:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPipeline();
  }, []);

  const stageLabels: Record<string, string> = {
    prospect: '🎯 Prospect',
    qualified: '✓ Qualified',
    proposal: '📄 Proposal',
    negotiation: '💬 Negotiation',
    won: '🏆 Won',
    lost: '❌ Lost',
  };

  const stageColors: Record<string, string> = {
    prospect: 'bg-gray-100 border-gray-300',
    qualified: 'bg-blue-100 border-blue-300',
    proposal: 'bg-purple-100 border-purple-300',
    negotiation: 'bg-orange-100 border-orange-300',
    won: 'bg-green-100 border-green-300',
    lost: 'bg-red-100 border-red-300',
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Pipeline</h1>
        <p className="text-gray-600">Track deal progression from prospect to close</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900">${(metrics.totalPipeline / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total Deals</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalDeals}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Won Value</p>
            <p className="text-2xl font-bold text-green-900">${(metrics.wonValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-900">{metrics.conversionRate}%</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading pipeline...</p>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {pipeline.map((stage) => (
            <div
              key={stage.stage}
              className={`border-2 rounded-lg p-4 ${stageColors[stage.stage] || 'bg-gray-100'}`}
            >
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">{stageLabels[stage.stage]}</h3>
                <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                <p className="text-xs text-gray-600 mt-1">${(stage.totalValue / 1000).toFixed(0)}K</p>
              </div>

              <div className="space-y-2">
                {stage.customers.slice(0, 3).map((customer) => (
                  <div key={customer.customerId} className="bg-white bg-opacity-60 rounded p-2 text-xs">
                    <p className="font-medium text-gray-900 truncate">{customer.customerName}</p>
                    <p className="text-gray-600">${(customer.value / 1000).toFixed(0)}K</p>
                  </div>
                ))}
                {stage.customers.length > 3 && (
                  <p className="text-xs text-gray-600 font-medium">+{stage.customers.length - 3} more</p>
                )}
              </div>

              {stage.avgValue > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-300 text-xs">
                  <p className="text-gray-600">Avg: ${(stage.avgValue / 1000).toFixed(0)}K</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
