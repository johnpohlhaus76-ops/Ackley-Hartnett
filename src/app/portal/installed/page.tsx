"use client";
import { useState, useMemo } from "react";
import installs from "@/../../data/installs.json";
import { Factory, Search, Globe2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type Machine = {
  serial: string; customer: string; description: string;
  country: string; shipped: string; soNumber: string;
  customerPO: string; address: string;
};

const MACHINES: Machine[] = (installs as { machines: Machine[] }).machines;

const ALL_COUNTRIES = ["All", ...Array.from(new Set(MACHINES.map(m => m.country).filter(Boolean))).sort()];
const ALL_FAMILIES = ["All", ...Array.from(new Set(MACHINES.map(m => m.description).filter(Boolean))).sort()];

export default function InstalledBasePage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All");
  const [family, setFamily] = useState("All");

  const filtered = useMemo(() => MACHINES.filter(m => {
    if (country !== "All" && m.country !== country) return false;
    if (family !== "All" && m.description !== family) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.customer.toLowerCase().includes(q) ||
             m.serial.includes(q) ||
             m.description.toLowerCase().includes(q) ||
             m.country.toLowerCase().includes(q) ||
             m.soNumber.toLowerCase().includes(q);
    }
    return true;
  }), [search, country, family]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 pt-12 lg:pt-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Installed Base</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length.toLocaleString()} of {MACHINES.length.toLocaleString()} machines — full global installed base
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer, serial, machine…"
            className="rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-400 w-64"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Globe2 size={14} className="text-slate-400" />
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-brand-400"
          >
            {ALL_COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400" />
          <select
            value={family}
            onChange={e => setFamily(e.target.value)}
            className="rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-brand-400"
          >
            {ALL_FAMILIES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        {(search || country !== "All" || family !== "All") && (
          <button
            onClick={() => { setSearch(""); setCountry("All"); setFamily("All"); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Serial</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Customer</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Machine</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Country</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Shipped</th>
              <th className="px-4 py-3 font-semibold text-slate-600">SO #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice(0, 500).map((m, i) => (
              <tr key={m.serial + i} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{m.serial}</td>
                <td className="px-4 py-2.5 font-medium text-ink max-w-[200px] truncate">{m.customer}</td>
                <td className="px-4 py-2.5 text-slate-600 max-w-[180px] truncate">{m.description}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{m.country}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{m.shipped}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{m.soNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 500 && (
          <div className="border-t border-slate-200 px-4 py-3 text-center text-sm text-slate-500">
            Showing first 500 of {filtered.length.toLocaleString()} results — use filters to narrow down
          </div>
        )}
      </div>
    </div>
  );
}
