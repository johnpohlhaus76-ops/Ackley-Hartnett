"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Factory,
  Boxes,
  FileText,
  Globe2,
  BookOpen,
  Contact,
  Menu,
  X,
  ExternalLink,
  Target,
  Navigation,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
      { href: "/portal/crm", label: "CRM (HubSpot)", icon: Contact },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/portal/accounts", label: "Accounts 360", icon: Building2 },
      { href: "/portal/installed", label: "Installed Base", icon: Factory },
      { href: "/portal/prospects", label: "Prospects", icon: Target },
      { href: "/portal/territory", label: "Territory Planner", icon: Navigation },
      { href: "/portal/map", label: "Global Map", icon: Map },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/portal/catalog", label: "Equipment Catalog", icon: Boxes },
      { href: "/portal/quote", label: "Quote Builder", icon: FileText },
      { href: "/portal/datasheets", label: "Datasheets", icon: BookOpen },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Brand />
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 hover:bg-slate-100">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="hidden border-b border-slate-200 px-5 py-5 lg:block">
            <Brand />
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 pt-20 lg:pt-4 space-y-4">
            {NAV_SECTIONS.map((section, si) => (
              <div key={si}>
                {section.label && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                        isActive(href)
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-ink",
                      )}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="space-y-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
            >
              <ExternalLink size={13} /> View public site
            </Link>
            <div>
              <p className="font-medium text-slate-500">Ackley Hartnett</p>
              <p>215-969-9190 · info@ackleyhartnett.com</p>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

function Brand() {
  return (
    <Link href="/portal" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-bold text-white">
        AH
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-ink">Ackley Hartnett</span>
        <span className="block text-[11px] text-slate-400">Sales Portal</span>
      </span>
    </Link>
  );
}
