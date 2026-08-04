"use client";

import { useState } from "react";
import { Search, Download, TrendingUp, AlertCircle } from "lucide-react";
import "@/styles/pharmaceutical.css";

const tariffData = [
  {
    country: "China",
    machinery: 25,
    pharmaceuticals: 0,
    rawMaterials: 12.5,
    notes: "Section 301 tariffs, ongoing trade negotiations",
  },
  {
    country: "India",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 2.5,
    notes: "General tariff rate, API manufacturing hub",
  },
  {
    country: "Germany",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 0,
    notes: "EU member - no tariffs (USMCA equivalent)",
  },
  {
    country: "Mexico",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 0,
    notes: "USMCA agreement - zero tariffs",
  },
  {
    country: "Canada",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 0,
    notes: "USMCA agreement - zero tariffs",
  },
  {
    country: "Japan",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 5,
    notes: "USJTA agreement",
  },
  {
    country: "South Korea",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 4,
    notes: "KORUS agreement",
  },
  {
    country: "United Kingdom",
    machinery: 0,
    pharmaceuticals: 0,
    rawMaterials: 2.5,
    notes: "Post-Brexit MFN rates",
  },
  {
    country: "Brazil",
    machinery: 14,
    pharmaceuticals: 15,
    rawMaterials: 10,
    notes: "High tariff rates for machinery",
  },
];

export default function TariffsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"country" | "machinery" | "pharmaceuticals">("country");

  const filtered = tariffData
    .filter((item) => item.country.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "country") return a.country.localeCompare(b.country);
      if (sortBy === "machinery") return b.machinery - a.machinery;
      if (sortBy === "pharmaceuticals") return b.pharmaceuticals - a.pharmaceuticals;
      return 0;
    });

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E8E8E8",
          padding: "24px 32px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: 0, marginBottom: "8px" }}>
            US Import Tariffs by Country
          </h1>
          <p style={{ fontSize: "13px", color: "#999999", margin: 0 }}>
            Machinery, pharmaceuticals, and raw materials tariff rates
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        {/* Alert */}
        <div
          style={{
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: "4px",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            gap: "12px",
          }}
        >
          <AlertCircle size={20} color="#92400E" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: "13px", color: "#92400E" }}>
            Tariff rates subject to change. Check current rates with US Customs and Border Protection (CBP) for accurate duties.
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#999999" }} />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                border: "1px solid #E8E8E8",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {(["country", "machinery", "pharmaceuticals"] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                style={{
                  padding: "12px 16px",
                  backgroundColor: sortBy === sort ? "#1E5BA8" : "#F9F9F9",
                  color: sortBy === sort ? "#FFFFFF" : "#2C2C2C",
                  border: "1px solid " + (sortBy === sort ? "#1E5BA8" : "#E8E8E8"),
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                Sort: {sort}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#F9F9F9", borderBottom: "1px solid #E8E8E8" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#1A1A1A" }}>Country</th>
                  <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#1A1A1A" }}>
                    Machinery
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#1A1A1A" }}>
                    Pharmaceuticals
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#1A1A1A" }}>
                    Raw Materials
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#1A1A1A" }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={item.country}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid #E8E8E8" : "none",
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                    }}
                  >
                    <td style={{ padding: "16px", fontWeight: 600, color: "#1A1A1A" }}>{item.country}</td>
                    <td style={{ padding: "16px", textAlign: "center", color: item.machinery > 0 ? "#EF4444" : "#10B981" }}>
                      {item.machinery}%
                    </td>
                    <td style={{ padding: "16px", textAlign: "center", color: item.pharmaceuticals > 0 ? "#EF4444" : "#10B981" }}>
                      {item.pharmaceuticals}%
                    </td>
                    <td style={{ padding: "16px", textAlign: "center", color: "#999999" }}>{item.rawMaterials}%</td>
                    <td style={{ padding: "16px", fontSize: "12px", color: "#999999" }}>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "32px" }}>
          <div style={{ backgroundColor: "#F9F9F9", border: "1px solid #E8E8E8", borderRadius: "4px", padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "#999999", marginBottom: "8px" }}>Highest Machinery Tariff</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A" }}>
              {Math.max(...tariffData.map((d) => d.machinery))}% (China)
            </div>
          </div>

          <div style={{ backgroundColor: "#F9F9F9", border: "1px solid #E8E8E8", borderRadius: "4px", padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "#999999", marginBottom: "8px" }}>Zero-Tariff Partners</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#10B981" }}>
              {tariffData.filter((d) => d.machinery === 0 && d.pharmaceuticals === 0).length}/9
            </div>
          </div>

          <div style={{ backgroundColor: "#F9F9F9", border: "1px solid #E8E8E8", borderRadius: "4px", padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "#999999", marginBottom: "8px" }}>Avg Machinery Rate</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A" }}>
              {(tariffData.reduce((a, b) => a + b.machinery, 0) / tariffData.length).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "#F9F9F9", borderRadius: "4px", fontSize: "12px", color: "#999999" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Disclaimer:</strong> These tariff rates are approximate and subject to change. They are provided for informational purposes only.
            Please consult the US International Trade Commission (USITC) Harmonized Tariff Schedule (HTS) or US Customs and Border Protection (CBP)
            for the most current and accurate tariff information.
          </p>
          <p style={{ margin: 0 }}>
            Last updated: August 2026. Trade agreements and tariff rates change frequently. Verify rates before importing goods.
          </p>
        </div>
      </main>
    </div>
  );
}
