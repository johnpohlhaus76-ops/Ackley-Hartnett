import Link from "next/link";
import { ArrowRight, Building2, Users, Factory, Globe2, FileText, Boxes } from "lucide-react";
import { portalStats, accounts } from "@/lib/data";
import { PageHeader, Stat, Bar, CompanyLogo } from "@/components/ui";
import { formatCurrency, formatNumber, INDUSTRY_STYLES, priorityStyle } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const s = portalStats();
  const maxCountry = s.byCountry[0]?.count ?? 1;
  const maxFamily = s.byMachineFamily[0]?.count ?? 1;
  const industryMax = Math.max(...Object.values(s.byIndustry));

  return (
    <div>
      <PageHeader
        title="Sales Operations Dashboard"
        subtitle="Global view of accounts, installed base, pipeline targets and equipment catalog."
        action={
          <Link href="/portal/quote" className="btn-primary">
            <FileText size={16} /> New Quote
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Accounts" value={formatNumber(s.accounts)} hint="CRM + installed base" />
        <Stat label="Contacts" value={formatNumber(s.contacts)} hint="Decision makers" />
        <Stat label="Installed Machines" value={formatNumber(s.installs)} hint="Lifetime" />
        <Stat label="Countries" value={formatNumber(s.countries)} hint="Installed footprint" />
        <Stat label="Catalog Models" value={formatNumber(s.machineCatalog)} hint="Quotable machines" />
        <Stat
          label="Catalog Value"
          value={formatCurrency(s.catalogValue, { compact: true })}
          hint="Sum of base prices"
          accent="text-brand-700"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Priority targets */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Priority Targets</h2>
            <Link href="/portal/accounts" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
              All accounts <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {s.topPriority.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="flex items-center gap-3 py-2.5 hover:bg-slate-50"
              >
                <CompanyLogo name={a.name} domain={a.domain} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {[a.priority?.region, a.priority?.customerType].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{a.contactCount}p · {a.installCount}m</span>
                </div>
                <span className={cn("badge", priorityStyle(a.priority?.level))}>
                  {a.priority?.level?.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Industry mix */}
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-ink">Accounts by Industry</h2>
          <div className="space-y-2">
            {Object.entries(s.byIndustry).map(([ind, count]) => (
              <div key={ind} className="flex items-center gap-2">
                <span className={cn("badge w-36 justify-center", INDUSTRY_STYLES[ind as keyof typeof INDUSTRY_STYLES] ?? "bg-slate-100 text-slate-600")}>
                  {ind}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / industryMax) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-medium text-slate-500">{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <QuickLink href="/portal/map" icon={Globe2} label="Map" />
            <QuickLink href="/portal/catalog" icon={Boxes} label="Catalog" />
            <QuickLink href="/portal/accounts" icon={Building2} label="Accounts" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-ink">Installed Base by Country</h2>
          <div>
            {s.byCountry.slice(0, 10).map((c) => (
              <Bar key={c.country} label={c.country} value={c.count} max={maxCountry} />
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-ink">Installed Machines by Family</h2>
          <div>
            {s.byMachineFamily.slice(0, 10).map((f) => (
              <Bar key={f.family} label={f.family} value={f.count} max={maxFamily} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Globe2;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 py-3 text-xs font-medium text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
