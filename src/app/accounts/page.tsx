import { accounts } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { AccountsExplorer, type SlimAccount } from "@/components/AccountsExplorer";

export default function AccountsPage() {
  const slim: SlimAccount[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    domain: a.domain,
    industry: a.industry,
    country: a.country,
    contactCount: a.contactCount,
    installCount: a.installCount,
    machineFamilies: a.machineFamilies,
    priorityLevel: a.priority?.level ?? null,
    priorityScore: a.priority?.score ?? null,
    sources: a.sources,
  }));

  return (
    <div>
      <PageHeader
        title="Accounts 360"
        subtitle="Every account unifies its people, installed machines, change parts and priority — one screen per plant."
      />
      <AccountsExplorer accounts={slim} />
    </div>
  );
}
