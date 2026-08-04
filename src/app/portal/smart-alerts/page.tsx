'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertCircle, Clock, TrendingDown, Wrench } from 'lucide-react';

interface SmartAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  relatedCustomer?: string;
  relatedMachine?: string;
  actionRequired: boolean;
  createdAt: string;
  metadata: Record<string, any>;
}

export default function SmartAlertsPage() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await fetch('/api/smart-alerts');
        const data = await res.json();
        setAlerts(data.alerts || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const filtered = filterType ? alerts.filter((a) => a.type === filterType) : alerts;

  const alertIcons: Record<string, any> = {
    'quote-expiry': <Clock size={20} className="text-orange-600" />,
    'inactive-customer': <TrendingDown size={20} className="text-red-600" />,
    'overdue-maintenance': <Wrench size={20} className="text-red-600" />,
  };

  const alertTypeLabels: Record<string, string> = {
    'quote-expiry': '📅 Quote Expiry',
    'inactive-customer': '👤 Inactive Customer',
    'overdue-maintenance': '🔧 Maintenance',
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Alerts</h1>
        <p className="text-gray-600">Proactive notifications for sales, customer, and maintenance issues</p>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Quote Expiry</p>
            <p className="text-2xl font-bold text-blue-900">{stats.byType.quoteExpiry}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Total Alerts</p>
            <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading alerts...</p>
      ) : (
        <div>
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType(null)}
              className={`px-4 py-2 rounded ${
                filterType === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All Alerts
            </button>
            {Object.entries(alertTypeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded ${
                  filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
                <Bell className="mx-auto mb-4 text-green-600" size={48} />
                <p className="text-green-600 font-semibold">All clear! No active alerts</p>
              </div>
            ) : (
              filtered.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start gap-3">
                    {alertIcons[alert.type]}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{alert.title}</h3>
                      <p className="text-gray-600 mt-1">{alert.message}</p>
                      {alert.metadata && (
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          {alert.relatedCustomer && (
                            <p className="text-gray-600">
                              <span className="font-medium">Customer:</span> {alert.relatedCustomer}
                            </p>
                          )}
                          {alert.relatedMachine && (
                            <p className="text-gray-600">
                              <span className="font-medium">Machine:</span> {alert.relatedMachine}
                            </p>
                          )}
                          {alert.metadata.daysOld !== undefined && (
                            <p className="text-gray-600">
                              <span className="font-medium">Age:</span> {alert.metadata.daysOld} days
                            </p>
                          )}
                        </div>
                      )}
                      {alert.actionRequired && (
                        <div className="mt-3">
                          <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs font-medium">
                            Action Required
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
