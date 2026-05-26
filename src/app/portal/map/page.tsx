import { accounts } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { SiteMap, type MapSite } from "@/components/SiteMap";

export default function MapPage() {
  const sites: MapSite[] = accounts
    .filter((a) => a.coords)
    .map((a) => ({
      id: a.id,
      name: a.name,
      industry: a.industry,
      country: a.country,
      coords: a.coords as [number, number],
      contactCount: a.contactCount,
      installCount: a.installCount,
      machineFamilies: a.machineFamilies,
      logos: a.logos.slice(0, 12),
      people: a.contacts.slice(0, 6).map((c) => ({ name: c.name, jobTitle: c.jobTitle })),
      machines: a.installs.slice(0, 8).map((m) => ({ machine: m.machine, product: m.product })),
    }));

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;

  return (
    <div>
      <PageHeader
        title="Global Site Map"
        subtitle={`${sites.length} located sites — plotting installed machines, people, change parts and product logos worldwide.`}
      />
      <SiteMap sites={sites} apiKey={apiKey} />
    </div>
  );
}
