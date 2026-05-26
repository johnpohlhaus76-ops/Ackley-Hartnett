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

declare global {
  interface Window {
    google?: any;
    __initAHMap?: () => void;
  }
}

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
        {apiKey ? (
          <GoogleMap sites={shown} apiKey={apiKey} onSelect={setSelected} selectedId={selected?.id ?? null} />
        ) : (
          <FallbackMap sites={shown} onSelect={setSelected} selectedId={selected?.id ?? null} />
        )}
      </div>

      <SitePanel site={selected} />
    </div>
  );
}

function GoogleMap({
  sites,
  apiKey,
  onSelect,
  selectedId,
}: {
  sites: MapSite[];
  apiKey: string;
  onSelect: (s: MapSite) => void;
  selectedId: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function init() {
      if (!ref.current || !window.google) return;
      mapRef.current = new window.google.maps.Map(ref.current, {
        center: { lat: 30, lng: -20 },
        zoom: 2,
        mapTypeId: "hybrid",
        streetViewControl: false,
        mapTypeControl: true,
      });
      setReady(true);
    }
    if (window.google?.maps) {
      init();
      return;
    }
    const id = "ah-gmaps";
    if (!document.getElementById(id)) {
      const sc = document.createElement("script");
      sc.id = id;
      sc.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__initAHMap`;
      sc.async = true;
      window.__initAHMap = init;
      document.head.appendChild(sc);
    } else {
      window.__initAHMap = init;
    }
  }, [apiKey]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = sites.map((s) => {
      const marker = new window.google.maps.Marker({
        position: { lat: s.coords[0], lng: s.coords[1] },
        map: mapRef.current,
        title: s.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6 + Math.min(s.installCount, 6),
          fillColor: INDUSTRY_DOT[s.industry] ?? "#64748b",
          fillOpacity: 0.9,
          strokeColor: "#fff",
          strokeWeight: 1.5,
        },
      });
      marker.addListener("click", () => onSelect(s));
      return marker;
    });
  }, [ready, sites, onSelect]);

  return <div ref={ref} className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-200" />;
}

/** Equirectangular projection fallback (no API key required). */
function FallbackMap({
  sites,
  onSelect,
  selectedId,
}: {
  sites: MapSite[];
  onSelect: (s: MapSite) => void;
  selectedId: string | null;
}) {
  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-sky-900 to-slate-900" style={{ aspectRatio: "2 / 1" }}>
        {/* graticule */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "8.33% 16.66%" }} />
        <span className="absolute left-2 top-1 text-[10px] text-white/40">Equirectangular · add a Google Maps key for satellite view</span>
        {sites.map((s) => {
          const x = ((s.coords[1] + 180) / 360) * 100;
          const y = ((90 - s.coords[0]) / 180) * 100;
          const active = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              title={s.name}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 transition hover:z-10 hover:scale-150",
                active && "z-10 ring-2 ring-white",
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 8 + Math.min(s.installCount, 8) * 1.5,
                height: 8 + Math.min(s.installCount, 8) * 1.5,
                background: INDUSTRY_DOT[s.industry] ?? "#64748b",
              }}
            />
          );
        })}
      </div>
    </div>
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
          <p className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={12} />{site.country ?? "—"}</p>
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
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400"><Tag size={12} /> Logos / products</p>
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
        active ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
      )}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}
