"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Factory, Users, Star } from "lucide-react";
import { CompanyLogo } from "@/components/ui";
import { cn, INDUSTRY_STYLES, priorityStyle } from "@/lib/utils";

export interface SlimAccount {
  id: string;
  name: string;
  domain: string | null;
  industry: keyof typeof INDUSTRY_STYLES;
  country: string | null;
  contactCount: number;
  installCount: number;
  machineFamilies: string[];
  priorityLevel: string | null;
  priorityScore: number | null;
  sources: string[];
}

const INDUSTRIES = [
  "Pharmaceutical",
  "Confectionery",
  "Battery & Energy",
  "Distribution / MRO",
  "Other",
] as const;

type SortKey = "priority" | "machines" | "people" | "name";

export function AccountsExplorer({ accounts }: { accounts: SlimAccount[] }) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "machines" | "people" | "priority">("all");
  const [sort, setSort] = useState<SortKey>("priority");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = accounts.filter((a) => {
      if (industry && a.industry !== industry) return false;
      if (filter === "machines" && a.installCount === 0) return false;
      if (filter === "people" && a.contactCount === 0) return false;
      if (filter === "priority" && !a.priorityScore) return false;
      if (needle && !a.name.toLowerCase().includes(needle) && !(a.country ?? "").toLowerCase().includes(needle))
        return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "machines") return b.installCount - a.installCount;
      if (sort === "people") return b.contactCount - a.contactCount;
      if (sort === "name") return a.name.localeCompare(b.name);
      return (b.priorityScore ?? 0) - (a.priorityScore ?? 0) || b.installCount - a.installCount;
    });
    return list;
  }, [accounts, q, industry, filter, sort]);

  return (
    <div>
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search company or country…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={industry ?? ""} onChange={(e) => setIndustry(e.target.value || null)}>
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="priority">Sort: Priority</option>
          <option value="machines">Sort: Machines</option>
          <option value="people">Sort: People</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ["all", "All"],
          ["machines", "Has machines"],
          ["people", "Has contacts"],
          ["priority", "Priority targets"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition",
              filter === key ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-slate-400">{filtered.length} accounts</span>
      </div>

      <div className="card divide-y divide-slate-100">
        {filtered.slice(0, 200).map((a) => (
          <Link key={a.id} href={`/portal/accounts/${a.id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50">
            <CompanyLogo name={a.name} domain={a.domain} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{a.name}</p>
              <p className="truncate text-xs text-slate-400">
                {[a.country, ...a.machineFamilies.slice(0, 2)].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <span className={cn("badge hidden sm:inline-flex", INDUSTRY_STYLES[a.industry])}>{a.industry}</span>
            <div className="flex w-28 items-center justify-end gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Users size={13} />{a.contactCount}</span>
              <span className="flex items-center gap-1"><Factory size={13} />{a.installCount}</span>
            </div>
            {a.priorityLevel && (
              <span className={cn("badge w-7 justify-center", priorityStyle(a.priorityLevel))}>
                {a.priorityLevel.split(" ")[0]}
              </span>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">No accounts match your filters.</div>
        )}
      </div>
      {filtered.length > 200 && (
        <p className="mt-3 text-center text-xs text-slate-400">Showing first 200 of {filtered.length}. Refine your search.</p>
      )}
    </div>
  );
}
