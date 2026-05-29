import { accounts } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { TerritoryPlanner, type TripAccount } from "@/components/TerritoryPlanner";

export default function TerritoryPage() {
  const tripAccounts: TripAccount[] = accounts
    .filter((a) =>
      a.coords &&
      ["Pharmaceutical", "Confectionery"].includes(a.industry)
    )
    .map((a) => ({
      id: a.id,
      name: a.name,
      industry: a.industry,
      city: a.city ?? null,
      state: a.state ?? null,
      country: a.country ?? null,
      coords: a.coords as [number, number],
      installCount: a.installCount,
      contactCount: a.contactCount,
      isProspect: a.installCount === 0,
    }));

  return (
    <div>
      <PageHeader
        title="Territory Planner"
        subtitle="Plan North American field trips — select accounts, find nearby airports, estimate drive times, and build your route."
      />
      <TerritoryPlanner accounts={tripAccounts} />
    </div>
  );
}
