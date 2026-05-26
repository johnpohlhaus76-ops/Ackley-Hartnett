"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Gauge, FileText } from "lucide-react";
import type { Catalog, CatalogItem } from "@/lib/types";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export function CatalogExplorer({ catalog }: { catalog: Catalog }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [machinesOnly, setMachinesOnly] = useState(false);

  const categories = catalog.categories;

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return categories
      .filter((c) => !cat || c.slug === cat)
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => {
          if (machinesOnly && i.kind !== "machine") return false;
          if (!needle) return true;
          return (
            i.name.toLowerCase().includes(needle) ||
            (i.partNumber ?? "").toLowerCase().includes(needle) ||
            (i.detail ?? "").toLowerCase().includes(needle)
          );
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, q, cat, machinesOnly]);

  const count = results.reduce((s, c) => s + c.items.length, 0);

  return (
    <div>
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search part #, model, description…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto max-w-[260px]" value={cat ?? ""} onChange={(e) => setCat(e.target.value || null)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={machinesOnly} onChange={(e) => setMachinesOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Machines only
        </label>
        <span className="ml-auto text-sm text-slate-400">{count} items</span>
      </div>

      <div className="space-y-6">
        {results.map((c) => (
          <div key={c.slug}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{c.name}</h2>
            <div className="card divide-y divide-slate-100">
              {c.items.map((item, i) => (
                <Item key={`${item.partNumber}-${i}`} item={item} />
              ))}
            </div>
          </div>
        ))}
        {count === 0 && <div className="card p-10 text-center text-sm text-slate-400">No catalog items match.</div>}
      </div>
    </div>
  );
}

function Item({ item }: { item: CatalogItem }) {
  const [open, setOpen] = useState(false);
  const hasParts = (item.changeParts?.length ?? 0) > 0;
  return (
    <div className="p-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ink">{item.name}</p>
            {item.kind === "machine" && <span className="badge bg-brand-50 text-brand-700">machine</span>}
            {item.partNumber && <span className="text-xs text-slate-400">{item.partNumber}</span>}
          </div>
          {item.detail && <p className="mt-0.5 text-sm text-slate-500">{item.detail}</p>}
          <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-400">
            {item.throughput && (
              <span className="flex items-center gap-1"><Gauge size={12} /> {formatThroughput(item.throughput)}</span>
            )}
            {item.cpCrating && item.cpCrating !== "NA" && <span>CP crating: {item.cpCrating}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-ink">
            {item.basePrice != null ? formatCurrency(item.basePrice) : <span className="text-sm font-normal text-slate-400">{item.priceNote ?? "—"}</span>}
          </p>
          {item.basePrice != null && <p className="text-[11px] text-slate-400">base price</p>}
        </div>
      </div>

      {hasParts && (
        <div className="mt-2">
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand-600">
            <ChevronDown size={14} className={cn("transition", open && "rotate-180")} />
            Change parts ({item.changeParts!.length} dimensions)
          </button>
          {open && (
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="py-1 font-medium">Dimension</th>
                  <th className="py-1 font-medium">Part #</th>
                  <th className="py-1 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {item.changeParts!.map((cp) => (
                  <tr key={cp.dimension}>
                    <td className="py-1.5 text-slate-600">{cp.dimension}</td>
                    <td className="py-1.5 text-slate-400">{cp.partNumber ?? "—"}</td>
                    <td className="py-1.5 text-right font-medium text-ink">{formatCurrency(cp.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function formatThroughput(t: string) {
  const n = Number(t);
  if (!Number.isNaN(n) && n > 0) return `${formatNumber(n)} pph`;
  return t.replace(/\s+/g, " ");
}
