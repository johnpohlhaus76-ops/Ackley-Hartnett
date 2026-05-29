"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Users, Factory, Tag, ExternalLink, Globe2 } from "lucide-react";
import { cn, INDUSTRY_STYLES } from "@/lib/utils";

export interface MapSite {
  id: string;
  name: string;
  industry: keyof typeof INDUSTRY_STYLES;
  country: string | null;
  coords: [number, number];
  contactCount: number;
  installCount: number;
  machineFamilies: string[];
  logos: string[];
  people: { name: string | null; jobTitle: string | null }[];
  machines: { machine: string | null; product: string | null }[];
}

const INDUSTRY_DOT: Record<string, string> = {
  Pharmaceutical: "#2563eb",
  Confectionery: "#db2777",
  "Battery & Energy": "#d97706",
  "Distribution / MRO": "#059669",
  Other: "#64748b",
};

export function SiteMap({ sites, apiKey }: { sites: MapSite[]; apiKey: string | null }) {
  const [selected, setSelected] = useState<MapSite | null>(null);
  const [industry, setIndustry] = useState<string | null>(null);
  const shown = sites.filter((s) => !industry || s.industry === industry);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap gap-2">
          <FilterChip active={!industry} onClick={() => setIndustry(null)}>All ({sites.length})</FilterChip>
          {Object.keys(INDUSTRY_DOT).map((ind) => {
            const n = sites.filter((s) => s.industry === ind).length;
            if (!n) return null;
            return (
              <FilterChip key={ind} active={industry === ind} onClick={() => setIndustry(ind)} dot={INDUSTRY_DOT[ind]}>
                {ind} ({n})
              </FilterChip>
            );
          })}
        </div>
        <LeafletMap sites={shown} onSelect={setSelected} selectedId={selected?.id ?? null} />
      </div>
      <SitePanel site={selected} />
    </div>
  );
}

function LeafletMap({
  sites,
  onSelect,
  selectedId,
}: {
  sites: MapSite[];
  onSelect: (s: MapSite) => void;
  selectedId: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  // Load Leaflet CSS + JS once
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      if ((window as any).L) { setReady(true); }
      return;
    }

    const css = document.createElement("link");
    css.id = "leaflet-css";
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = () => setReady(true);
    document.head.appendChild(js);
  }, []);

  // Init map once Leaflet is ready
  useEffect(() => {
    if (!ready || !ref.current || mapRef.current) return;
    const L = (window as any).L;

    const map = L.map(ref.current, {
      center: [25, 15],
      zoom: 2,
      zoomControl: true,
    });

    // Esri satellite tiles — free, no API key
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 18,
      }
    ).addTo(map);

    // Labels layer on top
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18, opacity: 0.7 }
    ).addTo(map);

    mapRef.current = map;
  }, [ready]);

  // Add/update markers whenever sites change
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = (window as any).L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markersRef.current = sites.map((s) => {
      const color = INDUSTRY_DOT[s.industry] ?? "#64748b";
      const size = 10 + Math.min(s.installCount * 1.5, 14);
      const isSelected = selectedId === s.id;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:${isSelected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.85)"};
          border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,0.5);
          ${isSelected ? "outline:2px solid " + color + ";" : ""}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([s.coords[0], s.coords[1]], { icon })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:150px">
            <strong style="font-size:13px">${s.name}</strong><br/>
            <span style="color:#64748b;font-size:11px">${s.country ?? ""}</span><br/>
            <span style="font-size:11px">${s.installCount} machine${s.installCount !== 1 ? "s" : ""} · ${s.contactCount} contact${s.contactCount !== 1 ? "s" : ""}</span>
          </div>`,
          { maxWidth: 220 }
        )
        .on("click", () => {
          onSelect(s);
        });

      return marker;
    });
  }, [ready, sites, onSelect, selectedId]);

  return (
    <div
      ref={ref}
      className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-200"
      style={{ background: "#1e293b" }}
    />
  );
}

function SitePanel({ site }: { site: MapSite | null }) {
  if (!site) {
    return (
      <div className="card grid place-items-center p-8 text-center text-sm text-slate-400">
        <Globe2 className="mb-2 text-slate-300" size={28} />
        Select a site to see its people, machines and logos.
      </div>
    );
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-ink">{site.name}</h3>
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} />
            {site.country ?? "—"}
          </p>
        </div>
        <span className={cn("badge", INDUSTRY_STYLES[site.industry])}>{site.industry}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1 text-slate-500"><Users size={14} /> {site.contactCount} people</span>
        <span className="flex items-center gap-1 text-slate-500"><Factory size={14} /> {site.installCount} machines</span>
      </div>

      {site.machines.length > 0 && (
        <Section title="Machines">
          {site.machines.map((m, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="truncate">{m.machine}</span>
              {m.product && <span className="shrink-0 text-slate-400">{m.product}</span>}
            </li>
          ))}
        </Section>
      )}

      {site.people.length > 0 && (
        <Section title="People">
          {site.people.map((p, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="truncate">{p.name}</span>
              {p.jobTitle && <span className="shrink-0 truncate text-slate-400">{p.jobTitle}</span>}
            </li>
          ))}
        </Section>
      )}

      {site.logos.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Tag size={12} /> Logos / products
          </p>
          <div className="flex flex-wrap gap-1">
            {site.logos.map((l) => (
              <span key={l} className="badge bg-slate-100 text-slate-600">{l}</span>
            ))}
          </div>
        </div>
      )}

      <Link href={`/accounts/${site.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        Open Account 360 <ExternalLink size={13} />
      </Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <ul className="space-y-1 text-sm text-slate-600">{children}</ul>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      )}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}
