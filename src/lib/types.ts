export type Industry =
  | "Pharmaceutical"
  | "Confectionery"
  | "Battery & Energy"
  | "Distribution / MRO"
  | "Other";

export interface ChangePart {
  dimension: string;
  partNumber: string | null;
  price: number | null;
}

export interface CatalogItem {
  partNumber: string | null;
  name: string;
  detail: string | null;
  throughput: string | null;
  basePrice: number | null;
  priceNote: string | null;
  machineCrating: number | null;
  cpCrating: string | null;
  inspectionOption?: { partNumber: string | null; price: number | null };
  changeParts?: ChangePart[];
  kind: "machine" | "lineItem";
}

export interface CatalogCategory {
  name: string;
  slug: string;
  items: CatalogItem[];
}

export interface Catalog {
  currency: string;
  note: string;
  categories: CatalogCategory[];
}

export interface Contact {
  id: number;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  company: string | null;
  leadStatus: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
}

export interface Install {
  serial: string | null;
  customer: string | null;
  address: string | null;
  soNumber: string | number | null;
  customerPO: string | null;
  machine: string | null;
  product: string | null;
  shipped: string | null;
  country: string | null;
  family: string | null;
}

export interface Priority {
  companyName: string | null;
  externalId: string | number | null;
  level: string | null;
  score: number | null;
  customerType: string | null;
  region: string | null;
  industry: string | null;
  activityCount: number | null;
  activityValue: number | null;
  lastActivity: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface Account {
  id: string;
  name: string;
  domain: string | null;
  industry: Industry;
  country: string | null;
  state: string | null;
  city: string | null;
  phone: string | null;
  lifecycle: string | null;
  crmId: string | null;
  sources: ("crm" | "installed-base" | "priority")[];
  contacts: Contact[];
  installs: Install[];
  priority: Priority | null;
  coords: [number, number] | null;
  logos: string[];
  machineFamilies: string[];
  installCount: number;
  contactCount: number;
}

export interface AccountsData {
  totals: {
    accounts: number;
    withInstalls: number;
    withContacts: number;
    withPriority: number;
    totalContacts: number;
    totalInstalls: number;
  };
  byIndustry: Record<string, number>;
  accounts: Account[];
}

export interface Datasheet {
  slug: string;
  name: string;
  file: string;
  hero: string;
}
