import { accounts } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { AccountsExplorer, type SlimAccount } from "@/components/AccountsExplorer";

export default function ProspectsPage() {
  // Prospects = pharma/confectionery accounts with contacts but no installed machines
  const prospects: SlimAccount[] = accounts
    .filter((a) =>
      ["Pharmaceutical", "Confectionery", "Other"].includes(a.industry) &&
      a.contactCount > 0 &&
      a.installCount === 0
    )
    .map((a) => ({
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
        title="Prospects"
        subtitle={`${prospects.length} pharma & confectionery accounts with contacts — no machines installed yet. These are your conversion targets.`}
      />
      <AccountsExplorer accounts={prospects} />
    </div>
  );
}
