import catalogJson from "@data/catalog.json";
import accountsJson from "@data/accounts.json";
import datasheetsJson from "@data/datasheets.json";
import installsJson from "@data/installs.json";
import type { Account, AccountsData, Catalog, CatalogItem, Datasheet } from "./types";

export const catalog = catalogJson as Catalog;
export const accountsData = accountsJson as unknown as AccountsData;
export const datasheets = datasheetsJson as Datasheet[];

/** Authoritative installed-base dataset (single source of truth for machine counts). */
export interface InstalledMachine {
  serial: string;
  customer: string;
  description: string;
  country: string;
  shipped: string;
  soNumber: string;
  customerPO: string;
  address: string;
}

export const installedMachines: InstalledMachine[] =
  (installsJson as { machines: InstalledMachine[] }).machines;

/** Canonicalize country spellings so counts/charts don't double-count variants. */
function normalizeCountry(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (t.toUpperCase().startsWith("USA")) return "USA";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Normalize a price-list machine description into a coarse product family. */
function machineFamily(desc: string | null | undefined): string {
  const s = (desc ?? "").trim().toLowerCase();
  if (!s) return "Unspecified";
  if (s.includes("aarp") || s.includes("adjustable angle") || s.includes("adjustable f/b"))
    return "Adjustable Angle Ramp Printer";
  if (s.includes("farp") || s.includes("fixed angle") || s.includes("frp") || /\bdeg/.test(s))
    return "Fixed Angle Ramp Printer";
  if (
    s.includes("cantilever") || s.includes("ctlvr") || s.includes("ctlv") ||
    /^cr\d/.test(s) || s.startsWith("cant") || s.startsWith("servo cr")
  )
    return "Servo Cantilever Ramp Printer";
  if (/^cd\d/.test(s)) return "Cantilever Drum Printer";
  if (s.includes("spin")) return "SPIN Printer";
  if (s.startsWith("fb") || s.includes("flat bed") || s.includes("slab gum"))
    return "Flat-Bed / Gum Printer";
  if (s.includes("vip") && (s.includes("laser") || s.includes("drill")))
    return "VIP Laser Drill & Inspect";
  if (s.includes("vip")) return "VIP Printer";
  if (s.includes("drum") && (s.includes("laser") || s.includes("drill")))
    return "Servo Drum Laser Drill";
  if (s.includes("drum") || /^\d?\s?dp\d?/.test(s)) return "Servo Drum Two-Side Printer";
  if (s.includes("laser drill") || (s.includes("laser") && s.includes("drill")))
    return "Laser Drill";
  if (s.includes("ramp") || s.includes("v/r") || s.includes("servo ramp") || s.includes("vision") || s.includes("servo v"))
    return "Servo Variable Ramp Printer";
  if (s.includes("laser") || s.includes("uv")) return "Laser / UV Marking";
  if (s.includes("inkjet")) return "Inkjet Printer";
  if (s.startsWith("gp")) return "Gum Printer";
  if (s.startsWith("b/e") || s.startsWith("be") || s.startsWith("ic") || s.includes("stamping") || s.includes("cip"))
    return "Components / Accessories";
  return "Other / Specialty";
}

export const accounts: Account[] = accountsData.accounts;

export function getAccount(id: string): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export function allMachines(): CatalogItem[] {
  return catalog.categories.flatMap((c) => c.items).filter((i) => i.kind === "machine");
}

export function findCatalogItem(partNumber: string): CatalogItem | undefined {
  return catalog.categories
    .flatMap((c) => c.items)
    .find((i) => i.partNumber === partNumber);
}

/** Datasheet whose product name loosely matches an installed-machine family. */
export function datasheetForFamily(family: string | null): Datasheet | undefined {
  if (!family) return undefined;
  const f = family.toLowerCase();
  return datasheets.find(
    (d) => f.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(f.split(" ")[0]),
  );
}

export interface PortalStats {
  accounts: number;
  contacts: number;
  installs: number;
  countries: number;
  machineCatalog: number;
  catalogValue: number;
  byIndustry: Record<string, number>;
  byCountry: { country: string; count: number }[];
  byMachineFamily: { family: string; count: number }[];
  topPriority: Account[];
}

export function portalStats(): PortalStats {
  // Installed-base figures are derived from the authoritative installs dataset
  // (installedMachines) so every count matches the Installed Base page.
  const countries = new Map<string, number>();
  const families = new Map<string, number>();
  for (const inst of installedMachines) {
    const country = normalizeCountry(inst.country);
    if (country) countries.set(country, (countries.get(country) ?? 0) + 1);
    const family = machineFamily(inst.description);
    families.set(family, (families.get(family) ?? 0) + 1);
  }
  const machines = allMachines();
  const catalogValue = machines.reduce((s, m) => s + (m.basePrice ?? 0), 0);

  return {
    accounts: accountsData.totals.accounts,
    contacts: accountsData.totals.totalContacts,
    installs: installedMachines.length,
    countries: countries.size,
    machineCatalog: machines.length,
    catalogValue,
    byIndustry: accountsData.byIndustry,
    byCountry: [...countries.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    byMachineFamily: [...families.entries()]
      .map(([family, count]) => ({ family, count }))
      .sort((a, b) => b.count - a.count),
    topPriority: accounts
      .filter((a) => a.priority?.score)
      .sort((a, b) => (b.priority!.score ?? 0) - (a.priority!.score ?? 0))
      .slice(0, 8),
  };
}
