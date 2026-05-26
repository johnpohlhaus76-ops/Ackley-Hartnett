import Link from "next/link";
import { Building2, Users, Handshake, LayoutGrid, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubObjectType } from "@/lib/hubspot";

export const TYPE_META: Record<
  HubObjectType,
  { label: string; singular: string; icon: typeof Building2 }
> = {
  companies: { label: "Companies", singular: "Company", icon: Building2 },
  contacts: { label: "Contacts", singular: "Contact", icon: Users },
  deals: { label: "Deals", singular: "Deal", icon: Handshake },
};

export function CrmTabs({ active }: { active: "overview" | HubObjectType }) {
  const tabs: { key: "overview" | HubObjectType; href: string; label: string; icon: typeof Building2 }[] = [
    { key: "overview", href: "/portal/crm", label: "Overview", icon: LayoutGrid },
    { key: "companies", href: "/portal/crm/companies", label: "Companies", icon: Building2 },
    { key: "contacts", href: "/portal/crm/contacts", label: "Contacts", icon: Users },
    { key: "deals", href: "/portal/crm/deals", label: "Deals", icon: Handshake },
  ];
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            "flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition",
            active === t.key
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-ink",
          )}
        >
          <t.icon size={16} /> {t.label}
        </Link>
      ))}
    </div>
  );
}

export function SetupCard() {
  return (
    <div className="card p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <PlugZap size={24} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-ink">Connect HubSpot</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            The live CRM reads and writes contacts, companies and deals directly in HubSpot. To
            enable it, create a HubSpot <strong>private app</strong> with CRM read/write scopes and
            add its token to your deployment.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-slate-600">
            <li>1. HubSpot → Settings → Integrations → <strong>Private Apps</strong> → Create.</li>
            <li>
              2. Add scopes: <code className="rounded bg-slate-100 px-1">crm.objects.companies</code>,{" "}
              <code className="rounded bg-slate-100 px-1">crm.objects.contacts</code>,{" "}
              <code className="rounded bg-slate-100 px-1">crm.objects.deals</code> (read &amp; write).
            </li>
            <li>
              3. Copy the access token into the{" "}
              <code className="rounded bg-slate-100 px-1">HUBSPOT_ACCESS_TOKEN</code> environment
              variable (Vercel → Settings → Environment Variables) and redeploy.
            </li>
          </ol>
          <p className="mt-4 text-xs text-slate-400">
            Until then, the read-only Accounts 360 view remains available under{" "}
            <Link href="/portal/accounts" className="text-brand-600 hover:underline">
              Accounts
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

const LIFECYCLE_STYLES: Record<string, string> = {
  customer: "bg-emerald-100 text-emerald-700",
  opportunity: "bg-blue-100 text-blue-700",
  salesqualifiedlead: "bg-indigo-100 text-indigo-700",
  marketingqualifiedlead: "bg-violet-100 text-violet-700",
  lead: "bg-amber-100 text-amber-700",
  subscriber: "bg-slate-100 text-slate-600",
  evangelist: "bg-pink-100 text-pink-700",
};

export function LifecycleBadge({ value }: { value: string | null }) {
  if (!value) return null;
  return (
    <span className={cn("badge", LIFECYCLE_STYLES[value] ?? "bg-slate-100 text-slate-600")}>
      {value}
    </span>
  );
}
