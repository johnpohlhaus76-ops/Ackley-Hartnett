import { datasheets, allMachines } from "./data";

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
  datasheet: string;
  video?: string;
  highlights: string[];
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "delta-ink",
    name: "Delta Printer",
    category: "ink-printing",
    tagline: "Single-lane two-sided ink printing",
    blurb:
      "A compact, validation-ready rotogravure printer for tablets, capsules, softgels and LCTs. Single-lane carrier-link feed delivers gentle, oriented handling for crisp one or two-sided printing.",
    throughput: "70,000 PPH",
    technology: "Rotogravure edible ink",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/delta-ink.pdf",
    highlights: ["Two-sided in a single pass", "Gentle carrier-link transport", "Quick-change design rolls"],
    featured: true,
  },
  {
    slug: "vip-ink-printer",
    name: "VIP Printer",
    category: "ink-printing",
    tagline: "Versatile single-lane production printer",
    blurb:
      "The VIP platform brings high-uptime rotogravure printing to mid-volume lines with fast format changeover and an intuitive HMI built for GMP environments.",
    throughput: "60,000 PPH",
    technology: "Rotogravure edible ink",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/vip-ink-printer.pdf",
    video: "/media/vip-printer.mp4",
    highlights: ["Live process video", "Two-sided capability", "Tool-light changeover"],
    featured: true,
  },
  {
    slug: "cantilever-ink",
    name: "Cantilever Printer",
    category: "ink-printing",
    tagline: "Multi-lane high-throughput printing",
    blurb:
      "A cantilevered, multi-lane pocket-carrier-bar printer engineered for open access and fast cleaning between batches — built to keep high-volume lines running.",
    throughput: "250,000 PPH",
    technology: "Rotogravure edible ink",
    sides: "One Sided",
    feed: "Multi-Lane Pocket Carrier Bar",
    datasheet: "/datasheets/cantilever-ink.pdf",
    highlights: ["Open cantilever access", "Multi-lane pocket carriers", "Rapid wash-down"],
  },
  {
    slug: "adjustable-angle-ramp",
    name: "Adjustable Angle Ramp Printer",
    category: "ink-printing",
    tagline: "The highest-throughput printer we build",
    blurb:
      "An adjustable ramp-feed printer that orients and prints at extraordinary speed — the workhorse for the world's largest confectionery and pharmaceutical lines.",
    throughput: "1,200,000 PPH",
    technology: "Rotogravure edible ink",
    sides: "One Sided",
    feed: "Multi-Lane Pocket Carrier Bar",
    datasheet: "/datasheets/adjustable-angle-ramp.pdf",
    highlights: ["Up to 1.2M pieces/hour", "Adjustable feed angle", "Proven at global scale"],
    featured: true,
  },
  {
    slug: "ibm-ink-printer",
    name: "IBM Ink Printer",
    category: "ink-printing",
    tagline: "Bulk-fed flatbed printing",
    blurb:
      "Bulk-hopper, floor-fed flatbed printing for ultra-high volume identification where orientation isn't required — simple, robust and fast.",
    throughput: "300,000 PPH",
    technology: "Flatbed ink",
    sides: "One Sided",
    feed: "Bulk Hopper & Floor Feeder",
    datasheet: "/datasheets/ibm-ink-printer.pdf",
    highlights: ["Bulk hopper feed", "High throughput", "Minimal operator load"],
  },
  {
    slug: "delta-laser",
    name: "Delta Laser Writer",
    category: "laser-marking",
    tagline: "CO2 or UV in one platform",
    blurb:
      "Inkless laser marking on the Delta single-lane platform — switch between CO2 and UV sources to permanently mark virtually any dosage form, one or two-sided.",
    throughput: "70,000 PPH",
    technology: "CO2 or 355nm UV laser",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/delta-laser.pdf",
    highlights: ["Zero ink, zero solvents", "CO2 or UV", "Permanent & tamper-evident"],
    featured: true,
  },
  {
    slug: "delta-uv",
    name: "Delta UV Laser",
    category: "laser-marking",
    tagline: "Cold-marking for sensitive actives",
    blurb:
      "355nm UV laser marking delivers high-contrast marks at low thermal load — ideal for heat-sensitive coatings and delicate softgels.",
    throughput: "70,000 PPH",
    technology: "355nm UV laser",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/delta-uv.pdf",
    highlights: ["Low thermal impact", "High-contrast marks", "Two-sided capable"],
  },
  {
    slug: "delta-co2",
    name: "Delta CO2 Laser",
    category: "laser-marking",
    tagline: "Fast, clean CO2 marking",
    blurb:
      "A CO2 laser writer on the Delta platform for durable, high-speed marking of tablets, capsules and softgels without a single drop of ink.",
    throughput: "60,000 PPH",
    technology: "CO2 laser",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/delta-co2.pdf",
    highlights: ["Consumable-free", "Durable marks", "Two-sided capable"],
  },
  {
    slug: "vip-uv-laser",
    name: "VIP UV Laser",
    category: "laser-marking",
    tagline: "Production UV marking",
    blurb:
      "UV laser marking on the rugged VIP platform — permanent identification for mid-volume lines with the cleanliness benefits of an inkless process.",
    throughput: "60,000 PPH",
    technology: "355nm UV laser",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/vip-uv-laser.pdf",
    highlights: ["Inkless cleanliness", "Mid-volume ready", "Two-sided capable"],
  },
  {
    slug: "ibm-co2-laser",
    name: "IBM CO2 Laser",
    category: "laser-marking",
    tagline: "Bulk-fed high-speed marking",
    blurb:
      "Bulk-hopper CO2 laser marking for the highest-volume identification needs — clean, permanent and consumable-free at 300,000 pieces per hour.",
    throughput: "300,000 PPH",
    technology: "CO2 laser",
    sides: "One Sided",
    feed: "Bulk Hopper & Floor Feeder",
    datasheet: "/datasheets/ibm-co2-laser.pdf",
    highlights: ["Highest-volume marking", "Bulk hopper feed", "Zero ink"],
  },
  {
    slug: "vip-laser-drill",
    name: "VIP Laser Drill",
    category: "laser-drilling",
    tagline: "Two-sided controlled-orifice drilling",
    blurb:
      "CO2 laser drilling of precision delivery orifices for modified-release dosage forms — one or two-sided on the proven VIP single-lane platform.",
    throughput: "60,000 PPH",
    technology: "10.6µm CO2 laser",
    sides: "One or Two-Sided",
    feed: "Single-Lane Carrier Link",
    datasheet: "/datasheets/vip-laser-drill.pdf",
    highlights: ["Precision orifices", "Two-sided drilling", "Repeatable release profile"],
    featured: true,
  },
  {
    slug: "servo-drum-laser-drill",
    name: "Servo Drum Laser Drill",
    category: "laser-drilling",
    tagline: "Multi-lane high-speed drilling",
    blurb:
      "A servo-driven, multi-lane pocket-drum laser drilling system that scales controlled-orifice production to 150,000 pieces per hour with validated consistency.",
    throughput: "150,000 PPH",
    technology: "10.6µm CO2 laser",
    sides: "One or Two-Sided",
    feed: "Multi-Lane Pocket Drum",
    datasheet: "/datasheets/servo-drum-laser-drill.pdf",
    highlights: ["Servo-precise indexing", "Multi-lane scale", "Two-sided drilling"],
  },
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
    datasheet: "/datasheets/arc-roll-cleaning.pdf",
    highlights: ["Hazardous-fume control", "Safety-switch integration", "Programmable cleaning"],
    featured: true,
  },
  {
    slug: "rd-laser-drill",
    name: "R&D Laser",
    category: "rd-lab",
    tagline: "Lab-scale drill & mark",
    blurb:
      "A manual-feed paddle system that brings production laser drilling and marking physics to the lab — perfect for formulation development and logo proofing.",
    throughput: "Up to 25 / paddle",
    technology: "CO2 laser drill & mark",
    sides: "One Sided",
    feed: "Manual Feed Paddle",
    datasheet: "/datasheets/rd-laser-drill.pdf",
    highlights: ["Bench-scale R&D", "Drill and mark", "Same process physics"],
  },
];

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

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsByCategory(slug: MachineCategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function featuredProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getCategory(slug: MachineCategorySlug): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Match a marketing product back to its catalog pricing entry, if present. */
export function priceForProduct(p: Product): number | null {
  const machines = allMachines();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(p.name);
  const hit = machines.find((m) => {
    const n = norm(m.name);
    return n.includes(target) || target.includes(n);
  });
  return hit?.basePrice ?? null;
}

/** Datasheets that have a matching marketing product (for cross-linking). */
export function datasheetsWithProducts() {
  return datasheets.map((d) => ({ datasheet: d, product: getProduct(d.slug) }));
}
