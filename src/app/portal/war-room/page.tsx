'use client';

import React, { useState } from 'react';
import { getGeopoliticalData } from '@/lib/geopolitical-risks';
import { getLatestHeadlines, getCriticalAlerts, NEWS_SOURCES } from '@/lib/news-integration';
import { getTrackedVessels, getShippingCorridors, getVesselStatistics, getMarketplaceData } from '@/lib/vessel-tracking';
import Link from 'next/link';

export default function WarRoomPage() {
  const data = getGeopoliticalData();
  const news = getLatestHeadlines(10);
  const criticalNews = getCriticalAlerts();
  const vessels = getTrackedVessels();
  const corridors = getShippingCorridors();
  const vesselStats = getVesselStatistics();
  const marketData = getMarketplaceData();

  const [selectedConflict, setSelectedConflict] = useState(data.conflicts[0]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'from-red-900 to-red-700';
    if (risk >= 60) return 'from-orange-900 to-orange-700';
    if (risk >= 40) return 'from-yellow-900 to-yellow-700';
    return 'from-green-900 to-green-700';
  };

  const getRiskBg = (risk: number) => {
    if (risk >= 80) return 'bg-red-500/10 border-red-500/30';
    if (risk >= 60) return 'bg-orange-500/10 border-orange-500/30';
    if (risk >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-400';
      case 'active':
        return 'text-orange-400';
      case 'escalating':
        return 'text-red-500';
      case 'simmering':
        return 'text-yellow-400';
      case 'de-escalating':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getShippingStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return '✓';
      case 'restricted':
        return '⚠';
      case 'closed':
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/portal/accounts-360-pro" className="text-sm text-gray-400 hover:text-gray-200 transition">
              ← Back to Portal
            </Link>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              🌍 Geopolitical War Room
            </h1>
            <p className="text-gray-300 text-lg">Real-time Middle East conflict tracking & supply chain impact analysis</p>
            <div className="flex gap-6 mt-4 text-sm text-gray-400">
              <div>
                <span className="font-semibold text-gray-300">{data.conflicts.length}</span> Active Conflicts
              </div>
              <div>
                <span className="font-semibold text-gray-300">{Object.keys(data.riskMap).length}</span> Countries Monitored
              </div>
              <div>
                <span className="font-semibold text-gray-300">{data.shippingRoutes.length}</span> Critical Routes
              </div>
              <div className="text-xs text-gray-500">Updated: {new Date(data.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left: Conflicts List */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl h-full">
              <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Active Conflicts
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.conflicts.map((conflict) => (
                  <button
                    key={conflict.id}
                    onClick={() => setSelectedConflict(conflict)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedConflict.id === conflict.id
                        ? 'bg-red-500/20 border-red-500/50 ring-1 ring-red-500/30'
                        : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="font-semibold text-gray-100 text-sm">{conflict.region}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs font-semibold ${getStatusColor(conflict.status)}`}>
                        {conflict.status.toUpperCase()}
                      </span>
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold text-white ${
                          conflict.riskLevel === 'critical'
                            ? 'bg-red-600'
                            : conflict.riskLevel === 'high'
                              ? 'bg-orange-600'
                              : conflict.riskLevel === 'medium'
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                        }`}
                      >
                        {conflict.riskLevel.toUpperCase()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Selected Conflict Details */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">{selectedConflict.region}</h2>
                  <p className="text-gray-400 mt-1">{selectedConflict.description}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${
                    selectedConflict.riskLevel === 'critical'
                      ? 'bg-red-600'
                      : selectedConflict.riskLevel === 'high'
                        ? 'bg-orange-600'
                        : selectedConflict.riskLevel === 'medium'
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                  }`}
                >
                  {selectedConflict.riskLevel.toUpperCase()} RISK
                </div>
              </div>

              {/* Key Players */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-200 mb-3 text-sm">Key Players</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedConflict.keyPlayers.map((player, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-700/50 border border-slate-600/30 rounded-full text-xs text-gray-300"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>

              {/* Supply Chain Impact */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-200 mb-3 text-sm">Supply Chain Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Affected Sectors</div>
                    <div className="space-y-1">
                      {selectedConflict.supplyChainImpact.affected.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Risk Factors</div>
                    <div className="space-y-1">
                      {selectedConflict.supplyChainImpact.riskFactors.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-3 text-sm">Recent Events</h3>
                <div className="space-y-3">
                  {selectedConflict.timeline.map((event, idx) => (
                    <div key={idx} className="border-l-2 border-orange-500/50 pl-4 py-2">
                      <div className="text-xs text-gray-400">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm font-semibold text-gray-200 mt-1">{event.event}</div>
                      <div className="text-xs text-gray-400 mt-1">{event.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Country Risk Heatmap */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Regional Risk Assessment</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(data.riskMap).map(([country, risk]) => (
              <div
                key={country}
                className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer ${getRiskBg(risk as number)}`}
              >
                <div className="text-sm font-semibold text-gray-100 mb-2">{country}</div>
                <div className="flex items-end justify-between">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${getRiskColor(risk as number)} bg-clip-text text-transparent`}>
                    {risk}
                  </div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Shipping Routes */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Critical Shipping Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {corridors.map((route, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border backdrop-blur-sm transition-all ${
                  route.riskLevel === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : route.riskLevel === 'high'
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : route.riskLevel === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-100">{route.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{route.dailyVolume} vessels/day | {route.tankerDaily} tankers | {route.containerDaily} containers</div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded font-bold text-sm text-white ${
                      route.riskLevel === 'critical'
                        ? 'bg-red-600'
                        : route.riskLevel === 'high'
                          ? 'bg-orange-600'
                          : route.riskLevel === 'medium'
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                    }`}
                  >
                    {route.riskLevel.toUpperCase()}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-2">Transit Time</div>
                  <div className="font-semibold text-gray-200">{route.avgTransitTime}h</div>
                </div>
                <div className="text-xs text-gray-400">
                  {route.alternativeRoute && (
                    <>
                      <span className="font-semibold">Alternative:</span> {route.alternativeRoute} (+{route.alternativeTransitTime! - route.avgTransitTime}h)
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commodity Impact Analysis */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Commodity Price Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.commodityCorrelation.map((commodity, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-100">{commodity.commodity}</div>
                    <div className="text-xs text-gray-400 mt-1">{commodity.primaryRegion}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">
                      +{commodity.priceImpact.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">per escalation</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/30 rounded p-2">
                    <div className="text-xs text-gray-400">Base Price</div>
                    <div className="font-semibold text-green-400">${commodity.basePrice.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded p-2">
                    <div className="text-xs text-gray-400">Crisis Price</div>
                    <div className="font-semibold text-red-400">${commodity.crisisPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strait of Hormuz Intelligence Center */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 rounded-xl p-6 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">🛢️</span>
            Strait of Hormuz Intelligence Center
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Daily Tankers</div>
              <div className="text-3xl font-bold text-red-400">95</div>
              <div className="text-xs text-gray-500 mt-1">Oil tankers/day average</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Global Oil</div>
              <div className="text-3xl font-bold text-orange-400">35%</div>
              <div className="text-xs text-gray-500 mt-1">Of seaborne exports</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Transit Time</div>
              <div className="text-3xl font-bold text-yellow-400">24h</div>
              <div className="text-xs text-gray-500 mt-1">Average passage</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-2">At-Risk Cargo</div>
              <div className="text-3xl font-bold text-red-500">${vesselStats.atRiskCargo.toFixed(1)}B</div>
              <div className="text-xs text-gray-500 mt-1">High-risk vessels</div>
            </div>
          </div>

          {/* Shipping Corridors */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-200 mb-3">Critical Shipping Corridors Status</h3>
            <div className="space-y-3">
              {corridors.map((corridor, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border backdrop-blur-sm ${
                    corridor.riskLevel === 'critical'
                      ? 'bg-red-500/10 border-red-500/30'
                      : corridor.riskLevel === 'high'
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : corridor.riskLevel === 'medium'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-100">{corridor.name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {corridor.dailyVolume} vessels/day | {corridor.tankerDaily} tankers | {corridor.containerDaily} containers
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded font-bold text-sm ${
                        corridor.riskLevel === 'critical' ? 'bg-red-600 text-white'
                        : corridor.riskLevel === 'high' ? 'bg-orange-600 text-white'
                        : corridor.riskLevel === 'medium' ? 'bg-yellow-600 text-white'
                        : 'bg-green-600 text-white'
                      }`}>
                        {corridor.riskLevel.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Transit: {corridor.avgTransitTime}h</span>
                    {corridor.alternativeRoute && (
                      <span className="text-gray-400">
                        Alternative: {corridor.alternativeRoute} (+{corridor.alternativeTransitTime! - corridor.avgTransitTime}h)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Vessel Tracking */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Vessel Tracking ({vessels.length} vessels)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-200 mb-3 text-sm">Strait of Hormuz Vessels</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vessels
                  .filter((v) => v.position.lng > 55 && v.position.lat > 25.5)
                  .map((vessel) => (
                    <button
                      key={vessel.id}
                      onClick={() => setSelectedVessel(vessel.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        selectedVessel === vessel.id
                          ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-100 text-sm">{vessel.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{vessel.type}</div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-bold text-white ${
                            vessel.risk === 'critical'
                              ? 'bg-red-600'
                              : vessel.risk === 'high'
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                          }`}
                        >
                          {vessel.risk.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>${vessel.cargoValue.toFixed(1)}M cargo</span>
                        <span>{vessel.speed} knots</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-200 mb-3 text-sm">Red Sea Vessels</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vessels
                  .filter((v) => v.position.lng < 45 && v.position.lat < 25)
                  .map((vessel) => (
                    <button
                      key={vessel.id}
                      onClick={() => setSelectedVessel(vessel.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        selectedVessel === vessel.id
                          ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-100 text-sm">{vessel.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{vessel.type}</div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-bold text-white ${
                            vessel.risk === 'critical'
                              ? 'bg-red-600'
                              : vessel.risk === 'high'
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                          }`}
                        >
                          {vessel.risk.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>${vessel.cargoValue.toFixed(1)}M cargo</span>
                        <span>{vessel.speed} knots</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Selected Vessel Details */}
          {selectedVessel && vessels.find((v) => v.id === selectedVessel) && (
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
              {(() => {
                const vessel = vessels.find((v) => v.id === selectedVessel)!;
                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-100">{vessel.name}</h3>
                        <p className="text-sm text-gray-400">Flag: {vessel.flag}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-bold text-white ${
                        vessel.risk === 'critical' ? 'bg-red-600'
                        : vessel.risk === 'high' ? 'bg-orange-600'
                        : 'bg-yellow-600'
                      }`}>
                        RISK: {vessel.risk.toUpperCase()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Type</div>
                        <div className="text-sm font-semibold text-gray-200">{vessel.type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Cargo Value</div>
                        <div className="text-sm font-semibold text-gray-200">${vessel.cargoValue.toFixed(1)}M</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Speed</div>
                        <div className="text-sm font-semibold text-gray-200">{vessel.speed} knots</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Status</div>
                        <div className={`text-sm font-semibold ${
                          vessel.status === 'diverted' ? 'text-red-400'
                          : vessel.status === 'waiting' ? 'text-yellow-400'
                          : 'text-green-400'
                        }`}>
                          {vessel.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-gray-400">Origin → Destination</div>
                        <div className="text-sm text-gray-200">{vessel.origin} → {vessel.destination}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Cargo</div>
                        <div className="text-sm text-gray-200">{vessel.cargo}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* News Feed Section */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            Breaking News from Major News Sources
          </h2>

          {/* Critical Alerts */}
          {criticalNews.length > 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-sm font-bold text-red-400 mb-3">⚠️ CRITICAL ALERTS ({criticalNews.length})</div>
              <div className="space-y-3">
                {criticalNews.map((article) => (
                  <div key={article.id} className="border-l-2 border-red-500 pl-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-100 text-sm">{article.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{article.description}</div>
                        {article.impact && (
                          <div className="text-xs text-red-400 mt-2 font-semibold">Impact: {article.impact}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${NEWS_SOURCES[article.source]?.color}`}>
                          {NEWS_SOURCES[article.source]?.icon}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Headlines */}
          <h3 className="font-semibold text-gray-200 mb-3 text-sm">Latest Headlines</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {news.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4 hover:border-slate-600/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase text-gray-400">
                      {NEWS_SOURCES[article.source]?.name}
                    </div>
                    <h4 className="font-semibold text-gray-100 text-sm mt-2 group-hover:text-blue-400 transition">{article.title}</h4>
                  </div>
                  <span className="text-2xl">{NEWS_SOURCES[article.source]?.icon}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{article.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* News Sources Summary */}
          <div className="mt-6 pt-6 border-t border-slate-700/30">
            <h3 className="font-semibold text-gray-200 mb-3 text-sm">Monitored News Sources</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(NEWS_SOURCES).map(([key, source]) => (
                <div key={key} className="flex items-center gap-2 text-sm text-gray-400 bg-slate-800/50 p-2 rounded">
                  <span className="text-xl">{source.icon}</span>
                  <span className="text-xs">{source.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
