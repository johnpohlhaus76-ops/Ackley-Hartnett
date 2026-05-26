import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Industry } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number | null | undefined, opts: { compact?: boolean } = {}) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: opts.compact ? "compact" : "standard",
  }).format(n);
}

export function formatNumber(n: number | null | undefined, opts: { compact?: boolean } = {}) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: opts.compact ? "compact" : "standard",
  }).format(n);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const INDUSTRY_STYLES: Record<Industry, string> = {
  Pharmaceutical: "bg-blue-100 text-blue-700",
  Confectionery: "bg-pink-100 text-pink-700",
  "Battery & Energy": "bg-amber-100 text-amber-700",
  "Distribution / MRO": "bg-emerald-100 text-emerald-700",
  Other: "bg-slate-100 text-slate-600",
};

export function priorityStyle(level: string | null | undefined) {
  if (!level) return "bg-slate-100 text-slate-600";
  if (level.startsWith("A")) return "bg-red-100 text-red-700";
  if (level.startsWith("B")) return "bg-orange-100 text-orange-700";
  if (level.startsWith("C")) return "bg-yellow-100 text-yellow-700";
  return "bg-slate-100 text-slate-600";
}
