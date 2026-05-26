import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 pt-12 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="stat-card">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className={cn("text-2xl font-bold text-ink", accent)}>{value}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

export function Bar({
  label,
  value,
  max,
  href,
}: {
  label: string;
  value: number;
  max: number;
  href?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const inner = (
    <div className="group flex items-center gap-3 py-1.5">
      <span className="w-40 shrink-0 truncate text-sm text-slate-600 group-hover:text-ink">
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-500">{value}</span>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function CompanyLogo({
  name,
  domain,
  size = 40,
}: {
  name: string;
  domain?: string | null;
  size?: number;
}) {
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  if (domain) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        width={size}
        height={size}
        className="rounded-lg border border-slate-200 bg-white object-contain p-0.5"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500"
      style={{ width: size, height: size }}
    >
      {letters}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="card grid place-items-center p-10 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}
