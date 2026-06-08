import { catalog, datasheets } from "./data";
import type { CatalogItem } from "./types";

export type MachineCategorySlug =
  | "ink-printing"
  | "laser-marking"
  | "laser-drilling"
  | "inspection"
  | "cleaning-safety"
  | "rd-lab";

export interface CategoryMeta {
  slug: MachineCategorySlug;
  name: string;
  tagline: string;
  description: string;
  icon: string; // lucide-react icon name
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "ink-printing",
    name: "Ink Printing",
    tagline: "Pharmaceutical-grade rotogravure",
    description:
      "Edible-ink rotogravure printing of logos, dosage strength and identifiers onto tablets, capsules, softgels and LCTs — one or two-sided, with optional inline print-quality vision.",
    icon: "Stamp",
  },
  {
    slug: "laser-marking",
    name: "Laser Marking",
    tagline: "Inkless, permanent identification",
    description:
      "CO2 and 355nm UV laser marking creates permanent, tamper-evident identification with zero consumable ink — the cleanest, most counterfeit-resistant way to brand a dose.",
    icon: "Zap",
  },
  {
    slug: "laser-drilling",
    name: "Laser Drilling",
    tagline: "Precision modified-release",
    description:
      "10.6µm CO2 laser drilling of controlled-orifice delivery systems and osmotic tablets, with closed-loop hole-depth inspection for validated, repeatable release profiles.",
    icon: "Crosshair",
  },
  {
    slug: "inspection",
    name: "Inspection & Quality",
    tagline: "100% inline verification",
    description:
      "Vision and laser-depth inspection systems that verify every dose — print quality, drilled-hole geometry and defect rejection — for documented efficacy and zero-defect release.",
    icon: "ScanLine",
  },
  {
    slug: "cleaning-safety",
    name: "Cleaning & Safety",
    tagline: "Containment & changeover",
    description:
      "Automated roll cleaning with hazardous-fume control and safety-switch integration — protecting operators and slashing changeover time between high-potency products.",
    icon: "ShieldCheck",
  },
  {
    slug: "rd-lab",
    name: "R&D & Lab Scale",
    tagline: "From bench to validated line",
    description:
      "Manual-feed lab systems for formulation development, logo proofing and small-batch trials — the same process physics as production, scaled for the lab.",
    icon: "FlaskConical",
  },
];

export interface Product {
  slug: string;
  name: string;
  category: MachineCategorySlug;
  tagline: string;
  blurb: string;
  throughput: string;
  technology: string;
  sides: string;
  feed: string;
  inspection: boolean;
  datasheet: string | null;
  video?: string;
  highlights: string[];
  featured?: boolean;
}

export const GMP_PILLARS = [
  {
    icon: "ShieldCheck",
    title: "Safety",
    text: "Containment, hazardous-fume control and integrated safety interlocks protect operators handling high-potency compounds.",
  },
  {
    icon: "Target",
    title: "Efficacy",
    text: "Closed-loop laser drilling and hole-depth inspection guarantee the precise orifice geometry that controlled-release dosing depends on.",
  },
  {
    icon: "Sparkles",
    title: "Cleanliness",
    text: "Inkless laser processes and automated roll cleaning eliminate consumables and cross-contamination between products.",
  },
  {
    icon: "FileCheck2",
    title: "GMP & Validation",
    text: "IQ/OQ documentation, design qualification and OPC-UA data integration come standard — built for 21 CFR Part 11 environments.",
  },
] as const;

/* ------------------------------------------------------------------ *
 * Build the full machine lineup from the price list (source of truth),
 * de-duplicated, with derived specs and datasheet links where they exist.
 * ------------------------------------------------------------------ */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatThroughput(raw: string | null): string {
  if (!raw) return "On request";
  const s = String(raw).replace(/\s+/g, " ").trim();
  if (/^\d+$/.test(s)) return `${Number(s).toLocaleString("en-US")} PPH`;
  return s.replace(/approx\./i, "~").replace(/manual feed/i, "· manual feed");
}

function isLabScale(name: string): boolean {
  return /lab\s*scale|lab\s+laser/i.test(name);
}

function mapCategory(catalogSlug: string, name: string): MachineCategorySlug | null {
  if (isLabScale(name)) return "rd-lab";
  if (catalogSlug.startsWith("offset-rotogravure")) return "ink-printing";
  if (catalogSlug.startsWith("laser-drilling")) return "laser-drilling";
  if (catalogSlug.startsWith("laser-marking")) return "laser-marking";
  return null;
}

function inferSides(name: string): string {
  const n = name.toLowerCase();
  if (/two[\s-]?side/.test(n)) return "Two-Sided";
  if (/one[\s-]?side/.test(n)) return "One-Sided";
  return "—";
}

