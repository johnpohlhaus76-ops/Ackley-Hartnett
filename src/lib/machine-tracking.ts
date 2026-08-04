// Drug → Machine → Location → Capability tracking
// This tracks which machines at which locations have processed which drugs with which capabilities
import { readFileSync } from "fs";
import { join } from "path";

function loadAccounts() {
  try {
    const accountsPath = join(process.cwd(), "data", "accounts.json");
    const data = readFileSync(accountsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load accounts.json", error);
    return { accounts: [] };
  }
}

function loadQuotes() {
  try {
    const quotesPath = join(process.cwd(), "data", "quotes-2025.json");
    const data = readFileSync(quotesPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load quotes-2025.json", error);
    return [];
  }
}

function loadSerialNumbers() {
  try {
    const serialPath = join(process.cwd(), "data", "serial-numbers-drugs.json");
    const data = readFileSync(serialPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load serial-numbers-drugs.json", error);
    return [];
  }
}

function loadPrinterList() {
  try {
    const printerPath = join(process.cwd(), "data", "printers-serial-list.json");
    const data = readFileSync(printerPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load printers-serial-list.json", error);
    return [];
  }
}

function loadCustomerDatabase() {
  try {
    const customerPath = join(process.cwd(), "data", "customer-database.json");
    const data = readFileSync(customerPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load customer-database.json", error);
    return [];
  }
}

function loadProductionMachines() {
  try {
    const machinePath = join(process.cwd(), "data", "machines-production-clean.json");
    const data = readFileSync(machinePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load machines-production-clean.json", error);
    return [];
  }
}

function loadCrmContacts() {
  try {
    const crmPath = join(process.cwd(), "data", "crm-contacts.json");
    const data = readFileSync(crmPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load crm-contacts.json", error);
    return [];
  }
}

const accounts = loadAccounts();
const quotes = loadQuotes();
const serialNumbers = loadSerialNumbers();
const printerList = loadPrinterList();
const customerDatabase = loadCustomerDatabase();
const productionMachines = loadProductionMachines();
const crmContacts = loadCrmContacts();

export interface MachineCapability {
  print?: boolean;
  laserDrill?: boolean;
  laserMark?: boolean;
}

export interface MachineInstallation {
  locationId: string;
  locationName: string;
  country: string;
  city: string;
  machineName: string;
  machineFamily: string;
  product: string | null;
  installedDate: string;
  drugs: string[];
  capabilities: MachineCapability;
}

// Machine capability mappings based on machine family/type
export const machineCapabilities: Record<string, MachineCapability> = {
  "Servo Cantilever Ramp Printer": {
    print: true,
    laserDrill: true,
    laserMark: false,
  },
  "Servo Cantilever": {
    print: true,
    laserDrill: true,
    laserMark: false,
  },
  "Servo Variable Ramp Printer": {
    print: true,
    laserDrill: false,
    laserMark: false,
  },
  "Adjustable Angle Ramp Printer": {
    print: true,
    laserDrill: false,
    laserMark: false,
  },
  "Servo Drum Laser Drill": {
    print: false,
    laserDrill: true,
    laserMark: false,
  },
  "Laser Drill": {
    print: false,
    laserDrill: true,
    laserMark: false,
  },
  "Printer/Laser": {
    print: true,
    laserDrill: false,
    laserMark: true,
  },
};

// Extract drugs from product names
function extractDrugsFromProduct(product: string | null): string[] {
  if (!product) return [];
  const drugs: string[] = [];

  // Common pharmaceutical names to extract
  const patterns = [
    /(\w+(?:\s+\d+(?:\s*&\s*\d+)?\s*mg)?)/gi,
  ];

  product.split(/[,;\/]/).forEach((part) => {
    const cleaned = part.trim();
    if (cleaned && cleaned.length > 2 && !cleaned.toLowerCase().includes("base")) {
      drugs.push(cleaned);
    }
  });

  return drugs;
}

// Get all machine installations from real installed base
export function getAllMachineInstallations(): MachineInstallation[] {
  const installations: MachineInstallation[] = [];
  const typedAccounts = accounts as any;

  typedAccounts.accounts.forEach((account: any) => {
    account.installs.forEach((install: any) => {
      const familyKey = install.family || install.machine;
      const capabilities =
        machineCapabilities[familyKey] || {
          print: false,
          laserDrill: false,
          laserMark: false,
        };

      const drugs = extractDrugsFromProduct(install.product);

      installations.push({
        locationId: account.id,
        locationName: account.name,
        country: account.country,
        city: account.city || "",
        machineName: install.machine,
        machineFamily: install.family || "Unknown",
        product: install.product,
        installedDate: install.shipped,
        drugs,
        capabilities,
      });
    });
  });

  return installations;
}

export function getDrugsByLocation(locationId: string): string[] {
  const installations = getAllMachineInstallations();
  const drugs = new Set<string>();

  installations
    .filter((i) => i.locationId === locationId)
    .forEach((i) => {
      i.drugs.forEach((d) => drugs.add(d));
    });

  return Array.from(drugs);
}

export function getMachinesByDrug(drugName: string): MachineInstallation[] {
  const installations = getAllMachineInstallations();
  return installations.filter((i) =>
    i.drugs.some((d) => d.toLowerCase().includes(drugName.toLowerCase()))
  );
}

export function getMachinesByCapability(
  capability: keyof MachineCapability
): MachineInstallation[] {
  const installations = getAllMachineInstallations();
  return installations.filter((i) => i.capabilities[capability]);
}

export function getQuotesByCustomer(customerName: string): any[] {
  return quotes.filter(
    (q: any) =>
      q.Customer &&
      q.Customer.toString().toLowerCase().includes(customerName.toLowerCase())
  );
}

export function getQuotesByStatus(status: string): any[] {
  return quotes.filter((q: any) => q.Status === status);
}

export function getRecentQuotes(days: number = 90): any[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return quotes.filter((q: any) => {
    if (!q["Quote Date"]) return false;
    const quoteDate = new Date(q["Quote Date"]);
    return quoteDate >= cutoffDate;
  });
}

export function getMachinesByDrugName(drugName: string): any[] {
  return serialNumbers.filter(
    (s: any) =>
      s.Product &&
      s.Product.toLowerCase().includes(drugName.toLowerCase())
  );
}

export function getDrugsByCountry(country: string): any[] {
  return serialNumbers.filter(
    (s: any) =>
      s.Country &&
      s.Country.toLowerCase().includes(country.toLowerCase())
  );
}

export function getSerialsByCustomer(customerName: string): any[] {
  return serialNumbers.filter(
    (s: any) =>
      s.Customer &&
      s.Customer.toLowerCase().includes(customerName.toLowerCase())
  );
}

export function getAllUniqueDrugs(): string[] {
  const drugs = new Set<string>();
  serialNumbers.forEach((s: any) => {
    if (s.Product && s.Product.trim()) {
      drugs.add(s.Product);
    }
  });
  return Array.from(drugs).sort();
}

export function getAllCountries(): string[] {
  const countries = new Set<string>();
  serialNumbers.forEach((s: any) => {
    if (s.Country && s.Country.trim()) {
      countries.add(s.Country);
    }
  });
  return Array.from(countries).sort();
}

export function getPrintersByProduct(product: string): any[] {
  return printerList.filter(
    (p: any) =>
      p.Product &&
      p.Product.toLowerCase().includes(product.toLowerCase())
  );
}

export function getPrintersByCustomer(customer: string): any[] {
  return printerList.filter(
    (p: any) =>
      p.Customer &&
      p.Customer.toLowerCase().includes(customer.toLowerCase())
  );
}

export function getTopPrinterCustomers(limit: number = 10): any[] {
  const customerMap: Record<string, number> = {};
  printerList.forEach((p: any) => {
    if (p.Customer) {
      customerMap[p.Customer] = (customerMap[p.Customer] || 0) + 1;
    }
  });

  return Object.entries(customerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([customer, count]) => ({ customer, printerCount: count }));
}

export function getTopPrinterProducts(limit: number = 20): any[] {
  const productMap: Record<string, number> = {};
  printerList.forEach((p: any) => {
    if (p.Product) {
      productMap[p.Product] = (productMap[p.Product] || 0) + 1;
    }
  });

  return Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([product, count]) => ({ product, machineCount: count }));
}

export function getCustomerByName(customerName: string): any {
  return customerDatabase.find(
    (c: any) =>
      c.Company &&
      c.Company.toLowerCase().includes(customerName.toLowerCase())
  );
}

export function getCustomersByPriority(level: string): any[] {
  return customerDatabase.filter(
    (c: any) => c.Priority_Level === level
  );
}

export function getCustomersByIndustry(industry: string): any[] {
  return customerDatabase.filter(
    (c: any) =>
      c.Industry &&
      c.Industry.toLowerCase().includes(industry.toLowerCase())
  );
}

export function getTopCustomers(limit: number = 10): any[] {
  return [...customerDatabase]
    .sort((a: any, b: any) => (b.Activity_Value || 0) - (a.Activity_Value || 0))
    .slice(0, limit);
}

export function getCustomerStats(): any {
  const byPriority: Record<string, number> = {};
  const byIndustry: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  customerDatabase.forEach((c: any) => {
    if (c.Priority_Level) {
      byPriority[c.Priority_Level] = (byPriority[c.Priority_Level] || 0) + 1;
    }
    if (c.Industry) {
      byIndustry[c.Industry] = (byIndustry[c.Industry] || 0) + 1;
    }
    if (c.Country) {
      byCountry[c.Country] = (byCountry[c.Country] || 0) + 1;
    }
  });

  return {
    totalCustomers: customerDatabase.length,
    totalActivityValue: customerDatabase.reduce(
      (sum: number, c: any) => sum + (c.Activity_Value || 0),
      0
    ),
    byPriority,
    byIndustry,
    byCountry,
  };
}

export function getProductionMachinesByCustomer(customerName: string): any[] {
  return productionMachines.filter(
    (m: any) =>
      m.Customer &&
      m.Customer.toLowerCase().includes(customerName.toLowerCase())
  );
}

export function getProductionMachinesByType(machineType: string): any[] {
  return productionMachines.filter(
    (m: any) =>
      m.Description &&
      m.Description.toLowerCase().includes(machineType.toLowerCase())
  );
}

export function getProductionMachinesByCountry(country: string): any[] {
  return productionMachines.filter(
    (m: any) =>
      m.Country &&
      m.Country.toLowerCase().includes(country.toLowerCase())
  );
}

export function getTopMachineCustomers(limit: number = 10): any[] {
  const customerMap: Record<string, number> = {};
  productionMachines.forEach((m: any) => {
    if (m.Customer) {
      customerMap[m.Customer] = (customerMap[m.Customer] || 0) + 1;
    }
  });

  return Object.entries(customerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([customer, count]) => ({ customer, machineCount: count }));
}

export function getTopMachineTypes(limit: number = 15): any[] {
  const typeMap: Record<string, number> = {};
  productionMachines.forEach((m: any) => {
    if (m.Description) {
      typeMap[m.Description] = (typeMap[m.Description] || 0) + 1;
    }
  });

  return Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([type, count]) => ({ type, machineCount: count }));
}

export function getProductionMachineStats(): any {
  const byCountry: Record<string, number> = {};
  const byType: Record<string, number> = {};

  productionMachines.forEach((m: any) => {
    if (m.Country) {
      byCountry[m.Country] = (byCountry[m.Country] || 0) + 1;
    }
    if (m.Description) {
      byType[m.Description] = (byType[m.Description] || 0) + 1;
    }
  });

  return {
    totalProductionMachines: productionMachines.length,
    uniqueCustomers: new Set(productionMachines.map((m: any) => m.Customer)).size,
    uniqueCountries: Object.keys(byCountry).length,
    uniqueMachineTypes: Object.keys(byType).length,
    byCountry,
    byType,
  };
}

export function getContactsByCompany(companyId: string): any[] {
  return crmContacts.filter(
    (c: any) =>
      c.Company &&
      c.Company.toString().toLowerCase().includes(companyId.toString().toLowerCase())
  );
}

export function getContactsByPriority(level: string): any[] {
  return crmContacts.filter((c: any) => c.Priority_Level === level);
}

export function getCrmStats(): any {
  const byPriority: Record<string, number> = {};
  const byIndustry: Record<string, number> = {};
  const companies = new Set<string>();

  crmContacts.forEach((c: any) => {
    if (c.Company) companies.add(c.Company.toString());
    if (c.Priority_Level) {
      byPriority[c.Priority_Level] = (byPriority[c.Priority_Level] || 0) + 1;
    }
    if (c.Industry) {
      byIndustry[c.Industry] = (byIndustry[c.Industry] || 0) + 1;
    }
  });

  return {
    totalContacts: crmContacts.length,
    totalCompanies: companies.size,
    avgContactsPerCompany: (crmContacts.length / companies.size).toFixed(1),
    byPriority,
    byIndustry,
  };
}
