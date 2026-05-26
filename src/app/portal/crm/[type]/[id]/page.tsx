import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CrmTabs, SetupCard, TYPE_META, LifecycleBadge } from "@/components/crm/parts";
import { RecordForm } from "@/components/crm/RecordForm";
import {
  hubspotEnabled,
  getRecord,
  getRecordsByIds,
  displayName,
  PROPERTY_SETS,
  type HubObjectType,
  type HubRecord,
} from "@/lib/hubspot";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPES: HubObjectType[] = ["companies", "contacts", "deals"];

const ASSOCIATIONS: Record<HubObjectType, HubObjectType[]> = {
  companies: ["contacts", "deals"],
  contacts: ["companies", "deals"],
  deals: ["companies", "contacts"],
};

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!TYPES.includes(type as HubObjectType)) notFound();
  const t = type as HubObjectType;
  const meta = TYPE_META[t];

  if (!hubspotEnabled()) {
    return (
      <div>
        <CrmTabs active={t} />
        <SetupCard />
      </div>
    );
  }

  const record = await getRecord(t, id, ASSOCIATIONS[t]);

  // Resolve associated records (names) for the side panel.
  const assocBlocks: { type: HubObjectType; records: HubRecord[] }[] = [];
  for (const at of ASSOCIATIONS[t]) {
    const ids = record.associations?.[at]?.results?.map((r) => r.id) ?? [];
    if (ids.length) {
      const recs = await getRecordsByIds(at, ids.slice(0, 8));
      assocBlocks.push({ type: at, records: recs });
    }
  }

  const editable = t !== "deals";

  return (
    <div>
      <Link
        href={`/portal/crm/${t}`}
        className="mb-4 inline-flex items-center gap-1 pt-12 text-sm text-slate-500 hover:text-ink lg:pt-0"
      >
        <ArrowLeft size={15} /> {meta.label}
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{displayName(t, record)}</h1>
        {t !== "deals" && <LifecycleBadge value={record.properties.lifecyclestage} />}
      </div>
      <CrmTabs active={t} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {editable ? (
            <RecordForm type={t} record={record} cancelHref={`/portal/crm/${t}`} />
          ) : (
            <ReadOnlyProps type={t} record={record} />
          )}
        </div>

        <div className="space-y-6">
          {assocBlocks.map((block) => (
            <div key={block.type} className="card p-5">
              <h2 className="mb-3 font-semibold text-ink">{TYPE_META[block.type].label}</h2>
              <div className="divide-y divide-slate-100">
                {block.records.map((r) => (
                  <Link
                    key={r.id}
                    href={`/portal/crm/${block.type}/${r.id}`}
                    className="block py-2 text-sm text-ink hover:text-brand-700"
                  >
                    {displayName(block.type, r)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {assocBlocks.length === 0 && (
            <div className="card p-5 text-sm text-slate-400">No associated records.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyProps({ type, record }: { type: HubObjectType; record: HubRecord }) {
  return (
    <div className="card p-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        {PROPERTY_SETS[type].map((key) => {
          let value = record.properties[key] ?? "—";
          if (key === "amount" && record.properties.amount) {
            value = formatCurrency(Number(record.properties.amount));
          }
          return (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wide text-slate-400">{key}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
