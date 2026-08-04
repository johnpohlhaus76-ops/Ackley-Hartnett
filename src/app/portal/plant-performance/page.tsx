'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PlantMetrics {
  plantId: string;
  plantName: string;
  machineCount: number;
  activeMachines: number;
  totalOrders: number;
  totalOrderValue: number;
  avgOrderValue: number;
  healthScore: number;
  utilization: number;
  orderFrequency: number;
  avgMachineAge: number;
}

export default function PlantPerformancePage() {
  const [metrics, setMetrics] = useState<PlantMetrics[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'healthScore' | 'orderValue' | 'utilization'>('healthScore');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/plant-performance');
        const data = await res.json();
        setMetrics(data.metrics || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sorted = [...metrics].sort((a, b) => {
    if (sortBy === 'healthScore') return b.healthScore - a.healthScore;
    if (sortBy === 'orderValue') return b.totalOrderValue - a.totalOrderValue;
    return b.utilization - a.utilization;
  });

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Performance</h1>
        <p className="text-gray-600">Compare utilization, health, and order activity across all plant locations</p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total Plants</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPlants}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Avg Health Score</p>
            <p className={`text-2xl font-bold ${getHealthColor(stats.avgHealthScore)}`}>{stats.avgHealthScore}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total Order Value</p>
            <p className="text-2xl font-bold text-gray-900">${(stats.totalOrderValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Avg Utilization</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgUtilization}%</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading metrics...</p>
      ) : (
        <div>
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setSortBy('healthScore')}
              className={`px-4 py-2 rounded ${
                sortBy === 'healthScore' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Health Score
            </button>
            <button
              onClick={() => setSortBy('orderValue')}
              className={`px-4 py-2 rounded ${
                sortBy === 'orderValue' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Order Value
            </button>
            <button
              onClick={() => setSortBy('utilization')}
              className={`px-4 py-2 rounded ${
                sortBy === 'utilization' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Utilization
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Plant</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Machines</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Active</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Utilization</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Health</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Order Value</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Avg Age</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((plant) => (
                  <tr key={plant.plantId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{plant.plantName}</td>
                    <td className="text-center py-3 px-4 text-gray-600">{plant.machineCount}</td>
                    <td className="text-center py-3 px-4 text-gray-600">{plant.activeMachines}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <span className="font-semibold text-gray-900">{plant.utilization}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${getHealthColor(plant.healthScore)}`}>{plant.healthScore}</span>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">{plant.totalOrders}</td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">
                      ${(plant.totalOrderValue / 1000).toFixed(0)}K
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">{plant.avgMachineAge}yr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
