import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CrmTabs, SetupCard, TYPE_META } from "@/components/crm/parts";
import { RecordForm } from "@/components/crm/RecordForm";
import { hubspotEnabled, type HubObjectType } from "@/lib/hubspot";

export const dynamic = "force-dynamic";

const CREATABLE: HubObjectType[] = ["companies", "contacts"];

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!CREATABLE.includes(type as HubObjectType)) notFound();
  const t = type as HubObjectType;
  const meta = TYPE_META[t];

  return (
    <div>
      <Link
        href={`/portal/crm/${t}`}
        className="mb-4 inline-flex items-center gap-1 pt-12 text-sm text-slate-500 hover:text-ink lg:pt-0"
      >
        <ArrowLeft size={15} /> {meta.label}
      </Link>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-ink">New {meta.singular.toLowerCase()}</h1>
      <p className="mb-6 text-sm text-slate-500">Creates a record directly in HubSpot.</p>
      <CrmTabs active={t} />
      {hubspotEnabled() ? (
        <RecordForm type={t} cancelHref={`/portal/crm/${t}`} />
      ) : (
        <SetupCard />
      )}
    </div>
  );
}
