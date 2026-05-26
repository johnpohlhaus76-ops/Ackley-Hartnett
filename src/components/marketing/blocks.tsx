import Link from "next/link";
import { ArrowRight, FileText, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/marketing";
import { getCategory } from "@/lib/marketing";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-tech">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-laser-400/50 to-transparent" />
      <div className="container-x relative pb-16 pt-32 sm:pb-20 sm:pt-36">
        <span className="eyebrow-dark animate-fade-in">{eyebrow}</span>
        <h1 className="mt-5 max-w-3xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl animate-fade-up">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300 animate-fade-up">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  dark = false,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <span className={dark ? "eyebrow-dark" : "eyebrow"}>{eyebrow}</span>}
      <h2
        className={cn(
          "mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const cat = getCategory(product.category);
  return (
    <Link
      href={`/machines/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-laser-300 hover:shadow-glow"
    >
      <div className="flex items-center justify-between">
        <span className="badge bg-laser-50 text-laser-700">{cat?.name}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
          <Gauge size={13} /> {product.throughput}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-ink group-hover:text-laser-700">
        {product.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-500">{product.tagline}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{product.blurb}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        <Spec>{product.technology}</Spec>
        <Spec>{product.sides}</Spec>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-laser-700">
          View machine <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <FileText size={13} /> Datasheet
        </span>
      </div>
    </Link>
  );
}

export function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}

export function StatBig({
  value,
  label,
  dark = false,
}: {
  value: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "text-4xl font-bold tracking-tight sm:text-5xl",
          dark ? "gradient-text" : "text-brand-700",
        )}
      >
        {value}
      </div>
      <div className={cn("mt-2 text-sm", dark ? "text-slate-400" : "text-slate-500")}>{label}</div>
    </div>
  );
}
