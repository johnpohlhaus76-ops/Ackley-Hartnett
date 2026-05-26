import catalogJson from "@data/catalog.json";
import accountsJson from "@data/accounts.json";
import datasheetsJson from "@data/datasheets.json";
import type { Account, AccountsData, Catalog, CatalogItem, Datasheet } from "./types";

export const catalog = catalogJson as Catalog;
export const accountsData = accountsJson as unknown as AccountsData;
export const datasheets = datasheetsJson as Datasheet[];

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
  const countries = new Map<string, number>();
  const families = new Map<string, number>();
  for (const a of accounts) {
    for (const inst of a.installs) {
      if (inst.country) countries.set(inst.country, (countries.get(inst.country) ?? 0) + 1);
      if (inst.family) families.set(inst.family, (families.get(inst.family) ?? 0) + 1);
    }
  }
  const machines = allMachines();
  const catalogValue = machines.reduce((s, m) => s + (m.basePrice ?? 0), 0);

  return {
    accounts: accountsData.totals.accounts,
    contacts: accountsData.totals.totalContacts,
    installs: accountsData.totals.totalInstalls,
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
