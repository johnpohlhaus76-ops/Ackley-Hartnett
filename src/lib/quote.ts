import type { CatalogItem } from "./types";

export interface QuoteLine {
  partNumber: string | null;
  description: string;
  qty: number;
  unitPrice: number;
  kind: "machine" | "changePart" | "option" | "service" | "crating" | "consumable";
}

export const REP_COMMISSION_RATE = 0.1; // 10% rep commission (per master price list)
export const DISTRIBUTOR_DISCOUNT = 0.1; // ~10% distributor price (per ref. quote E11642)

export interface QuoteTotals {
  subtotal: number;
  distributorTotal: number;
  repCommission: number;
}

export function lineTotal(l: QuoteLine) {
  return l.qty * l.unitPrice;
}

export function quoteTotals(lines: QuoteLine[]): QuoteTotals {
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  return {
    subtotal,
    distributorTotal: subtotal * (1 - DISTRIBUTOR_DISCOUNT),
    repCommission: subtotal * REP_COMMISSION_RATE,
  };
}

export function machineToLines(item: CatalogItem, dimension?: string): QuoteLine[] {
  const lines: QuoteLine[] = [];
  if (item.basePrice != null) {
    lines.push({
      partNumber: item.partNumber,
      description: item.name,
      qty: 1,
      unitPrice: item.basePrice,
      kind: "machine",
    });
  }
  const cp = item.changeParts?.find((c) => c.dimension === dimension) ?? item.changeParts?.[0];
  if (cp && cp.price != null) {
    lines.push({
      partNumber: cp.partNumber,
      description: `Change Parts — ${cp.dimension}`,
      qty: 1,
      unitPrice: cp.price,
      kind: "changePart",
    });
  }
  if (item.machineCrating != null) {
    lines.push({
      partNumber: null,
      description: "Machine Crating",
      qty: 1,
      unitPrice: item.machineCrating,
      kind: "crating",
    });
  }
  return lines;
}

export const QUOTE_NUMBER_PREFIX = "E";
export function nextQuoteNumber() {
  // E-series budgetary quote number (matches existing AH numbering, e.g. E11642)
  return `${QUOTE_NUMBER_PREFIX}${11000 + Math.floor(Math.random() * 8999)}`;
}

export const STANDARD_TERMS = {
  validity: "Pricing is firm for 60 days from the quote date and subject to evaluation of the actual product to be printed.",
  payment: [
    "30% due with order and machine deposit.",
    "60% due after Factory Acceptance Test (FAT) and prior to shipment.",
    "10% balance due Net 30 days after shipment.",
  ],
  leadTime: "Shipment in 18–20 weeks after receipt of a firm Purchase Order and machine deposit.",
  shipping: "ExWorks Langhorne, PA, USA. Exclusive of taxes, duties, and freight.",
  requirements: [
    "100 kg of the actual product to be printed (2 weeks after PO).",
    "4 kg of the actual ink, including manufacturer, formulation and solvent specs (4 weeks after PO).",
    "Artwork for the intended logo to be printed (2 weeks after PO).",
  ],
  notes: [
    "Printing and inspection rates are a function of product size, shape, and surface lubricity.",
    "Print quality is a function of product quality, environmental conditions, and ink consistency.",
    "Equipment is of Ackley Hartnett standard design, pricing, terms and guarantees.",
  ],
};
