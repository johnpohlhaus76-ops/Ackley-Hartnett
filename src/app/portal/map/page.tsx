'use client';

import { useEffect, useState } from 'react';
import { Globe, MapPin, Loader2, Pill } from 'lucide-react';

interface Machine {
  serialNumber: string | number;
  customer: string;
  country: string;
  address: string;
  model: string;
  shipped: string;
  coords: [number, number];
}

interface CountryData {
  machines: Machine[];
  coords: [number, number];
  count: number;
}

export default function MapPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [byCountry, setByCountry] = useState<Record<string, CountryData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const res = await fetch('/api/map/all-machines');
        const data = await res.json();
        setMachines(data.machines || []);
        setByCountry(data.byCountry || {});
      } catch (error) {
        console.error('Failed to load machines:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMachines();
  }, []);

  const filteredMachines = machines.filter(m =>
    m.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountryData = selectedCountry ? byCountry[selectedCountry] : null;
  const displayMachines = selectedCountry ? selectedCountryData?.machines || [] : filteredMachines;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Globe className="text-blue-600" size={32} />
            Global Machine Map
          </h1>
          <p className="text-gray-600">All {machines.length} machines sold worldwide</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
            <span className="text-gray-600">Loading global machine database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Countries & Search */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search machines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Countries List */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={16} />
                    Countries ({Object.keys(byCountry).length})
                  </h3>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors ${
                      !selectedCountry
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    View All
                  </button>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {Object.entries(byCountry)
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([country, data]) => (
                        <button
                          key={country}
                          onClick={() => setSelectedCountry(country)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${
                            selectedCountry === country
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{country}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            selectedCountry === country
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}>
                            {data.count}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-lg p-3 text-xs border border-gray-200 mt-4">
                  <p className="font-semibold text-gray-900">Total Machines</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{machines.length}</p>
                  <p className="text-gray-600 mt-2">
                    {Object.keys(byCountry).length} countries/regions
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content - Machine List */}
            <div className="lg:col-span-3">
              {selectedCountry && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    {selectedCountryData?.count} machines in {selectedCountry}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayMachines.map((machine) => (
                  <div
                    key={`${machine.serialNumber}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{machine.customer}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          <MapPin size={12} className="inline mr-1" />
                          {machine.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          S/N {machine.serialNumber}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 border-t pt-3">
                      <p>
                        <span className="font-medium">Model:</span> {machine.model}
                      </p>
                      <p>
                        <span className="font-medium">Shipped:</span> {new Date(machine.shipped).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        <span className="font-medium">Location:</span> {machine.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {displayMachines.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Pill size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No machines found</p>
                </div>
              )}

              <div className="mt-8 text-sm text-gray-600 border-t pt-4">
                <p>
                  Showing {displayMachines.length} of {machines.length} machines
                  {selectedCountry && ` in ${selectedCountry}`}
                  {searchTerm && ` (filtered)`}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
