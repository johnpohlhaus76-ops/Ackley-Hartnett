"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin, Plane, Car, Plus, X, Navigation, Users,
  Factory, ChevronDown, ChevronUp, Target, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TripAccount {
  id: string;
  name: string;
  industry: string;
  city: string | null;
  state: string | null;
  country: string | null;
  coords: [number, number];
  installCount: number;
  contactCount: number;
  isProspect: boolean;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

const REPS = [
  { id: "kevit", name: "Kevit Modh", territory: "USA & North America", color: "#2563eb" },
  { id: "kyle", name: "Kyle Boyce", territory: "Europe & South America", color: "#7c3aed" },
  { id: "john", name: "John Pohlhaus", territory: "Asia, Middle East & Candy/Mars", color: "#059669" },
];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function driveTime(miles: number): string {
  const hours = miles / 55;
  if (hours < 1) return `${Math.round(hours * 60)}m drive`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m drive` : `${h}h drive`;
}

function nearestAirports(lat: number, lng: number, airports: Airport[], n = 3): (Airport & { miles: number })[] {
  return airports
    .map((a) => ({ ...a, miles: Math.round(haversine(lat, lng, a.lat, a.lng)) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, n);
}

declare global { interface Window { L?: any; __initTerritoryMap?: () => void; __addToTrip?: (id: string) => void; } }

const NA_AIRPORTS: Airport[] = [
  { code: "EWR", name: "Newark Liberty", city: "Newark, NJ", lat: 40.6895, lng: -74.1745 },
  { code: "PHL", name: "Philadelphia Intl", city: "Philadelphia, PA", lat: 39.8729, lng: -75.2437 },
  { code: "JFK", name: "John F. Kennedy", city: "New York, NY", lat: 40.6413, lng: -73.7781 },
  { code: "BOS", name: "Logan Intl", city: "Boston, MA", lat: 42.3656, lng: -71.0096 },
  { code: "BWI", name: "BWI Marshall", city: "Baltimore, MD", lat: 39.1754, lng: -76.6682 },
  { code: "IAD", name: "Dulles Intl", city: "Washington, DC", lat: 38.9531, lng: -77.4565 },
  { code: "RDU", name: "Raleigh-Durham", city: "Raleigh, NC", lat: 35.8776, lng: -78.7875 },
  { code: "CLT", name: "Charlotte Douglas", city: "Charlotte, NC", lat: 35.2140, lng: -80.9431 },
  { code: "ATL", name: "Hartsfield-Jackson", city: "Atlanta, GA", lat: 33.6407, lng: -84.4277 },
  { code: "ORD", name: "O'Hare Intl", city: "Chicago, IL", lat: 41.9742, lng: -87.9073 },
  { code: "DTW", name: "Detroit Metro", city: "Detroit, MI", lat: 42.2162, lng: -83.3554 },
  { code: "CLE", name: "Cleveland Hopkins", city: "Cleveland, OH", lat: 41.4117, lng: -81.8498 },
  { code: "PIT", name: "Pittsburgh Intl", city: "Pittsburgh, PA", lat: 40.4915, lng: -80.2329 },
  { code: "IND", name: "Indianapolis Intl", city: "Indianapolis, IN", lat: 39.7173, lng: -86.2944 },
  { code: "MSP", name: "Minneapolis-St. Paul", city: "Minneapolis, MN", lat: 44.8848, lng: -93.2223 },
  { code: "DFW", name: "Dallas/Fort Worth", city: "Dallas, TX", lat: 32.8998, lng: -97.0403 },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston, TX", lat: 29.9902, lng: -95.3368 },
  { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles, CA", lat: 33.9425, lng: -118.4081 },
  { code: "SFO", name: "San Francisco Intl", city: "San Francisco, CA", lat: 37.6213, lng: -122.3790 },
  { code: "SEA", name: "Seattle-Tacoma", city: "Seattle, WA", lat: 47.4502, lng: -122.3088 },
  { code: "DEN", name: "Denver Intl", city: "Denver, CO", lat: 39.8561, lng: -104.6737 },
  { code: "MIA", name: "Miami Intl", city: "Miami, FL", lat: 25.7959, lng: -80.2870 },
  { code: "YYZ", name: "Toronto Pearson", city: "Toronto, ON", lat: 43.6777, lng: -79.6248 },
  { code: "SJU", name: "Luis Munoz Marin", city: "San Juan, PR", lat: 18.4394, lng: -66.0018 },
];

export function TerritoryPlanner({ accounts }: { accounts: TripAccount[] }) {
  const airports = NA_AIRPORTS;
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const routeLayerRef = useRef<any>(null);
  const airportLayersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [trip, setTrip] = useState<TripAccount[]>([]);
  const [selected, setSelected] = useState<TripAccount | null>(null);
  const [filter, setFilter] = useState<"all" | "customers" | "prospects">("all");
  const [rep, setRep] = useState(REPS[0]);
  const [showAirports, setShowAirports] = useState(true);
  const [search, setSearch] = useState("");

  const shown = accounts.filter((a) => {
    if (filter === "customers" && a.isProspect) return false;
    if (filter === "prospects" && !a.isProspect) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !(a.state ?? "").toLowerCase().includes(search.toLowerCase()) &&
        !(a.city ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Init Leaflet
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      if (window.L) { setReady(true); return; }
    }
    const css = document.createElement("link");
    css.id = "leaflet-css"; css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = () => setReady(true);
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [38, -95], zoom: 4 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors", maxZoom: 18,
    }).addTo(map);
    leafletMap.current = map;
  }, [ready]);

  const inTrip = useCallback((id: string) => trip.some((t) => t.id === id), [trip]);

  // Render account markers
  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const L = window.L;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    shown.forEach((a) => {
      const inT = inTrip(a.id);
      const color = a.isProspect ? "#f59e0b" : "#2563eb";
      const size = inT ? 16 : 10;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:${inT ? "3px solid #fff" : "2px solid rgba(255,255,255,0.8)"};border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);${inT ? "outline:2px solid " + color : ""}"></div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([a.coords[0], a.coords[1]], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`<div style="font-family:sans-serif;min-width:160px">
          <strong style="font-size:13px">${a.name}</strong><br/>
          <span style="color:#64748b;font-size:11px">${[a.city, a.state, a.country].filter(Boolean).join(", ")}</span><br/>
          <span style="font-size:11px">${a.isProspect ? "🎯 Prospect" : "✅ Customer"} · ${a.installCount} machines · ${a.contactCount} contacts</span><br/>
          <button onclick="window.__addToTrip('${a.id}')" style="margin-top:6px;background:${inT ? "#ef4444" : "#2563eb"};color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px">
            ${inT ? "Remove from Trip" : "+ Add to Trip"}
          </button>
        </div>`)
        .on("click", () => setSelected(a));
      markersRef.current.set(a.id, marker);
    });

    window.__addToTrip = (id: string) => {
      const acc = accounts.find((a) => a.id === id);
      if (!acc) return;
      setTrip((prev) => prev.some((t) => t.id === id) ? prev.filter((t) => t.id !== id) : [...prev, acc]);
    };
  }, [ready, shown, inTrip, accounts]);

  // Draw ALL airports as base markers whenever the toggle is on (independent of any trip)
  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const L = window.L;

    airportLayersRef.current.forEach((l) => l.remove());
    airportLayersRef.current = [];

    if (!showAirports) return;

    airports.forEach((ap) => {
      const apIcon = L.divIcon({
        className: "",
        html: `<div style="background:#0f172a;color:#f59e0b;border:1px solid #f59e0b;border-radius:4px;padding:1px 5px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.35)">${ap.code}</div>`,
        iconSize: [36, 18], iconAnchor: [18, 9],
      });
      const m = L.marker([ap.lat, ap.lng], { icon: apIcon })
        .addTo(leafletMap.current)
        .bindPopup(`<strong>${ap.code}</strong> ${ap.name}<br/>${ap.city}`);
      airportLayersRef.current.push(m);
    });
  }, [ready, showAirports, airports]);

  // Draw the route line for the current trip
  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const L = window.L;

    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }

    if (trip.length < 2) return;

    const latlngs = trip.map((a) => [a.coords[0], a.coords[1]]);
    routeLayerRef.current = L.polyline(latlngs, { color: rep.color, weight: 3, dashArray: "6,8", opacity: 0.8 }).addTo(leafletMap.current);

    // Fit map to route
    leafletMap.current.fitBounds(L.latLngBounds(latlngs as any), { padding: [40, 40] });
  }, [ready, trip, rep.color]);

  // Total trip stats
  const totalMiles = trip.reduce((sum, a, i) => {
    if (i === 0) return 0;
    const prev = trip[i - 1];
    return sum + haversine(prev.coords[0], prev.coords[1], a.coords[0], a.coords[1]);
  }, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      {/* Map */}
      <div>
        {/* Controls */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts…"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 w-48"
          />
          {["all", "customers", "prospects"].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={cn("rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                filter === f ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}
            >{f}</button>
          ))}
          <button onClick={() => setShowAirports((v) => !v)}
            className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
              showAirports ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" : "bg-white text-slate-600 ring-1 ring-slate-200")}
          ><Plane size={12} /> Airports</button>
          <div className="ml-auto flex items-center gap-1">
            {REPS.map((r) => (
              <button key={r.id} onClick={() => setRep(r)}
                className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition",
                  rep.id === r.id ? "text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}
                style={rep.id === r.id ? { background: r.color } : {}}
              >{r.name.split(" ")[0]}</button>
            ))}
          </div>
        </div>

        <div ref={mapRef} className="h-[580px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" />

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-600" /> Customer</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" /> Prospect</span>
          <span className="flex items-center gap-1.5"><span className="inline-block rounded bg-slate-900 px-1 text-[10px] font-bold text-amber-400">APT</span> Airport</span>
          <span className="ml-auto">{shown.length} accounts shown</span>
        </div>
      </div>

      {/* Trip Builder Panel */}
      <div className="space-y-4">
        {/* Rep card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Trip Owner</p>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg text-white text-sm font-bold" style={{ background: rep.color }}>
              {rep.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{rep.name}</p>
              <p className="text-xs text-slate-500">{rep.territory}</p>
            </div>
          </div>
        </div>

        {/* Trip stops */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Trip Stops ({trip.length})</p>
            {trip.length > 0 && (
              <button onClick={() => setTrip([])} className="text-xs text-red-500 hover:text-red-600">Clear all</button>
            )}
          </div>

          {trip.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              <Navigation size={24} className="mx-auto mb-2 text-slate-300" />
              Click pins on the map to add stops
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {trip.map((a, i) => {
                const prevMiles = i > 0
                  ? Math.round(haversine(trip[i-1].coords[0], trip[i-1].coords[1], a.coords[0], a.coords[1]))
                  : null;
                const nearAp = nearestAirports(a.coords[0], a.coords[1], airports, 1)[0];
                return (
                  <div key={a.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                        <p className="text-xs text-slate-400">{[a.city, a.state].filter(Boolean).join(", ")}</p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                          {prevMiles && (
                            <span className="flex items-center gap-0.5"><Car size={10} /> {prevMiles}mi · {driveTime(prevMiles)}</span>
                          )}
                          <span className="flex items-center gap-0.5"><Plane size={10} /> {nearAp.code} {nearAp.miles}mi</span>
                          <span className="flex items-center gap-0.5">
                            {a.isProspect ? <Target size={10} className="text-amber-500" /> : <Factory size={10} className="text-blue-600" />}
                            {a.isProspect ? "Prospect" : `${a.installCount} machines`}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setTrip((prev) => prev.filter((t) => t.id !== a.id))} className="text-slate-300 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trip summary */}
          {trip.length > 1 && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-bold text-ink">{trip.length}</p>
                  <p className="text-slate-400">Stops</p>
                </div>
                <div>
                  <p className="font-bold text-ink">{Math.round(totalMiles).toLocaleString()}</p>
                  <p className="text-slate-400">Miles</p>
                </div>
                <div>
                  <p className="font-bold text-ink">{Math.round(totalMiles / 55 / 8 * 10) / 10}</p>
                  <p className="text-slate-400">Drive days</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {trip.filter((a) => !a.isProspect).length > 0 && (
                  <span className="badge bg-blue-50 text-blue-700">{trip.filter((a) => !a.isProspect).length} customers</span>
                )}
                {trip.filter((a) => a.isProspect).length > 0 && (
                  <span className="badge bg-amber-50 text-amber-700">{trip.filter((a) => a.isProspect).length} prospects</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected account detail */}
        {selected && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">{selected.name}</p>
                <p className="text-xs text-slate-400">{[selected.city, selected.state, selected.country].filter(Boolean).join(", ")}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <span className="flex items-center gap-1 text-slate-500"><Users size={13} /> {selected.contactCount} contacts</span>
              <span className="flex items-center gap-1 text-slate-500"><Factory size={13} /> {selected.installCount} machines</span>
            </div>
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nearest Airports</p>
              {nearestAirports(selected.coords[0], selected.coords[1], airports, 3).map((ap) => (
                <div key={ap.code} className="flex items-center justify-between py-1 text-xs">
                  <span className="font-bold text-amber-600">{ap.code}</span>
                  <span className="text-slate-500">{ap.name.split(" ").slice(0, 3).join(" ")}</span>
                  <span className="text-slate-400">{ap.miles}mi</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setTrip((prev) => inTrip(selected.id) ? prev.filter((t) => t.id !== selected.id) : [...prev, selected])}
                className={cn("flex-1 rounded-lg py-2 text-xs font-semibold transition",
                  inTrip(selected.id)
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                )}
              >
                {inTrip(selected.id) ? "Remove from Trip" : "+ Add to Trip"}
              </button>
              <Link href={`/portal/accounts/${selected.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                360 View
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
