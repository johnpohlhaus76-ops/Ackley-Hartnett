import Link from "next/link";
import { Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHeader, Stat } from "@/components/ui";
import { CrmTabs, SetupCard, TYPE_META, LifecycleBadge } from "@/components/crm/parts";
import { hubspotEnabled, getCounts, listRecords, displayName } from "@/lib/hubspot";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CrmOverviewPage() {
  if (!hubspotEnabled()) {
    return (
      <div>
        <PageHeader title="CRM" subtitle="Live HubSpot contacts, companies and deals." />
        <CrmTabs active="overview" />
        <SetupCard />
      </div>
    );
  }

  const [counts, companies, contacts] = await Promise.all([
    getCounts(),
    listRecords("companies", { limit: 6 }),
    listRecords("contacts", { limit: 6 }),
  ]);

  return (
    <div>
      <PageHeader
        title="CRM"
        subtitle="Live HubSpot contacts, companies and deals."
        action={
          <span className="badge bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={13} /> HubSpot connected
          </span>
        }
      />
      <CrmTabs active="overview" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Companies" value={counts.companies != null ? formatNumber(counts.companies) : "—"} />
        <Stat label="Contacts" value={counts.contacts != null ? formatNumber(counts.contacts) : "—"} />
        <Stat label="Deals" value={counts.deals != null ? formatNumber(counts.deals) : "—"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/portal/crm/companies/new" className="btn-primary">
          <Plus size={15} /> New company
        </Link>
        <Link href="/portal/crm/contacts/new" className="btn-ghost">
          <Plus size={15} /> New contact
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentCard
          title="Recent companies"
          type="companies"
          rows={companies.records.map((r) => ({
            id: r.id,
            primary: displayName("companies", r),
            secondary: [r.properties.city, r.properties.country].filter(Boolean).join(", "),
            lifecycle: r.properties.lifecyclestage,
          }))}
        />
        <RecentCard
          title="Recent contacts"
          type="contacts"
          rows={contacts.records.map((r) => ({
            id: r.id,
            primary: displayName("contacts", r),
            secondary: r.properties.jobtitle || r.properties.email || "",
            lifecycle: r.properties.lifecyclestage,
          }))}
        />
      </div>
    </div>
  );
}

function RecentCard({
  title,
  type,
  rows,
}: {
  title: string;
  type: "companies" | "contacts";
  rows: { id: string; primary: string; secondary: string; lifecycle: string | null }[];
}) {
  const Icon = TYPE_META[type].icon;
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-ink">{title}</h2>
        <Link href={`/portal/crm/${type}`} className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No records yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/portal/crm/${type}/${r.id}`}
              className="flex items-center gap-3 py-2.5 hover:bg-slate-50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{r.primary}</p>
                {r.secondary && <p className="truncate text-xs text-slate-400">{r.secondary}</p>}
              </div>
              <LifecycleBadge value={r.lifecycle} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
