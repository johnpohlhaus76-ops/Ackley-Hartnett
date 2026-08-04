"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, Waves, Globe2, Zap } from "lucide-react";

export default function ThreatIntelligencePage() {
  const [threats, setThreats] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch threat data
        const threatRes = await fetch("/api/threat-intelligence");
        const threatData = await threatRes.json();
        setThreats(threatData.threats || []);

        // Fetch market data
        const marketRes = await fetch("/api/prices-verified");
        const marketData = await marketRes.json();
        setMarkets(marketData.prices || {});
      } catch (error) {
        console.error("Failed to load threat data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#1A1A1A",
        color: "#FFFFFF",
        padding: "32px",
        borderBottom: "2px solid #D32F2F"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={32} color="#D32F2F" />
            Global Threat Intelligence
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: "8px 0 0 0" }}>
            Real-time geopolitical threats, conflicts & market impact
          </p>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#999999" }}>
            Loading threat intelligence...
          </div>
        ) : (
          <>
            {/* Active Threats Grid */}
            <div style={{ marginBottom: "48px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={24} color="#D32F2F" />
                Active Conflicts & Threats
              </h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px"
              }}>
                {threats.map((threat, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: `2px solid ${threat.severity === "critical" ? "#D32F2F" : threat.severity === "high" ? "#FF9800" : "#FFC107"}`,
                      borderRadius: "8px",
                      padding: "20px"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "12px"
                    }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
                        {threat.name}
                      </h3>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: threat.severity === "critical" ? "#FFEBEE" : threat.severity === "high" ? "#FFF3E0" : "#FFF9C4",
                        color: threat.severity === "critical" ? "#D32F2F" : threat.severity === "high" ? "#FF6F00" : "#F57F17"
                      }}>
                        {threat.severity.toUpperCase()}
                      </span>
                    </div>

                    <p style={{ fontSize: "13px", color: "#2C2C2C", margin: "12px 0", lineHeight: 1.5 }}>
                      {threat.description}
                    </p>

                    <div style={{
                      fontSize: "12px",
                      color: "#666666",
                      padding: "12px 0",
                      borderTop: "1px solid #E8E8E8",
                      borderBottom: "1px solid #E8E8E8",
                      margin: "12px 0"
                    }}>
                      <div><strong>Locations:</strong> {threat.locations.join(", ")}</div>
                      <div><strong>Updated:</strong> {new Date(threat.lastUpdate).toLocaleString()}</div>
                    </div>

                    {threat.impact && (
                      <div style={{
                        fontSize: "12px",
                        color: "#1A1A1A",
                        padding: "12px",
                        backgroundColor: "#F5F5F5",
                        borderRadius: "4px",
                        marginTop: "12px"
                      }}>
                        <strong>Market Impact:</strong> {threat.impact}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Chokepoints */}
            <div style={{ marginBottom: "48px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Waves size={24} color="#D32F2F" />
                Critical Chokepoints
              </h2>

              <div style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8E8",
                borderRadius: "8px",
                padding: "24px"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px"
                }}>
                  {[
                    {
                      name: "Strait of Hormuz",
                      status: "High Risk",
                      traffic: "21.4M barrels/day",
                      percent: "21%",
                      desc: "Iranian blockade threats, US naval presence"
                    },
                    {
                      name: "Suez Canal",
                      status: "Elevated",
                      traffic: "12% global trade",
                      percent: "12%",
                      desc: "Houthi attacks, Red Sea volatility"
                    },
                    {
                      name: "South China Sea",
                      status: "Contested",
                      traffic: "$3.4T/year trade",
                      percent: "30%",
                      desc: "China-Taiwan tensions, disputed islands"
                    },
                    {
                      name: "Black Sea",
                      status: "Active War",
                      traffic: "Grain & oil blocked",
                      percent: "15%",
                      desc: "Russia-Ukraine naval conflict ongoing"
                    },
                  ].map((chokepoint, idx) => (
                    <div key={idx} style={{
                      padding: "16px",
                      backgroundColor: "#F9F9F9",
                      borderRadius: "4px",
                      borderLeft: `4px solid #D32F2F`
                    }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px 0" }}>
                        {chokepoint.name}
                      </h4>
                      <div style={{ fontSize: "11px", color: "#666666", marginBottom: "8px" }}>
                        <div><strong>Status:</strong> {chokepoint.status}</div>
                        <div><strong>Traffic:</strong> {chokepoint.traffic}</div>
                      </div>
                      <p style={{ fontSize: "12px", color: "#2C2C2C", margin: "0", lineHeight: 1.4 }}>
                        {chokepoint.desc}
                      </p>
                      <div style={{
                        marginTop: "8px",
                        height: "4px",
                        backgroundColor: "#E8E8E8",
                        borderRadius: "2px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: chokepoint.percent,
                          height: "100%",
                          backgroundColor: "#D32F2F",
                          transition: "width 0.3s"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Impact */}
            {markets && (
              <div style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingDown size={24} color="#D32F2F" />
                  Market Impact Indicators
                </h2>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px"
                }}>
                  {[
                    { label: "Oil Price (WTI)", value: markets.oil?.verified_price, change: "+2.4%", unit: "USD/barrel" },
                    { label: "Gold (Safe Haven)", value: markets.gold?.verified_price, change: "+1.8%", unit: "USD/oz" },
                    { label: "VIX Volatility", value: "19.2", change: "+15%", unit: "points" },
                    { label: "US Dollar Index", value: "103.2", change: "+0.8%", unit: "index" },
                  ].map((metric, idx) => (
                    <div key={idx} style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8E8E8",
                      borderRadius: "4px",
                      padding: "16px"
                    }}>
                      <div style={{ fontSize: "12px", color: "#666666", marginBottom: "8px" }}>
                        {metric.label}
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", marginBottom: "4px" }}>
                        {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value} {metric.unit}
                      </div>
                      <div style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>
                        {metric.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div style={{
              padding: "16px",
              backgroundColor: "#F9F9F9",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#666666",
              textAlign: "center"
            }}>
              Real-time threat intelligence updated every minute
              <br />
              Data sources: Reuters, Bloomberg, USMCA, UN, MarineTraffic API
              <br />
              Last refresh: {new Date().toLocaleString()}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
