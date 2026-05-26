"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/machines", label: "Machines" },
  { href: "/technology", label: "Technology" },
  { href: "/quality", label: "Quality & GMP" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-laser-400 to-brand-600 text-sm font-black text-ink">
            AH
            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-white">Ackley Hartnett</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-laser-300/80">
              Pharmaceutical Systems
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                  active ? "text-laser-300" : "text-slate-200 hover:bg-white/5 hover:text-white",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <LayoutDashboard size={15} /> Sales Portal
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-lg bg-laser-500 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-laser-400"
          >
            Request a Quote <ArrowRight size={15} />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink/95 px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/portal"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white"
            >
              Sales Portal
            </Link>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-laser-500 px-4 py-3 text-sm font-semibold text-ink"
            >
              Request a Quote <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
