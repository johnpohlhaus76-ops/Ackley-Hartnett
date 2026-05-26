import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Factory,
  Users,
  Tag,
  FileText,
  Wrench,
  Globe2,
} from "lucide-react";
import { accounts, getAccount, allMachines, datasheetForFamily } from "@/lib/data";
import { CompanyLogo, Empty } from "@/components/ui";
import { cn, INDUSTRY_STYLES, priorityStyle, formatCurrency, formatNumber } from "@/lib/utils";
import type { CatalogItem } from "@/lib/types";

export function generateStaticParams() {
  // Pre-render the accounts that actually carry machines or people.
  return accounts
    .filter((a) => a.installCount > 0 || a.contactCount > 0 || a.priority)
    .map((a) => ({ id: a.id }));
}

export const dynamicParams = true;

function suggestedChangeParts(families: string[]): CatalogItem[] {
  if (families.length === 0) return [];
  const machines = allMachines();
  const out: CatalogItem[] = [];
  for (const fam of families) {
    const key = fam.toLowerCase().split(" ")[0];
    const m = machines.find(
      (mm) => mm.name.toLowerCase().includes(key) && mm.changeParts?.length,
    );
    if (m && !out.includes(m)) out.push(m);
  }
  return out;
}

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = getAccount(id);
  if (!account) notFound();

  const changePartMachines = suggestedChangeParts(account.machineFamilies);

  return (
    <div>
      <Link href="/accounts" className="mb-4 inline-flex items-center gap-1 pt-12 text-sm text-slate-500 hover:text-ink lg:pt-0">
        <ArrowLeft size={15} /> Accounts
      </Link>

      {/* Header */}
      <div className="card mb-6 flex flex-wrap items-start gap-4 p-5">
        <CompanyLogo name={account.name} domain={account.domain} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">{account.name}</h1>
            <span className={cn("badge", INDUSTRY_STYLES[account.industry])}>{account.industry}</span>
            {account.priority?.level && (
              <span className={cn("badge", priorityStyle(account.priority.level))}>{account.priority.level}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {(account.city || account.state || account.country) && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {[account.city, account.state, account.country].filter(Boolean).join(", ")}
              </span>
            )}
            {account.domain && (
              <a href={`https://${account.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-600 hover:underline">
                <Globe2 size={14} /> {account.domain}
              </a>
            )}
            {account.phone && <span className="flex items-center gap-1"><Phone size={14} />{account.phone}</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {account.sources.map((s) => (
              <span key={s} className="badge bg-slate-100 text-slate-500">{s}</span>
            ))}
          </div>
        </div>
        <Link href={`/quote?account=${account.id}`} className="btn-primary">
          <FileText size={16} /> Build Quote
        </Link>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat icon={Users} label="People" value={account.contactCount} />
        <MiniStat icon={Factory} label="Machines" value={account.installCount} />
        <MiniStat icon={Tag} label="Logos / Products" value={account.logos.length} />
        <MiniStat
          icon={FileText}
          label="Priority Score"
          value={account.priority?.score != null ? formatNumber(account.priority.score) : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* People */}
        <section className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink"><Users size={17} /> People</h2>
          {account.contacts.length === 0 ? (
            <Empty>No contacts on file yet.</Empty>
          ) : (
            <div className="divide-y divide-slate-100">
              {account.contacts.map((c) => (
                <div key={c.id} className="flex items-start gap-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {(c.name ?? "?").split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                    {c.jobTitle && <p className="truncate text-xs text-slate-500">{c.jobTitle}</p>}
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-400">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-brand-600">
                          <Mail size={12} /> {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-brand-600">
                          <Phone size={12} /> {c.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  {c.leadStatus && <span className="badge bg-slate-100 text-slate-500">{c.leadStatus}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Installed machines */}
        <section className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink"><Factory size={17} /> Installed Machines</h2>
          {account.installs.length === 0 ? (
            <Empty>No installed machines recorded.</Empty>
          ) : (
            <div className="space-y-2.5">
              {account.installs.map((inst, i) => {
                const ds = datasheetForFamily(inst.family);
                return (
                  <div key={i} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{inst.machine ?? "Machine"}</p>
                        <p className="text-xs text-slate-400">
                          S/N {inst.serial ?? "—"}
                          {inst.shipped && ` · shipped ${inst.shipped}`}
                          {inst.country && ` · ${inst.country}`}
                        </p>
                      </div>
                      {ds && (
                        <Link href={`/datasheets`} className="badge bg-brand-50 text-brand-700">spec</Link>
                      )}
                    </div>
                    {inst.product && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                        <Tag size={12} /> Logo / product: <span className="font-medium text-slate-700">{inst.product}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Change parts opportunity */}
      {changePartMachines.length > 0 && (
        <section className="card mt-6 p-5">
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-ink"><Wrench size={17} /> Change-Part &amp; Upsell Opportunities</h2>
          <p className="mb-4 text-sm text-slate-500">
            Based on installed machine families — quotable change parts across product dimensions.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {changePartMachines.map((m) => (
              <div key={m.partNumber} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="mb-2 text-xs text-slate-400">{m.partNumber}</p>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {m.changeParts?.map((cp) => (
                      <tr key={cp.dimension}>
                        <td className="py-1.5 text-slate-600">{cp.dimension}</td>
                        <td className="py-1.5 text-right font-medium text-ink">{formatCurrency(cp.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link href={`/quote?account=${account.id}&machine=${encodeURIComponent(m.partNumber ?? "")}`} className="mt-3 inline-flex text-sm font-medium text-brand-600 hover:underline">
                  Quote these parts →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Logos / products printed */}
      {account.logos.length > 0 && (
        <section className="card mt-6 p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink"><Tag size={17} /> Logos &amp; Products Printed</h2>
          <div className="flex flex-wrap gap-2">
            {account.logos.map((l) => (
              <span key={l} className="badge bg-slate-100 text-slate-600">{l}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="stat-card !flex-row items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-xs text-slate-400">{label}</span>
        <span className="block text-lg font-bold text-ink">{value}</span>
      </span>
    </div>
  );
}
