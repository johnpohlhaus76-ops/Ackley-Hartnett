'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Wrench, MapPin } from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  machineId: string;
  customer: string;
  model: string;
  serialNumber: string;
  country: string;
  shipDate: string;
  ageYears: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  reasons: string[];
  actions: string[];
}

export default function MaintenanceAlertsPage() {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCountry]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes] = await Promise.all([
        fetch(
          `/api/maintenance-alerts?view=all${selectedCountry ? `&country=${selectedCountry}` : ''}`
        ),
        fetch('/api/maintenance-alerts?view=stats'),
      ]);

      const alertsData = await alertsRes.json();
      const statsData = await statsRes.json();

      setAlerts(alertsData.alerts || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Alerts</h1>
        <p className="text-gray-600">Proactive maintenance scheduling for all installed machines</p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium">Critical</p>
            <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">High Priority</p>
            <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium">Medium</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.medium}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading alerts...</p>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Wrench className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No maintenance alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getRiskColor(alert.riskLevel)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-lg">{alert.customer}</h3>
                      <p className="text-sm opacity-75">
                        Model: {alert.model} | SN: {alert.serialNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(alert.riskLevel)}`}>
                      {alert.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs font-medium opacity-75 mb-1">Age & Location</p>
                    <p className="text-sm">
                      <MapPin size={14} className="inline mr-1" />
                      {alert.ageYears} years old | {alert.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium opacity-75 mb-1">Ship Date</p>
                    <p className="text-sm">{new Date(alert.shipDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium opacity-75 mb-1">Issues</p>
                  <ul className="text-sm space-y-1">
                    {alert.reasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium opacity-75 mb-1">Recommended Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.actions.map((action, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