function inferTechnology(category: MachineCategorySlug, name: string): string {
  const n = name.toLowerCase();
  if (category === "ink-printing") return n.includes("ibm") ? "Flatbed ink" : "Rotogravure ink";
  if (n.includes("combo")) return "CO2 + UV laser + ink";
  const isUV = /\buv\b/.test(n);
  const isDrill = n.includes("drill");
  if (isDrill) return isUV ? "UV laser drilling" : "10.6µm CO2 laser drilling";
  return isUV ? "355nm UV laser" : "CO2 laser";
}

const CATEGORY_NOUN: Record<MachineCategorySlug, string> = {
  "ink-printing": "rotogravure ink-printing",
  "laser-marking": "laser-marking",
  "laser-drilling": "laser-drilling",
  inspection: "inspection",
  "cleaning-safety": "cleaning",
  "rd-lab": "lab-scale",
};

function generateBlurb(p: {
  name: string;
  category: MachineCategorySlug;
  throughput: string;
  sides: string;
  inspection: boolean;
}): string {
  const noun = CATEGORY_NOUN[p.category];
  const tp =
    p.throughput && p.throughput !== "On request" ? ` running at up to ${p.throughput}` : "";
  const parts = [
    `The ${p.name} is a ${noun} system for pharmaceutical tablets, capsules, softgels and LCTs${tp}.`,
  ];
  if (p.sides !== "—") parts.push(`${p.sides} processing.`);
  if (p.inspection) parts.push("Includes inline print-quality and defect inspection.");
  return parts.join(" ");
}

function generateHighlights(p: {
  technology: string;
  throughput: string;
  sides: string;
  inspection: boolean;
}): string[] {
  const h: string[] = [];
  if (p.sides === "Two-Sided") h.push("Two-sided in one pass");
  else if (p.sides === "One-Sided") h.push("Single-sided processing");
  if (p.inspection) h.push("Inline vision inspection");
  h.push(p.technology);
  if (/PPH/.test(p.throughput)) h.push(`Up to ${p.throughput}`);
  return Array.from(new Set(h)).slice(0, 4);
}

/** Curated copy / datasheet / video / featured overrides, keyed by exact price-list name. */
interface Override {
  datasheet?: string;
  video?: string;
  featured?: boolean;
  tagline?: string;
  blurb?: string;
  feed?: string;
}

const OVERRIDES: Record<string, Override> = {
  "Adjustable Angle Ramp Feed Printer": {
    datasheet: "/datasheets/adjustable-angle-ramp.pdf",
    featured: true,
    tagline: "The highest-throughput printer we build",
    feed: "Multi-Lane Pocket Carrier Bar",
    blurb:
      "An adjustable ramp-feed rotogravure printer that orients and prints at extraordinary speed — the workhorse for the world's largest confectionery and pharmaceutical lines, at up to 1.2 million pieces per hour.",
  },
  "VIP-6S Printer": {
    datasheet: "/datasheets/vip-ink-printer.pdf",
    video: "/media/vip-printer.mp4",
    featured: true,
    feed: "Single-Lane Carrier Link",
    tagline: "Versatile single-lane production printer",
    blurb:
      "The VIP platform brings high-uptime rotogravure printing to mid-volume lines with fast format changeover and an intuitive HMI built for GMP environments.",
  },
  "Servo Drum Two-Side Laser Drilling System": {
    datasheet: "/datasheets/servo-drum-laser-drill.pdf",
    featured: true,
    feed: "Multi-Lane Pocket Drum",
    tagline: "Multi-lane high-speed controlled-orifice drilling",
    blurb:
      "A servo-driven, multi-lane pocket-drum laser drilling system that scales controlled-orifice production with validated, repeatable hole geometry — one or two-sided.",
  },
  "Delta Two Side Combo Laser Writer and Ink Printer": {
    featured: true,
    tagline: "Laser marking and ink printing in one platform",
    blurb:
      "A combination Delta platform that pairs CO2/UV laser writing with rotogravure ink printing in a single two-sided machine — maximum identification flexibility on one footprint.",
  },
  "Variable Ramp CO2 Laser Marking System": {
    featured: true,
    tagline: "High-speed inkless marking",
    blurb:
      "A high-throughput variable-ramp CO2 laser marking system that permanently identifies tablets and capsules with zero ink or solvents — at up to 400,000 pieces per hour.",
  },
  "Servo Variable Ramp Printer with Print Quality Inspection": {
    featured: true,
    tagline: "High-volume printing with inline vision",
    blurb:
      "A servo variable-ramp rotogravure printer with integrated print-quality inspection — pairing very high throughput with 100% inline verification and automatic defect rejection.",
  },
  // Datasheet links for machines that map to existing collateral
  "Delta Ink Printer": { datasheet: "/datasheets/delta-ink.pdf", feed: "Single-Lane Carrier Link" },
  "Delta Ink Printer with Two Side Print Quality Inspection": {
    datasheet: "/datasheets/delta-ink.pdf",
  },
  "VIP-X Printer with One-Side Print Quality Inspection": {
    datasheet: "/datasheets/vip-ink-printer.pdf",
  },
  "VIP-X Printer with Two-Side Print Quality Inspection": {
    datasheet: "/datasheets/vip-ink-printer.pdf",
  },
  "Servo Cantilever Ramp Printer": { datasheet: "/datasheets/cantilever-ink.pdf" },
  "Servo Cantilever Ramp Printer with Print Quality Inspection": {
    datasheet: "/datasheets/cantilever-ink.pdf",
  },
  "IBM Ink Printing Machine with One Side Print Quality Inspection": {
    datasheet: "/datasheets/ibm-ink-printer.pdf",
  },
  "VIP Two-Side Laser Drilling System": { datasheet: "/datasheets/vip-laser-drill.pdf" },
  "Delta Two Side CO2 Laser Writer": { datasheet: "/datasheets/delta-co2.pdf" },
  "Delta Two Side UV laser Writer": { datasheet: "/datasheets/delta-uv.pdf" },
  "IBM Co2 Laser marker": { datasheet: "/datasheets/ibm-co2-laser.pdf" },
  "VIP One-Side UV Laser Marking System": { datasheet: "/datasheets/vip-uv-laser.pdf" },
  "VIP Two-Side UV Laser Marking System": { datasheet: "/datasheets/vip-uv-laser.pdf" },
  "R&D Lab Scale Laser Drilling System": { datasheet: "/datasheets/rd-laser-drill.pdf" },
};

