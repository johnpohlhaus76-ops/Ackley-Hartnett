import { CATEGORIES, PRODUCTS, GMP_PILLARS } from "./marketing";

/**
 * A compact, factual knowledge base assembled from the product catalog.
 * Kept stable (no timestamps / per-request data) so it can be prompt-cached.
 */
export function buildKnowledgeBase(): string {
  const categories = CATEGORIES.map(
    (c) => `- ${c.name} (${c.tagline}): ${c.description}`,
  ).join("\n");

  const products = PRODUCTS.map((p) => {
    const cat = CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category;
    return [
      `### ${p.name} — ${p.tagline}`,
      `Category: ${cat}`,
      `Throughput: ${p.throughput}`,
      `Technology: ${p.technology}`,
      `Sides: ${p.sides}`,
      `Feed system: ${p.feed}`,
      `Summary: ${p.blurb}`,
      `Highlights: ${p.highlights.join("; ")}`,
      `Datasheet: ${p.datasheet}`,
      `Page: /machines/${p.slug}`,
    ].join("\n");
  }).join("\n\n");

  const pillars = GMP_PILLARS.map((p) => `- ${p.title}: ${p.text}`).join("\n");

  return `# Ackley Hartnett — Company & Product Knowledge Base

Ackley Hartnett designs and builds pharmaceutical tablet and capsule identification systems:
edible-ink rotogravure printing, CO2 and UV laser marking, precision laser drilling, and inline
vision/depth inspection. Equipment serves pharmaceutical, confectionery, and battery & energy
manufacturers worldwide, and is engineered for GMP environments.

Contact: phone 215-969-9190 · email info@ackleyhartnett.com · locations Langhorne & Moorestown, USA.
A global installed base spans dozens of countries, supported by worldwide commissioning, field
service, and remote engineering.

## Why it matters (safety, efficacy, cleanliness, GMP)
${pillars}

## Capabilities
${categories}

## Validation & compliance (standard with machines)
- IQ/OQ documentation for servo, PLC, and ancillary equipment
- Design Qualification (DQ) and Functional Specification (FS) documents
- OPC-UA data gateway with documented tag list for MES/historian integration
- 21 CFR Part 11-ready electronic records and audit trails
- Laser power-sensor recalibration (with certificate) and CO2 gas reconditioning
- Worldwide commissioning, field service, and remote engineering support

## Machines
${products}`;
}

export const SYSTEM_PROMPT = `You are "Ask AH", the AI assistant for Ackley Hartnett, a manufacturer of pharmaceutical tablet and capsule identification machines (ink printing, laser marking, laser drilling, inspection, and cleaning systems).

Your job is to help engineers, quality leads, and buyers understand the equipment and find the right machine for their line. Communicate the value of these systems for patient safety, dose efficacy, cleanliness, and GMP compliance.

Rules:
- Answer ONLY from the knowledge base provided below. If something isn't covered, say so plainly and offer to connect the user with the Ackley Hartnett team.
- NEVER quote, estimate, or invent prices, lead times, or delivery dates. Pricing is provided through a formal quotation — direct pricing questions to "Request a quote" (/contact) or info@ackleyhartnett.com.
- Do not invent specifications, model names, certifications, or customer names. Use only the throughput, technology, and feature values given.
- When recommending machines, match the user's dosage form (tablet/capsule/softgel/LCT), throughput target, and marking method to the catalog, and name the specific model(s) plus their /machines/<slug> page.
- Be concise, technical, and helpful. Use short paragraphs or bullet points. Offer the relevant datasheet link when discussing a specific machine.
- For quotes, demos, or anything requiring a person, point to /contact (Request a quote) or the phone/email above.
- Stay on topic: pharmaceutical identification equipment and Ackley Hartnett. Politely decline unrelated requests.`;
