"use client";

import { useState, useEffect } from "react";
import { MapPin, Wrench, FileText, AlertCircle, Search, Plus, ChevronDown, AlertTriangle, Package, History, Pill } from "lucide-react";

interface Manual {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
  version: string;
}

interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  status: string;
  cost: number;
  leadTime: string;
}

interface SparePartNeeded {
  id: string;
  name: string;
  partNumber: string;
  priority: string;
  reason: string;
  estimatedCost: number;
  recommendedAction: string;
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  technician: string;
  hours: number;
  description: string;
  cost: number;
  partsUsed: string[];
  nextScheduled: string | null;
}

interface Machine {
  id: string;
  model: string;
  serialNumber: string;
  installDate: string;
  status: "active" | "maintenance" | "decommissioned";
  capabilities: string[];
  lastServiceDate: string;
  nextServiceDate: string;
  hoursOperating: number;
  manuals: Manual[];
  spareParts: SparePart[];
  sparePartsNeeded: SparePartNeeded[];
  maintenanceRecords: MaintenanceRecord[];
  notes: string[];
}

interface Plant {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  machines: Machine[];
  drugs: string[];
}

export default function PlantManagementPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"machines" | "drugs" | "parts" | "maintenance">("machines");

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const res = await fetch("/api/plants/detailed");
        const data = await res.json();
        setPlants(data.plants || []);
        if (data.plants?.length > 0) {
          setSelectedPlant(data.plants[0]);
          if (data.plants[0].machines?.length > 0) {
            setSelectedMachine(data.plants[0].machines[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load plants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, []);

  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E8E8E8",
        padding: "24px 32px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1A1A1A", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <MapPin size={32} color="#1E5BA8" />
            Plant Management System
          </h1>
          <p style={{ fontSize: "13px", color: "#999999", margin: "8px 0 0 0" }}>
            Global pharmaceutical plant inventory, machine tracking & service management
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#999999" }}>
            Loading plant data...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "32px" }}>
            {/* Plants List */}
            <div>
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#999999" }} />
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 40px",
                    border: "1px solid #E8E8E8",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant)}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      backgroundColor: selectedPlant?.id === plant.id ? "#F0F7FF" : "#FFFFFF",
                      border: selectedPlant?.id === plant.id ? "2px solid #1E5BA8" : "1px solid #E8E8E8",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}>
                      {plant.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>
                      {plant.city}, {plant.country}
                    </div>
                    <div style={{ fontSize: "11px", color: "#1E5BA8", fontWeight: 500, marginTop: "4px" }}>
                      {plant.machines.length} machines
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plant Details */}
            {selectedPlant && (
              <div>
                {/* Plant Header */}
                <div style={{
                  backgroundColor: "#F9F9F9",
                  border: "1px solid #E8E8E8",
                  borderRadius: "8px",
                  padding: "24px",
                  marginBottom: "24px"
                }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 12px 0" }}>
                    {selectedPlant.name}
                  </h2>
                  <div style={{ fontSize: "14px", color: "#666666", lineHeight: 1.6, marginBottom: "12px" }}>
                    <div>📍 {selectedPlant.address}</div>
                    <div>{selectedPlant.city}, {selectedPlant.country}</div>
                  </div>
                  <div style={{ display: "flex", gap: "24px", fontSize: "13px", fontWeight: 600, color: "#1E5BA8" }}>
                    <div>🏭 {selectedPlant.machines.length} Machines</div>
                    <div>💊 {selectedPlant.drugs.length} Drugs</div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #E8E8E8", paddingBottom: "16px" }}>
                  {[
                    { id: "machines", label: "Machines", icon: Wrench },
                    { id: "drugs", label: "Drugs", icon: Pill },
                    { id: "parts", label: "Spare Parts", icon: Package },
                    { id: "maintenance", label: "Maintenance", icon: History }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: activeTab === tab.id ? "#1E5BA8" : "#FFFFFF",
                        color: activeTab === tab.id ? "#FFFFFF" : "#666666",
                        border: "1px solid " + (activeTab === tab.id ? "#1E5BA8" : "#E8E8E8"),
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {/* Machines Tab */}
                {activeTab === "machines" && (
                  <div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "16px"
                    }}>
                      {selectedPlant.machines.map((machine) => (
                        <div
                          key={machine.id}
                          onClick={() => setSelectedMachine(machine)}
                          style={{
                            backgroundColor: selectedMachine?.id === machine.id ? "#F0F7FF" : "#FFFFFF",
                            border: selectedMachine?.id === machine.id ? "2px solid #1E5BA8" : "1px solid #E8E8E8",
                            borderRadius: "8px",
                            padding: "16px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                            <div>
                              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
                                {machine.model}
                              </h4>
                              <div style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>
                                SN: {machine.serialNumber}
                              </div>
                            </div>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 600,
                              backgroundColor: machine.status === "active" ? "#D1FAE5" : "#FEF3C7",
                              color: machine.status === "active" ? "#065F46" : "#92400E"
                            }}>
                              {machine.status.toUpperCase()}
                            </span>
                          </div>

                          <div style={{
                            fontSize: "11px",
                            color: "#666666",
                            padding: "12px 0",
                            borderTop: "1px solid #E8E8E8",
                            borderBottom: "1px solid #E8E8E8",
                            margin: "12px 0"
                          }}>
                            <div>📅 Installed: {machine.installDate}</div>
                            <div>⏱️ {machine.hoursOperating.toLocaleString()} hours</div>
                            <div style={{ marginTop: "4px", color: "#1E5BA8", fontWeight: 500 }}>
                              Next Service: {machine.nextServiceDate}
                            </div>
                          </div>

                          <div style={{ fontSize: "11px", color: "#2C2C2C" }}>
                            {machine.manuals.length} Manuals • {machine.spareParts.length} Parts • {machine.maintenanceRecords.length} Records
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Machine Detail Panel */}
                    {selectedMachine && (
                      <div style={{
                        marginTop: "24px",
                        backgroundColor: "#F9F9F9",
                        border: "1px solid #E8E8E8",
                        borderRadius: "8px",
                        padding: "24px"
                      }}>
                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
                          {selectedMachine.model} - Detailed View
                        </h4>

                        {/* Manuals */}
                        <div style={{ marginBottom: "24px" }}>
                          <h5 style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FileText size={16} color="#1E5BA8" />
                            Manuals ({selectedMachine.manuals.length})
                          </h5>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                            {selectedMachine.manuals.map(manual => (
                              <div key={manual.id} style={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E8E8E8",
                                borderRadius: "4px",
                                padding: "12px",
                                fontSize: "12px"
                              }}>
                                <div style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: "4px" }}>{manual.title}</div>
                                <div style={{ color: "#666666", fontSize: "11px" }}>
                                  {manual.type} • {manual.size} • v{manual.version}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {selectedMachine.notes.length > 0 && (
                          <div>
                            <h5 style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A", marginBottom: "12px" }}>Notes</h5>
                            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "4px", padding: "12px" }}>
                              {selectedMachine.notes.map((note, i) => (
                                <div key={i} style={{ fontSize: "12px", color: "#2C2C2C", marginBottom: i < selectedMachine.notes.length - 1 ? "8px" : 0 }}>
                                  • {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Drugs Tab */}
                {activeTab === "drugs" && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Pill size={20} color="#1E5BA8" />
                      Drugs Produced ({selectedPlant.drugs.length})
                    </h3>
                    {selectedPlant.drugs.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                        {selectedPlant.drugs.map((drug) => (
                          <div key={drug} style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E8E8E8",
                            borderRadius: "8px",
                            padding: "16px"
                          }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>
                              💊 {drug}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666666", marginTop: "8px" }}>
                              Manufactured at {selectedPlant.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: "#F9F9F9",
                        border: "1px solid #E8E8E8",
                        borderRadius: "8px",
                        padding: "24px",
                        textAlign: "center",
                        color: "#999999"
                      }}>
                        No drugs data available for this plant
                      </div>
                    )}
                  </div>
                )}

                {/* Spare Parts Tab */}
                {activeTab === "parts" && (
                  <div>
                    {selectedMachine ? (
                      <>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
                          {selectedMachine.model} - Spare Parts Management
                        </h3>

                        {/* Parts Needed - Urgent */}
                        {selectedMachine.sparePartsNeeded.length > 0 && (
                          <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#D32F2F", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <AlertTriangle size={16} />
                              Parts Needed ({selectedMachine.sparePartsNeeded.length})
                            </h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
                              {selectedMachine.sparePartsNeeded.map(part => (
                                <div key={part.id} style={{
                                  backgroundColor: part.priority === "urgent" ? "#FFF3F0" : "#FFFBF0",
                                  border: `2px solid ${part.priority === "urgent" ? "#D32F2F" : "#FF9800"}`,
                                  borderRadius: "6px",
                                  padding: "12px"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                                    <div style={{ fontWeight: 600, color: "#1A1A1A" }}>{part.name}</div>
                                    <span style={{
                                      padding: "2px 8px",
                                      borderRadius: "3px",
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      backgroundColor: part.priority === "urgent" ? "#FFEBEE" : "#FFF3E0",
                                      color: part.priority === "urgent" ? "#D32F2F" : "#FF6F00"
                                    }}>
                                      {part.priority.toUpperCase()}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#666666", marginBottom: "8px" }}>
                                    <div>PN: {part.partNumber}</div>
                                    <div>Est. Cost: ${part.estimatedCost}</div>
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#2C2C2C", marginBottom: "8px", fontStyle: "italic" }}>
                                    Reason: {part.reason}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#1E5BA8", fontWeight: 500, backgroundColor: "#F0F7FF", padding: "6px", borderRadius: "3px" }}>
                                    {part.recommendedAction}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* In-Stock Parts */}
                        <div>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1E5BA8", marginBottom: "12px" }}>
                            Inventory ({selectedMachine.spareParts.length})
                          </h4>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "12px"
                          }}>
                            {selectedMachine.spareParts.map(part => (
                              <div key={part.id} style={{
                                backgroundColor: part.status === "in-stock" ? "#F0F7FF" : "#FFF9C4",
                                border: `1px solid ${part.status === "in-stock" ? "#1E5BA8" : "#FFC107"}`,
                                borderRadius: "6px",
                                padding: "12px"
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                                  <div style={{ fontWeight: 600, color: "#1A1A1A", fontSize: "13px" }}>{part.name}</div>
                                  <span style={{
                                    padding: "2px 8px",
                                    borderRadius: "3px",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    backgroundColor: part.status === "in-stock" ? "#D1FAE5" : "#FEF3C7",
                                    color: part.status === "in-stock" ? "#065F46" : "#92400E"
                                  }}>
                                    {part.status === "in-stock" ? "IN STOCK" : "ON ORDER"}
                                  </span>
                                </div>
                                <div style={{ fontSize: "11px", color: "#666666", lineHeight: 1.6 }}>
                                  <div>PN: {part.partNumber}</div>
                                  <div>Qty: {part.quantity}</div>
                                  <div>Cost: ${part.cost}</div>
                                  <div>Lead: {part.leadTime}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        backgroundColor: "#F9F9F9",
                        border: "1px solid #E8E8E8",
                        borderRadius: "8px",
                        padding: "24px",
                        textAlign: "center",
                        color: "#999999"
                      }}>
                        Select a machine to view spare parts
                      </div>
                    )}
                  </div>
                )}

                {/* Maintenance Tab */}
                {activeTab === "maintenance" && (
                  <div>
                    {selectedMachine ? (
                      <>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
                          {selectedMachine.model} - Service History
                        </h3>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px"
                        }}>
                          {selectedMachine.maintenanceRecords.map((record, i) => (
                            <div key={record.id} style={{
                              backgroundColor: record.type === "Repair" ? "#FFF3F0" : "#F0F7FF",
                              border: `1px solid ${record.type === "Repair" ? "#D32F2F" : "#1E5BA8"}`,
                              borderRadius: "8px",
                              padding: "16px"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                                <div>
                                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: 0, marginBottom: "4px" }}>
                                    {record.type}
                                  </h4>
                                  <div style={{ fontSize: "12px", color: "#666666" }}>
                                    {new Date(record.date).toLocaleDateString()} • By {record.technician} • {record.hours} hours
                                  </div>
                                </div>
                                <span style={{
                                  padding: "4px 12px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  backgroundColor: record.type === "Repair" ? "#FFEBEE" : record.type === "Preventive Maintenance" ? "#E8F5E9" : "#F3F4F6",
                                  color: record.type === "Repair" ? "#D32F2F" : record.type === "Preventive Maintenance" ? "#2E7D32" : "#616161"
                                }}>
                                  ${record.cost.toLocaleString()}
                                </span>
                              </div>

                              <div style={{
                                fontSize: "13px",
                                color: "#2C2C2C",
                                marginBottom: "12px",
                                padding: "12px",
                                backgroundColor: "rgba(255,255,255,0.5)",
                                borderRadius: "4px",
                                lineHeight: 1.5
                              }}>
                                {record.description}
                              </div>

                              {record.partsUsed.length > 0 && (
                                <div style={{ fontSize: "11px", color: "#666666", marginBottom: "8px" }}>
                                  <strong>Parts Used:</strong> {record.partsUsed.join(", ")}
                                </div>
                              )}

                              {record.nextScheduled && (
                                <div style={{ fontSize: "11px", color: "#1E5BA8", fontWeight: 500 }}>
                                  ➜ Next scheduled: {new Date(record.nextScheduled).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{
                        backgroundColor: "#F9F9F9",
                        border: "1px solid #E8E8E8",
                        borderRadius: "8px",
                        padding: "24px",
                        textAlign: "center",
                        color: "#999999"
                      }}>
                        Select a machine to view maintenance history
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