/** Datasheet-only products with no price-list entry of their own. */
const EXTRA_PRODUCTS: Product[] = [
  {
    slug: "ldi-system",
    name: "LDI Hole-Depth Inspection",
    category: "inspection",
    tagline: "Closed-loop drill verification",
    blurb:
      "Laser Drill Inspection measures drilled hole depth on every tablet, closing the loop on controlled-release efficacy and providing documented quality evidence.",
    throughput: "Inline / manual feed",
    technology: "Laser depth metrology",
    sides: "—",
    feed: "Manual Feed",
    inspection: true,
    datasheet: "/datasheets/ldi-system.pdf",
    highlights: ["Per-dose hole-depth data", "Efficacy assurance", "Audit-ready records"],
    featured: true,
  },
  {
    slug: "arc-roll-cleaning",
    name: "ARC Automated Roll Cleaning",
    category: "cleaning-safety",
    tagline: "Operator safety + fast changeover",
    blurb:
      "The ARC system automates design-roll cleaning with hazardous-fume control, safety-switch integration and programmable cycles — protecting operators and accelerating product changeover.",
    throughput: "Programmable cycles",
    technology: "Automated cleaning + fume control",
    sides: "—",
    feed: "Networked machine control",
    inspection: false,
    datasheet: "/datasheets/arc-roll-cleaning.pdf",
    highlights: ["Hazardous-fume control", "Safety-switch integration", "Programmable cleaning"],
    featured: true,
  },
];

function buildProducts(): Product[] {
  const out: Product[] = [];
  const seen = new Set<string>();

  for (const cat of catalog.categories) {
    for (const item of cat.items as CatalogItem[]) {
      if (item.kind !== "machine") continue;
      const category = mapCategory(cat.slug, item.name);
      if (!category) continue;

      const inspection =
        cat.slug.includes("with-vision-inspection") || /inspection/i.test(item.name);

      // Disambiguate inspection variants whose name doesn't already say so.
      const displayName =
        inspection && !/inspection/i.test(item.name)
          ? `${item.name} (Vision Inspection)`
          : item.name;

      const slug = slugify(displayName);
      if (seen.has(slug)) continue; // drop exact duplicates
      seen.add(slug);

      const sides = inferSides(item.name);
      const technology = inferTechnology(category, item.name);
      const throughput = formatThroughput(item.throughput);
      const ov = OVERRIDES[item.name] ?? {};

      const base = { name: displayName, category, throughput, sides, inspection };

      out.push({
        slug,
        name: displayName,
        category,
        tagline: ov.tagline ?? `${technology}${sides !== "—" ? ` · ${sides}` : ""}`,
        blurb: ov.blurb ?? generateBlurb(base),
        throughput,
        technology,
        sides,
        feed: ov.feed ?? "Configurable feed",
        inspection,
        datasheet: ov.datasheet ?? null,
        video: ov.video,
        highlights: generateHighlights({ technology, throughput, sides, inspection }),
        featured: ov.featured,
      });
    }
  }

  return [...out, ...EXTRA_PRODUCTS];
}

export const PRODUCTS: Product[] = buildProducts();

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsByCategory(slug: MachineCategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function featuredProducts(): Product[] {
  const featured = PRODUCTS.filter((p) => p.featured);
  return featured.slice(0, 6);
}

export function getCategory(slug: MachineCategorySlug): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function datasheetsWithProducts() {
  return datasheets.map((d) => ({ datasheet: d, product: getProduct(d.slug) }));
}
