import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Search, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { CrmTabs, SetupCard, TYPE_META, LifecycleBadge } from "@/components/crm/parts";
import {
  hubspotEnabled,
  listRecords,
  searchRecords,
  displayName,
  type HubObjectType,
  type HubRecord,
} from "@/lib/hubspot";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPES: HubObjectType[] = ["companies", "contacts", "deals"];

export default async function CrmListPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ q?: string; after?: string }>;
}) {
  const { type } = await params;
  if (!TYPES.includes(type as HubObjectType)) notFound();
  const t = type as HubObjectType;
  const { q, after } = await searchParams;
  const meta = TYPE_META[t];

  if (!hubspotEnabled()) {
    return (
      <div>
        <PageHeader title="CRM" subtitle="Live HubSpot records." />
        <CrmTabs active={t} />
        <SetupCard />
      </div>
    );
  }

  let records: HubRecord[] = [];
  let next: string | null = null;
  if (q && q.trim()) {
    records = await searchRecords(t, q.trim(), 50);
  } else {
    const res = await listRecords(t, { limit: 25, after });
    records = res.records;
    next = res.next;
  }

  return (
    <div>
      <PageHeader
        title="CRM"
        subtitle="Live HubSpot records."
        action={
          t !== "deals" ? (
            <Link href={`/portal/crm/${t}/new`} className="btn-primary">
              <Plus size={15} /> New {meta.singular.toLowerCase()}
            </Link>
          ) : undefined
        }
      />
      <CrmTabs active={t} />

      <form className="mb-4 flex gap-2" action={`/portal/crm/${t}`} method="get">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={`Search ${meta.label.toLowerCase()}…`}
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-ghost">Search</button>
        {q && (
          <Link href={`/portal/crm/${t}`} className="btn-ghost">
            Clear
          </Link>
        )}
      </form>

      <div className="card overflow-hidden">
        {records.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">
            {q ? `No ${meta.label.toLowerCase()} match “${q}”.` : `No ${meta.label.toLowerCase()} yet.`}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">{meta.singular}</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Detail</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <Row key={r.id} type={t} record={r} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {next && !q && (
        <div className="mt-4 flex justify-center">
          <Link href={`/portal/crm/${t}?after=${next}`} className="btn-ghost">
            Next page <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ type, record }: { type: HubObjectType; record: HubRecord }) {
  const p = record.properties;
  let detail = "";
  if (type === "companies") detail = [p.city, p.country].filter(Boolean).join(", ") || p.domain || "";
  else if (type === "contacts") detail = p.jobtitle || p.email || "";
  else detail = p.amount ? formatCurrency(Number(p.amount)) : "";

  const status =
    type === "deals" ? p.dealstage : p.lifecyclestage;

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link href={`/portal/crm/${type}/${record.id}`} className="font-medium text-ink hover:text-brand-700">
          {displayName(type, record)}
        </Link>
      </td>
      <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{detail || "—"}</td>
      <td className="px-4 py-3">
        {type === "deals" ? (
          status ? <span className="badge bg-slate-100 text-slate-600">{status}</span> : "—"
        ) : (
          <LifecycleBadge value={status} />
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/portal/crm/${type}/${record.id}`} className="text-sm text-brand-600 hover:underline">
          Open
        </Link>
      </td>
    </tr>
  );
}
